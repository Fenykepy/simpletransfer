
import { Link } from "@remix-run/react"

import Logo from "~/images/simpletransfer_logo.svg"
import UserButton from "~/components/userButton"

interface MainHeaderProps {
  user?: {
    email: string,
    id: string,
  }
}

export default function MainHeader({ user }: MainHeaderProps) {
  return (
    <header className="flex px-8 sticky top-0 z-40 w-full border-b border-slate-900/10 bg-white">
      <Link to="/transfers" className="flex hover:opacity-80">
        <img className="inline-block mr-3" width="35" height="35" src={Logo} alt="SimpleTransfer logo" />
        <h1
          className="my-4 text-2xl font-semibold text-slate-700 hidden sm:inline-block"
        >SimpleTransfer</h1>
        <h1
          title="SimpleTransfer" 
          className="inline-block my-4 text-2xl font-semibold text-slate-700 sm:hidden"
        >ST</h1>
      </Link>
      <UserButton user={user} />
    </header>
  )
}