import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData, Link } from "@remix-run/react"

import invariant from "tiny-invariant"

import { db } from "~/utils/db.server"
import { requireUserId } from "~/utils/session.server"

import MessageSection from "~/components/messageSection"
import EmailChip from "~/components/emailChip"
import TransferFileField from "~/components/transferFileField"
import TransferObjectMessageField from "~/components/transferObjectMessageField"
import TransferActiveIndicator from "~/components/transferActiveIndicator"
import TransferCompleteIndicator from "~/components/transferCompleteIndicator"

// Private endpoint
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
    <MessageSection title="Transfer" date={data.createdAt}>
      <article>
        <header>
          <div className="flex flex-col *:ml-auto mb-5 sm:mb-10 justify-end gap-3">
            <TransferActiveIndicator active={data.active} />
            <TransferCompleteIndicator complete={data.complete} />
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
          
          <TransferFileField
            originalName={data.originalName}
            archiveSize={data.archiveSize}
          />


        </header>
        
        <TransferObjectMessageField 
          object={data.object}
          message={data.message}
        />

        <footer className="py-3 truncate text-cyan-500">
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