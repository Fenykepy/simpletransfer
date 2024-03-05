import { Link } from "@remix-run/react"

export interface LinkProps {
  text: string
  to: string
  className?: string
}

// A Link with a primary button look
export default function PrimaryLink({ text, to, className }: LinkProps) {
  return (
    <Link
      to={to}
      className={"leading-5 text-sm font-semibold rounded-md px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white text-center" + " " + className}
    >{text}</Link>
  )
}