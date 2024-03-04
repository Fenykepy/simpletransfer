import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

import { db } from "~/utils/db.server"
import { requireUserId } from "~/utils/session.server"

import PrimaryLink from "~/components/primaryLink"
import TransfersList from "~/components/transfersList"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request)
  console.log("userId:", userId)

  const transfers = await db.transfer.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc"},
    select: {
      id: true,
      createdAt: true,
      archiveSize: true,
      object: true,
      complete: true,
      active: true,
      recipients: {
        select: {
          email: true
        }
      }
    },
  })

  return json({ transfers })
}

export default function TransfersIndexRoute() {
  const data = useLoaderData<typeof loader>()

  return (
    <main className="w-full max-w-screen-2xl mx-auto bg-white shadow-lg rounded-md px-3 sm:px-16 pt-12 pb-8 sm:pb-16 border border-slate-900/10">
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-semibold text-slate-700">Transfers</h1>
        <PrimaryLink to="new" text="New Transfer" className="mb-auto ml-auto" />
      </div>
      <TransfersList transfers={data.transfers} />
    </main>
  )
}
