import type { LoaderFunctionArgs } from "@remix-run/node"
import { createReadableStreamFromReadable } from "@remix-run/node"

import invariant from "tiny-invariant"

import { db } from "~/utils/db.server"
import { streamArchive } from "~/utils/filesystem.server"

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.downloadId, "Missing downloadId param")

  // we search a recipient or a transfer with parameters id
  let recipient = await db.recipient.findUnique({
    where: {
      id: params.downloadId,
      active: true,
    },
    select: {
      id: true,
      transferId: true,
      downloadDates: true,
    }
  })
  let transferId = recipient ? recipient.transferId : params.downloadId
  let transfer = await db.transfer.findUnique({
    where: {
      id: transferId,
      active: true,
    },
    select: {
      originalName: true,
      archiveName: true,
      downloadDates: true,
      complete: true,
      user: {
        select: { email: true },
      },
    }
  })

  if (!transfer) {
    throw new Response("Transfer not found…", { status: 404 })
  }

  const stream = await streamArchive(transfer.archiveName)
  stream.on("end", async () => {
    try {
      const date = new Date()
      let transferComplete = null
      if (recipient) {
        // if we have a recipient, we update its complete and download dates
        const downloadDates = JSON.parse(recipient.downloadDates)
        downloadDates.push(date.toISOString())
        await db.recipient.update({
          where: { id: recipient.id },
          data: {
            complete: true,
            downloadDates: JSON.stringify(downloadDates),
          },
        })
        // we set transfer complete if necessary
        if (!transfer!.complete) { 
          const recipients = await db.recipient.findMany({
            where: { transferId: transferId },
            select: { complete: true },
          })
          if (!recipients.some(recipient => recipient.complete === false)) {
            await db.transfer.update({
              where: { id: transferId },
              data: { complete: true },
            })
          }
        }
      } else { // download from direct link, update transfer downloadDates
        const downloadDates = JSON.parse(transfer!.downloadDates)
        downloadDates.push(date.toISOString())
        await db.transfer.update({
          where: { id: transferId },
          data: { downloadDates: JSON.stringify(downloadDates)},
        })
      }
      
      // TODO send email to sender
    
    } catch (error) {
      console.error(error)
    }

  })

  console.log('return response')
  return new Response(createReadableStreamFromReadable(stream), {
    headers: {
      "Content-Type": "application/zip",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    }
  })
}