import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node"
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

import { getUser } from "~/utils/session.server"
import styles from "./tailwind.css?url"
import MainHeader from "~/components/mainHeader"
import MessageSection from "./components/messageSection"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request)

  return json({ user: user })
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: "https://rsms.me/inter/inter.css"},
]


export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>()
  
  console.log("data", data)
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <title>SimpleTransfer</title>
        <Links />
      </head>
      <body className="bg-slate-50">
        <MainHeader user={data.user} />
        <main className="px-4 sm:px-16 py-5 sm:py-10">
          {children}
        </main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}



export function ErrorBoundary() {
  const error = useRouteError()
  console.error(error)
  let message = "Sorry, an unexpected error occured…"

  if (isRouteErrorResponse(error)) {
    if (error.status === 400) {
      message = "Sorry, you're not allowed to do that…"
    }
    if (error.status === 403) {
      message = "Are you sure this is yours?"
    }
    if (error.status === 404) {
      message = "What the heck? this page cannot be found…"
    }
  }

  return (
    <MessageSection title="Oups…">
      <article className="text-slate-700">
        {message}
      </article>
    </MessageSection>
  )
}


