import fs from "node:fs/promises"
import nodemailer from "nodemailer"
import Handlebars from "handlebars"

import { db } from "./db.server"
import { humanSize } from "./humanSize"
import SMTPTransport from "nodemailer/lib/smtp-transport"
import { Recipient, Transfer } from "@prisma/client"

let subject_prefix = process.env.MAIL_SUBJECT_PREFIX || ""
let mailConfig: any
let sender: string

if (process.env.NODE_ENV === "production") {
  sender = process.env.MAIL_SENDER || ""
  mailConfig = {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || "", 10),
    secure: parseInt(process.env.MAIL_SECURE || "", 10),
    auth: {
      user: process.env.MAIL_AUTH_USER,
      pass: process.env.MAIL_AUTH_PASS,
    },
  }
} else {
  sender = process.env.DEV_MAIL_AUTH_USER || ""
  mailConfig = {
    host: process.env.DEV_MAIL_HOST,
    port: parseInt(process.env.DEV_MAIL_PORT || "", 10),
    auth: {
      user: process.env.DEV_MAIL_AUTH_USER,
      pass: process.env.DEV_MAIL_AUTH_PASS,
    },
  }
}

function getTransferLink(origin: string, id: string) {
  return `${origin}/transfers/${id}`
}

function getDownloadLink(origin: string, id: string) {
  return `${origin}/downloads/${id}`
}

const mailer = nodemailer.createTransport(mailConfig)

interface SendMailParams {
  to: string,
  subject: string,
  text: string,
  replyTo?: string,
}

function sendMail({ to, subject, text, replyTo }: SendMailParams) {
  return mailer.sendMail(
    {
      from: sender,
      replyTo,
      to,
      subject: subject_prefix + subject,
      text,
    },
  )
}


interface RecipientNewTransferEmailParams {
  senderEmail: string,
  recipientEmail: string,
  downloadId: string,
  origin: string,
  subject: string,
  message: string,
  originalName: string,
  archiveSize: number,
}

const recipientEmailTextRaw = await fs.readFile('./app/templates/recipientEmail.txt', 'utf-8')
const recipientEmailTextTemplate = Handlebars.compile(recipientEmailTextRaw)

// Send email to recipient on success new transfer
function sendRecipientNewTransferEmail(params: RecipientNewTransferEmailParams) {
  const subject = `"${params.senderEmail}" sent you "${params.subject}"`
  const text = recipientEmailTextTemplate({
    subject,
    filename: params.originalName,
    filesize: humanSize(params.archiveSize),
    message: params.message,
    downloadLink: getDownloadLink(params.origin, params.downloadId),
  })
  /*
  const text = `${subject}

  File: ${params.originalName}, ${humanSize(params.archiveSize)}
  Message:
  ${params.message}

  Download link:
  ${params.origin}/downloads/${params.downloadId}
  `
  */
  return sendMail({ to: params.recipientEmail, subject, text, replyTo: params.senderEmail })
}

interface SenderNewTransferEmailParams {
  senderEmail: string,
  successEmails: Array<string>,
  errorEmails: Array<string>,
  transferId: string,
  origin: string,
  subject: string,
  message: string,
  originalName: string,
  archiveSize: number,
}

const senderEmailTextRaw = await fs.readFile('./app/templates/senderEmail.txt', 'utf-8')
const senderEmailTextTemplate = Handlebars.compile(senderEmailTextRaw)

// Send email to user on success new transfer
async function sendSenderNewTransferEmail(params: SenderNewTransferEmailParams) {
  const errors = params.errorEmails.length > 0
  const subject = `"${params.subject}" ${errors ? "sent with errors..." : "successfully sent!"}`
  const text = senderEmailTextTemplate({
    subject,
    to: params.successEmails.join(", "),
    errors: errors ? params.errorEmails.join(", ") : undefined,
    filename: params.originalName,
    filesize: humanSize(params.archiveSize),
    message: params.message,
    transferLink: getTransferLink(params.origin, params.transferId),
    shareLink: getDownloadLink(params.origin, params.transferId),
  })

  return sendMail({ to: params.senderEmail, subject, text })
}

// Send emails to user and recipients on success new transfer
export async function sendNewTransferEmails(transferId: string, origin: string) {
  const transfer = await db.transfer.findUnique({
    where: { id: transferId },
    select: {
      originalName: true,
      archiveSize: true,
      subject: true,
      message: true,
      user: {
        select: { email: true },
      },
      recipients: {
        select: { email: true, id: true },
      }
    }
  })
  if (!transfer) { throw new Error("Transfer not found") }
  let successEmails = []
  let errorEmails = []

  for (let recipient of transfer.recipients) {
    try {
      await sendRecipientNewTransferEmail({
        senderEmail: transfer.user.email,
        recipientEmail: recipient.email,
        downloadId: recipient.id,
        origin,
        subject: transfer.subject,
        message: transfer.message,
        originalName: transfer.originalName,
        archiveSize: transfer.archiveSize,
      })
      successEmails.push(recipient.email)
    } catch(error) {
      console.error(error)
      errorEmails.push(recipient.email)
    }
  }

  sendSenderNewTransferEmail({
    senderEmail: transfer.user.email,
    successEmails,
    errorEmails,
    transferId,
    origin,
    subject: transfer.subject,
    message: transfer.message,
    originalName: transfer.originalName,
    archiveSize: transfer.archiveSize,
  })
}


interface SuccessDownloadEmailParams {
  senderEmail: string,
  recipientEmail?: string,
  transferId: string,
  origin: string,
  subject: string,
  message: string,
  originalName: string,
  archiveSize: number,
}

// Send email to user on success recipient download
export async function sendSuccessDownloadEmail(params: SuccessDownloadEmailParams) {
  let subject: string
  if (params.recipientEmail) {
    subject = `${params.recipientEmail} downloaded "${params.subject}"`
  } else {
    subject = `Someone downloaded "${params.subject}"`
  }
  const text = senderEmailTextTemplate({
    subject,
    filename: params.originalName,
    filesize: humanSize(params.archiveSize),
    message: params.message,
    transferLink: getTransferLink(params.origin, params.transferId),
    shareLink: getDownloadLink(params.origin, params.transferId),
  })
  return sendMail({ to: params.senderEmail, subject, text })
}

