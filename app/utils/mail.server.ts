import fs from "node:fs/promises"
import nodemailer from "nodemailer"
import Handlebars from "handlebars"

import { db } from "./db.server"
import { humanSize } from "./humanSize"

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


function getTransferLink(id: string) {
  return `/transfers/${id}`
}

function getDownloadLink(id: string) {
  return `/downloads/${id}`
}

const mailer = nodemailer.createTransport(mailConfig)

const textEmailRaw = await fs.readFile('./app/templates/textEmail.handlebars', 'utf-8')
const textEmailTemplate = Handlebars.compile(textEmailRaw)

const htmlEmailRaw = await fs.readFile('./app/templates/htmlEmail.handlebars', 'utf-8')
const htmlEmailTemplate = Handlebars.compile(htmlEmailRaw)
const rawCss = await fs.readFile('./app/templates/email.css', 'utf-8')
const minifiedCss = rawCss.replace("\n", "")
Handlebars.registerPartial('cssPartial', minifiedCss)
Handlebars.registerHelper('comaJoined', function (array) {
  return array.join(", ")
})


interface SendMailParams {
  to: string,
  subject: string,
  text: string,
  html?: string,
  replyTo?: string,
}

function sendMail({ to, subject, text, html, replyTo }: SendMailParams) {
  return mailer.sendMail(
    {
      from: sender,
      replyTo,
      to,
      subject: subject_prefix + subject,
      text,
      html,
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

// Send email to recipient on success new transfer
function sendRecipientNewTransferEmail(params: RecipientNewTransferEmailParams) {
  const subject = `"${params.senderEmail}" sent you "${params.subject}"`
  const emailContext = {
    title: "You received a transfer!",
    from: params.senderEmail,
    filename: params.originalName,
    filesize: humanSize(params.archiveSize),
    subject: params.subject,
    message: params.message,
    downloadLink: getDownloadLink(params.downloadId),
    origin: params.origin,
  }
  const text = textEmailTemplate(emailContext)
  const html = htmlEmailTemplate(emailContext)

  return sendMail({ to: params.recipientEmail, subject, text, html, replyTo: params.senderEmail })
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

// Send email to user on success new transfer
async function sendSenderNewTransferEmail(params: SenderNewTransferEmailParams) {
  const errors = params.errorEmails.length > 0
  const subject = `"${params.subject}" ${errors ? "sent with errors..." : "successfully sent!"}`
  const emailContext = {
    title: `Transfer ${errors ? "sent with errors..." : "successfully sent!"}`,
    to: params.successEmails,
    errors: errors ? params.errorEmails : undefined,
    filename: params.originalName,
    filesize: humanSize(params.archiveSize),
    subject: params.subject,
    message: params.message,
    transferLink: getTransferLink(params.transferId),
    shareLink: getDownloadLink(params.transferId),
    origin: params.origin,
  }
  const text = textEmailTemplate(emailContext)
  const html = htmlEmailTemplate(emailContext)

  return sendMail({ to: params.senderEmail, subject, text, html })
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
  let title: string
  if (params.recipientEmail) {
    subject = `${params.recipientEmail} downloaded "${params.subject}"`
    title = `${params.recipientEmail} downloaded your transfer`
  } else {
    subject = `Someone downloaded "${params.subject}"`
    title = "Someone downloaded your transfer"
  }
  const emailContext = {
    title,
    filename: params.originalName,
    filesize: humanSize(params.archiveSize),
    subject: params.subject,
    message: params.message,
    transferLink: getTransferLink(params.transferId),
    shareLink: getDownloadLink(params.transferId),
    origin: params.origin,
  }
  const text = textEmailTemplate(emailContext)
  const html = htmlEmailTemplate(emailContext)
  
  return sendMail({ to: params.senderEmail, subject, text, html })
}

