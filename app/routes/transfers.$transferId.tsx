import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import clsx from 'clsx'

import invariant from "tiny-invariant"

import { db } from "~/utils/db.server"
import { requireUserId } from "~/utils/session.server"
import { humanSize } from "~/utils/humanSize"
import { humanDate} from "~/utils/humanDate"

import Logo from "~/images/simpletransfer_logo.svg"

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
    <main className="w-full max-w-screen-md mx-auto bg-white shadow-lg rounded-md px-3 sm:px-16 pt-12 pb-8 sm:pb-16 border border-slate-900/10">
      <h1 className="text-3xl font-semibold text-slate-700 text-center mb-8">Transfer</h1>
      <article>
        <header>
          <div className="flex border-b border-slate-900/10 flex-wrap py-2">
            <div className="flex items-center">
              <img width="30" height="30" src={Logo} alt="Transfer icon" />
              <h2 className="font-bold text-slate-700 text-lg mx-2 sm:mx-3">{data.object}</h2>
            </div>
            <div className="text-slate-500 text-sm ml-auto mr-auto sm:mr-0 flex items-center">{humanDate(data.createdAt)}</div>
          </div>
          
          <div className="border-b py-3 flex items-center">
            <div>
              <span className="font-semibold text-slate-900">File: </span>
              <span className="text-slate-500">{data.originalName}</span>
            </div>
            <div className="ml-auto text-sm text-slate-500">
              {humanSize(data.archiveSize)}
            </div>
          </div>
          <div className="border-b py-2">
            <span className="font-semibold text-slate-900">To:</span>
            <ul className="inline-block text-sm">
              {data.recipients.map(recipient => (
                <li 
                  className={clsx(
                    "inline-block rounded-full border ml-1 my-1 px-4 py-0.5 text-center cursor-default",
                    {
                      "bg-green-50 border-green-100 text-green-600": recipient.complete,
                      "bg-cyan-50 border-cyan-100 text-cyan-600": !recipient.complete,
                      "bg-pink-50 border-pink-100 text-pink-600": !recipient.active,
                    }
                  )}
                  title={recipient.complete ? "Downloaded" : "Not downloaded yet"}
                >{recipient.email}</li>
              ))}
            </ul>
          </div>
        </header>
        <div className="whitespace-pre-wrap py-8">{data.message}</div>
      </article>
    </main>
  )
}