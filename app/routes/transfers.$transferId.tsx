import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData, Link } from "@remix-run/react"
import clsx from 'clsx'

import invariant from "tiny-invariant"

import { db } from "~/utils/db.server"
import { requireUserId } from "~/utils/session.server"
import { humanSize } from "~/utils/humanSize"
import { humanDate} from "~/utils/humanDate"

import Logo from "~/images/simpletransfer_logo.svg"
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
    <section className="w-full max-w-screen-md mx-auto px-8 sm:px-16 pt-12 pb-8 sm:pb-16 card">
      <header className="flex items-center justify-center mb-8 sm:mb-14">
        <img width="30" height="30" src={Logo} alt="Transfer icon" />
        <h1 className="text-3xl font-semibold text-slate-700 text-center ml-3">Transfer</h1>
      </header>
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
          
          <div className="border-b py-3 flex items-center">
            <div>
              <span className="font-semibold text-slate-700">File:</span>
              <span className="text-slate-500 ml-2 truncate">{data.originalName}</span>
            </div>
            <div className="ml-auto text-sm text-slate-500">
              {humanSize(data.archiveSize)}
            </div>
          </div>
          <div className="border-b py-2">
            <span className="font-semibold text-slate-700">To:</span>
            <ul className="inline-block text-sm ml-1">
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
        <h2 className="font-bold text-slate-700 text-xl mt-8">{data.object}</h2>
        <div className="whitespace-pre-wrap mt-6 mb-8">{data.message}</div>
      </article>
      <footer className="border-t border-slate-900/10 py-3 truncate text-cyan-500">
          <span className="font-semibold text-slate-700">Share link:</span>
          <Link 
            className="ml-2 text-cyan-500 text-sm underline hover:text-cyan-600 focus:text-cyan-600" 
            to={`/downloads/${data.id}`}
          >{`/downloads/${data.id}`}</Link>
      </footer>
    </section>
  )
}