import { Link } from "@remix-run/react"
import clsx from 'clsx'

import type { InlineTransfer } from "./transfersList"
import { humanSize } from "~/utils/humanSize"
import { humanDate} from "~/utils/humanDate"
import Logo from "~/images/simpletransfer_0.2.svg"

interface InlineTransferProps {
  transfer: InlineTransfer
}

export default function InlineTransfer({ transfer }: InlineTransferProps) {
  const { id, createdAt, archiveSize, object, complete, active, recipients} = transfer
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
        <div className="flex gap-x-1 items-center ml-auto mr-5 text-sm *:inline-block *:rounded-full *:border *:w-32 *:px-4 *:py-1 *:text-center">
          {!active ? (
            <div className="bg-pink-50 border-pink-100 text-pink-600">Inactive</div>
          ) : null}
          <div
            className={clsx({
              "bg-green-50 border-green-100 text-green-600": complete,
              "bg-cyan-50 border-cyan-100 text-cyan-600": complete === false,
            })}
            title={complete ? "All recipents downloaded it" : "Some recipients did not download it yet"}
          >{complete ? "Complete" : "Pending"}</div>
        </div>
        <div className="text-nowrap w-48 text-right">
          <div className="text-sm text-slate-500">{humanSize(archiveSize)}</div>
          <div className="text-sm text-slate-500">{humanDate(createdAt)}</div>
        </div>
      </Link>
    </li>
  )
}