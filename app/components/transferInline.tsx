import { Link } from "@remix-run/react"

import type { InlineTransfer } from "./transfersList"
import { humanSize } from "~/utils/humanSize"
import { humanDate} from "~/utils/humanDate"
import Logo from "~/images/simpletransfer_logo.svg"
import TransferCompleteIndicator from "~/components/transferCompleteIndicator"
import TransferActiveIndicator from "~/components/transferActiveIndicator"

interface InlineTransferProps {
  transfer: InlineTransfer
}

export default function TransferInline({ transfer }: InlineTransferProps) {
  const { id, createdAt, archiveSize, subject, complete, active, recipients} = transfer
  const emailString = recipients.map(recipient => recipient.email).join(", ")
  const opacity = active ? "" : " opacity-50"
  return (
    <li className="hover:bg-slate-200 group">
      <Link to={id}>
        <div className="flex items-center flex-wrap lg:flex-nowrap mx-5 sm:mx-8 py-5 border-b border-slate-900/10i group-last:border-none">
          <div className={"inline-flex" + opacity}>
            <img width="40" height="40" src={Logo} alt="Transfer icon" />
            <div className="mx-3 truncate min-w-48">
              <p className="text-base font-medium text-slate-900 truncate">{subject}</p>
              <p className="text-sm text-slate-500 truncate">{emailString}</p>
            </div>
          </div>
          <div className="inline-flex gap-x-3 items-center mx-auto my-5 lg:ml-auto lg:mr-5 lg:my-0">
            <TransferActiveIndicator active={active} />
            <TransferCompleteIndicator complete={complete} />
          </div>
          <div className={"flex w-full text-nowrap justify-between lg:flex-col lg:w-32 lg:text-right" + opacity}>
            <div className="text-sm text-slate-500 lg:order-2">{humanDate(createdAt)}</div>
            <div className="text-sm text-slate-500 lg:order-1">{humanSize(archiveSize)}</div>
          </div>
        </div>
      </Link>
    </li>
  )
}