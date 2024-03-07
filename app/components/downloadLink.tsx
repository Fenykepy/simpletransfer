import { Link } from "@remix-run/react"
import WhiteArrow from "~/images/white_arrow.svg"

interface DownloadLinkProps {
  to: string
  className?: string
}

export default function DownloadLink({ to, className}: DownloadLinkProps) {
  return (
    <Link
      reloadDocument
      to={to}
      className={"flex text-sm justify-center items-center font-semibold rounded-md bg-cyan-500 hover:bg-cyan-600 text-white px-6" + " " + className}
    >
      <div className="mr-2 py-3">Download</div>
      <img width="12" height="12" src={WhiteArrow} alt="Transfer icon" />
    </Link>
  )
}
