import { Outlet } from "@remix-run/react"

export default function TransfersRoute() {
  return (
    <div>
      <h1 className="text-3xl font-bold underline">Transfers</h1>
      <main>
        <Outlet />
      </main>
    </div>
  )
}