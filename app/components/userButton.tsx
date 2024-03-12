import { Link } from "@remix-run/react"
import { useState } from "react"

import LogoutButton from "~/components/logoutButton"

interface UserButtonProps {
  user: {
    email: string,
    id: string,
  } | null
}

export default function UserButton({ user }: UserButtonProps) {
  const [open, setOpen] = useState(true)

  if (!user) return null

  const stateClass = open ? " block" : " hidden"
  return (
    <div className="flex ml-auto truncate items-stretch">
      <button
        onClick={() => setOpen(!open)}
        className="text-slate-500 flex text-sm items-center hover:bg-slate-100 px-1 sm:px-5 py-2"
      >{ user.email }</button>
      <div
        className={"overlay" + stateClass}
        onClick={() => setOpen(false)}
      >
        <ul className="card w-auto min-w-48 mt-20 mr-8 float-right py-2">
          <li>
            <LogoutButton
              className="px-5 py-2 hover:bg-slate-100 text-slate-700 w-full text-left"
            />
          </li>
        </ul>
      </div>
    </div>
  )
}