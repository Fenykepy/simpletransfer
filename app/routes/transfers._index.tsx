import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"

import { db } from "~/utils/db.server"
import { requireUserId } from "~/utils/session.server"


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request)
  console.log("userId:", userId)

  const transfers = await db.transfer.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc"},
    select: {
      createdAt: true,
      originalName: true,
      archiveSize: true,
      object: true,
      recipients: true,
      complete: true,
      active: true,
    }
  })

  return json({ transfers })
}

export default function TransfersIndexRoute() {
  const data = useLoaderData<typeof loader>()

  return (
    <div>
      <h1 className="text-3xl font-bold underline">Transfers</h1>
      <ul>
        <li>First transfer</li>
        <li>Second transfer</li>
      </ul>
    </div>
  )
}
