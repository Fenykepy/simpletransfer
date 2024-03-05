import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData, Link } from "@remix-run/react"
import clsx from 'clsx'

import invariant from "tiny-invariant"

import { db } from "~/utils/db.server"
import { requireUserId } from "~/utils/session.server"
import { humanSize } from "~/utils/humanSize"
import { humanDate} from "~/utils/humanDate"

import MessageSection from "~/components/messageSection"
import EmailChip from "~/components/emailChip"
import TransferActiveIndicator from "~/components/transferActiveIndicator"
import TransferCompleteIndicator from "~/components/transferCompleteIndicator"

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.transferId, "Missing transferId param")
  const userId = await requireUserId(request)
  const transfer = await db.transfer.findUnique({
    where: { id: params.transferId },
    select: {
      id: true,
      createdAt: true,
      archiveSize: true,
      archiveName: true,
      originalName: true,
      object: true,
      message: true,
      complete: true,
      active: true,
      userId: true,
      recipients: {
        select: {
          email: true,
          complete: true,
          active: true,
        },
      },
    },
  })
  if (!transfer) {
    throw new Response("Transfer not found…", { status: 404 })
  }
  if (transfer.userId !== userId) {
    throw new Response("Access forbidden", { status: 403 })
  }

  return json({ ...transfer })
}

export default function TransferRoute() {
  const data = useLoaderData<typeof loader>()

  return (
    <MessageSection title="Transfer">
      <article>
        <header>
          <div className="flex border-b border-slate-900/10 flex-wrap py-2 flex-col sm:flex-row">
            <div className="flex items-center gap-x-3 mx-auto mt-3 sm:mx-0 sm:mt-0 order-2 sm:order-1">
              <TransferActiveIndicator active={data.active} />
              <TransferCompleteIndicator complete={data.complete} />
            </div>
            <div className="text-slate-500 text-sm ml-auto mr-auto sm:mr-0 flex items-center order-1 sm:order-2">
              {humanDate(data.createdAt)}
            </div>
          </div>
          
          <div className="border-b border-slate-900/10 py-3 flex items-center">
            <div>
              <span className="font-semibold text-slate-700">File:</span>
              <span className="text-slate-500 ml-2 truncate">{data.originalName}</span>
            </div>
            <div className="ml-auto text-sm text-slate-500">
              {humanSize(data.archiveSize)}
            </div>
          </div>
          <div className="border-b border-slate-900/10 py-2">
            <span className="font-semibold text-slate-700">To:</span>
            <ul className="inline-block text-sm ml-1">
              {data.recipients.map(recipient => (
                <EmailChip
                  email={recipient.email}
                  title={recipient.complete ? "Downloaded" : "Not downloaded yet"}
                  color={!recipient.active ? "pink" : recipient.complete ? "green" : "cyan"}
                />
              ))}
            </ul>
          </div>
        </header>
        <h2 className="font-bold text-slate-700 text-xl mt-8">{data.object}</h2>
        <div className="whitespace-pre-wrap mt-6 mb-8">{data.message}</div>
        <footer className="border-t border-slate-900/10 py-3 truncate text-cyan-500">
            <span className="font-semibold text-slate-700">Share link:</span>
            <Link 
              className="ml-2 text-cyan-500 text-sm underline hover:text-cyan-600 focus:text-cyan-600" 
              to={`/downloads/${data.id}`}
            >{`/downloads/${data.id}`}</Link>
        </footer>
      </article>
    </MessageSection>
  )
}