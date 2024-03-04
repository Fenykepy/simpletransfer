import { Link } from "@remix-run/react"
import clsx from 'clsx'

import type { InlineTransfer } from "./transfersList"
import { humanSize } from "~/utils/humanSize"
import { humanDate} from "~/utils/humanDate"
import Logo from "~/images/simpletransfer_logo.svg"
import TransferCompleteIndicator from "~/components/transferCompleteIndicator"
import TransferActiveIndicator from "~/components/transferActiveIndicator"

interface InlineTransferProps {
  transfer: InlineTransfer
}

export default function InlineTransfer({ transfer }: InlineTransferProps) {
  const { id, createdAt, archiveSize, object, complete, active, recipients} = transfer
  const emailString = recipients.map(recipient => recipient.email).join(", ")
  return (
    <li className={clsx(
      "bg-white hover:bg-slate-200 mt-2 first:mt-0 rounded p-5 lg:mt-1 lg:p-3",
      {
        "opacity-60": active === false,
      }
    )}>
      <Link to={id} className="flex  items-center flex-wrap lg:flex-nowrap">
        <div className="inline-flex">
          <img width="40" height="40" src={Logo} alt="Transfer icon" />
          <div className="mx-3 truncate min-w-48">
            <p className="text-sm font-medium text-slate-900 truncate">{object}</p>
            <p className="text-sm text-slate-500 truncate">{emailString}</p>
          </div>
        </div>
        <div className="inline-flex gap-x-3 items-center mx-auto my-5 lg:ml-auto lg:mr-5 lg:my-0">
          <TransferActiveIndicator active={active} />
          <TransferCompleteIndicator complete={complete} />
        </div>
        <div className="flex w-full text-nowrap justify-between lg:flex-col lg:w-48 lg:text-right">
          <div className="text-sm text-slate-500 lg:order-2">{humanDate(createdAt)}</div>
          <div className="text-sm text-slate-500 lg:order-1">{humanSize(archiveSize)}</div>
        </div>
      </Link>
    </li>
  )
}