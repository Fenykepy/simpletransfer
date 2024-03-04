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
      "bg-white hover:bg-slate-200 mt-2 first:mt-0 rounded p-5",
      {
        "opacity-60": active === false,
      }
    )}>
      <Link to={id} className="flex  items-center flex-wrap lg:flex-nowrap sm:bg-orange-100 md:bg-lime-100 lg:bg-red-100">
        <div className="inline-flex">
          <img width="40" height="40" src={Logo} alt="Transfer icon" />
          <div className="mx-3 truncate min-w-48">
            <p className="text-sm font-medium text-slate-900 truncate">{object}</p>
            <p className="text-sm text-slate-500 truncate">{emailString}</p>
          </div>
        </div>
        <div className="inline-flex gap-x-3 items-center mx-auto my-5 lg:ml-auto lg:mr-5 lg:my-0 text-sm *:inline-block *:rounded-full *:border *:w-32 *:px-4 *:py-1 *:text-center">
          <div 
            className={clsx({
              "bg-pink-50 border-pink-100 text-pink-600": !active,
              "bg-cyan-50 border-cyan-100 text-cyan-600": active,
            })}
          >{active ? "Active" : "Inactive"}</div>
          <div
            className={clsx({
              "bg-green-50 border-green-100 text-green-600": complete,
              "bg-yellow-50 border-yellow-100 text-yellow-500": complete === false,
            })}
          >{complete ? "Complete" : "Pending"}</div>
        </div>
        <div className="flex w-full text-nowrap justify-between">
          <div className="text-sm text-slate-500">{humanDate(createdAt)}</div>
          <div className="text-sm text-slate-500">{humanSize(archiveSize)}</div>
        </div>
      </Link>
    </li>
  )
}