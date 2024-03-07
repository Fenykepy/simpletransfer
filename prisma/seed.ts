import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const db = new PrismaClient()

async function seed() {
  const passwordHash = await bcrypt.hash("foobar", 10)
  const fenykepy = await db.user.create({
    data: {
      email: "fenykepy@fenykepy.com",
      passwordHash,
      signature: "--\nFenykepy\nfenykepy@fenykepy.com",
    }
  })
  for (let transfer of transfers) {
    const { recipients, ...rest } = transfer
    const transferData = { userId: fenykepy.id, ...rest }
    const newTransfer = await db.transfer.create({ data: transferData })

    for (let recipient of recipients) {
      const recipientData = { transferId: newTransfer.id, ...recipient }
      await db.recipient.create({ data: recipientData })
    }
  }
}

seed()

const transfers =  [
  {
    originalName: "last_weekend_pictures",
    archiveName: "2024-03-02_348204°3948039",
    archiveSize: 78390573,
    subject: "Our last weekend pictures",
    message: "Hi!\nHere are our last weekend pictures.\nEnjoy!",
    complete: false,
    active: true,
    recipients: [
      { email: "tom@example.com", complete: false, active: true},
      { email: "tina@example.com", complete: false, active: true},
    ],
  },
  {
    originalName: "last_christmas_pictures",
    archiveName: "2023-12-25_348204°3948039",
    archiveSize: 7839057,
    subject: "Our last christmas pictures",
    message: "Hi!\nHere are our last christmas pictures.\nEnjoy!",
    complete: true,
    active: false,
    recipients: [
      { email: "bill@example.com", complete: true, active: false},
    ],
  },
]