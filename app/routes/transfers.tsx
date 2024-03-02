import { Outlet } from "@remix-run/react"

export default function TransfersRoute() {
  return (
    <div>
      <main className="max-w-3xl md:container md:mx-auto">
        <Outlet />
      </main>
    </div>
  )
}