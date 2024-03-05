import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

import invariant from "tiny-invariant"

import { db } from "~/utils/db.server"
import { humanDate} from "~/utils/humanDate"

import MessageSection from "~/components/messageSection"
import EmailChip from "~/components/emailChip"
import TransferFileField from "~/components/transferFileField"
import TransferObjectMessageField from "~/components/transferObjectMessageField"
import PrimaryLink from "~/components/primaryLink"

// Public Endpoint
export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.downloadId, "Missing downloadId param")

  // we search a recipient or a transfer with parameters id
  let recipient = await db.recipient.findUnique({
    where: { id: params.downloadId },
    select: {
      transferId: true,
      active: true,
    }
  })
  let transferId = recipient ? recipient.transferId : params.downloadId
  let transfer = await db.transfer.findUnique({
    where: { id: transferId },
    select: {
      createdAt: true,
      archiveSize: true,
      originalName: true,
      object: true,
      message: true,
      active: true,
      user: {
        select: {
          email: true,
        }
      }
    }
  })
  if (!transfer) {
    throw new Response("Transfer not found…", { status: 404 })
  }
  if (!transfer.active || (recipient && !recipient.active)) {
    throw new Response("Transfer inactive…", { status: 403 })
  }

  // TODO if we have user templates, we return html template
  return json({ id: params.id, transfer, recipient })
}

// Public (with known recipient or transfer id) transfer detail
export default function DownloadRoute() {
  const data = useLoaderData<typeof loader>()

  return (
    <MessageSection title="Transfer" date={data.transfer.createdAt}>
      <article>
        <header>
          <div className="border-b border-slate-900/10 py-2">
            <span className="font-semibold text-slate-700 mr-1">From:</span>
            <EmailChip
              email={data.transfer.user.email}
            />
          </div>

          <TransferFileField
            originalName={data.transfer.originalName}
            archiveSize={data.transfer.archiveSize}
          />
        </header>
        
        <TransferObjectMessageField 
          object={data.transfer.object}
          message={data.transfer.message}
        />
        
        <footer className="flex mt-5">
          <PrimaryLink 
            text="Download"
            to={`/stream/${data.id}`}
            className="mx-auto min-w-52"
          />
        </footer>
      </article>
    </MessageSection>
  )
}
