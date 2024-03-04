import { Link } from "@remix-run/react"
import clsx from 'clsx'

import { humanSize } from "~/utils/humanSize"
import { humanDate} from "~/utils/humanDate"
import Logo from "~/images/simpletransfer_0.2.svg"

interface RecipientEmail {
  email: string
}

interface InlineTransferProps {
  id: string
  createdAt: string
  object: string
  archiveSize: number
  recipients: Array<RecipientEmail>
  complete: boolean
  active: boolean
}

export default function InlineTransfer({ id, createdAt, object, archiveSize, recipients, complete, active }: InlineTransferProps) {
  const emailString = recipients.map(recipient => recipient.email).join(", ")
  return (
    <li className={clsx(
      "bg-white hover:bg-slate-200 mt-1 first:mt-0 rounded p-3",
      {
        "opacity-60": active === false,
      }
    )}>
      <Link to={id} className="flex">
        <img width="40" height="40" src={Logo} alt="Transfer icon" />
        <div className="mx-3">
          <p className="text-sm font-medium text-slate-900">{object}</p>
          <p className="text-sm text-slate-500 truncate">{emailString}</p>
        </div>
        <div className="ml-auto mr-5 text-sm *:inline-block *:rounded-full *:border *:px-2 *: py-0.5 *:text-center">
          <div className={clsx({
            "bg-cyan-50 border-cyan-100 text-cyan-600": active,
            "bg-pink-50 border-pink-100 text-pink-600": active === false,
          })}>{active ? "Active" : "Inactive"}</div>
          <div
            className={clsx({
              "bg-emerald-50 border-emarald-100 text-emerald-600": complete,
              "bg-slate-50 border-slate-100 text-slate-500": complete === false,
            })}
            title={complete ? "All recipents downloaded it" : "Some recipients did not download it yet"}
          >{complete ? "Complete" : "Pending"}</div>
        </div>
        <div className="text-nowrap">
          <div className="text-sm text-slate-500 text-right">{humanSize(archiveSize)}</div>
          <div className="text-sm text-slate-500">{humanDate(createdAt)}</div>
        </div>
      </Link>
    </li>
  )
}