import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
 } from "@remix-run/react"

import invariant from "tiny-invariant"

import { db } from "~/utils/db.server"

import MessageSection from "~/components/messageSection"
import EmailChip from "~/components/emailChip"
import TransferFileField from "~/components/transferFileField"
import TransferSubjectMessageField from "~/components/transferSubjectMessageField"
import DownloadLink from "~/components/downloadLink"

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
      subject: true,
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
  return json({ id: params.downloadId, transfer, recipient })
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
        
        <TransferSubjectMessageField 
          subject={data.transfer.subject}
          message={data.transfer.message}
        />
        
        <footer className="flex mt-5">
          <DownloadLink to={`/stream/${data.id}`} className="mx-auto min-w-52" />
        </footer>
      </article>
    </MessageSection>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  console.error(error)
  let message = "Sorry, an unexpected error occured…"

  if (isRouteErrorResponse(error)) {
    if (error.status === 403) {
      message = "Sorry, this transfer has expired…"
    }
    if (error.status === 404) {
      message = "Sorry, this transfer cannot be found…"
    }
  }

  return (
    <MessageSection title="Transfer">
      <article className="text-slate-700">
        {message}
      </article>
    </MessageSection>
  )
}
