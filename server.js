import { createRequestHandler } from "@remix-run/express";
import { installGlobals } from "@remix-run/node";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import fs from "fs";

installGlobals();

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? undefined
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      );

const remixHandler = createRequestHandler({
  build: viteDevServer
    ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
    : await import("./build/server/index.js"),
});

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// handle asset requests
if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  // Vite fingerprints its assets so we can cache forever.
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" })
  );
}

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("build/client", { maxAge: "1h" }));

app.use(morgan("tiny"));

// handle SSR requests
app.all("*", remixHandler);




const PORT = process.env.PORT || 3000;

function resetSocket(sock) {
  /*
   * We first delete socket if file exists,
   * as it's not automatically done at shutdown,
   * else it throws a error
   */
  try {
    if (fs.existsSync(sock)) {
      console.log("Socket file exists, delete it.")
      fs.unlinkSync(sock)
    }
  } catch (e) {
    console.log('failed to reset socket.')
    throw e
  }
}

if (typeof PORT === "string") {
  /*
   * If we use a socket, first delete file if
   * it exists
   */
  resetSocket(PORT)
}

app.listen(PORT, (error) => {
  if (error) {
    console.log(error)
  } else {
    // we give rights to socket else nginx can't use it
    // ParseInt PORT because it's always a string when it comes from .env
    if (isNaN(parseInt(PORT)) && fs.lstatSync(PORT).isSocket()) {
      console.log('change socket mode')
      fs.chmodSync(PORT, '777');
    }

    console.log(`Express server listening at http://localhost:${PORT}`)
  }
})
