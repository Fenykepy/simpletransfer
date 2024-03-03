import { Outlet } from "@remix-run/react"

export default function TransfersRoute() {
  return (
    <div>
      <main className="w-full max-w-3xl md:container md:mx-auto bg-slate-100">
        <Outlet />
      </main>
    </div>
  )
}