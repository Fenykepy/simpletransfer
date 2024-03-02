import type { LinksFunction } from "@remix-run/node"
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"

import styles from "./tailwind.css?url"

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <title>SimpleTransfer</title>
        <Links />
      </head>
      <body>
        <header className="py-4 px-8 sticky top-0 z-40 w-full border-b border-slate-900/10">
          <h1 className="text-2xl font-semibold">SimpleTransfer</h1>
        </header>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
