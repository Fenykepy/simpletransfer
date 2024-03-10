import fs from "node:fs/promises"
import Handlebars from "handlebars"

export const loader = async () => {
  // Endpoint to test emails html without actually sending emails
  if (process.env.NODE_ENV === "production") {
    throw new Response("Not found", { status: 404 })
  }

  const emailRaw = await fs.readFile('./app/templates/email.handlebars', 'utf-8')
  const emailCss = await fs.readFile('./app/templates/email.css', 'utf-8')
  const emailTemplate = Handlebars.compile(emailRaw)

  let html = emailTemplate({
    css: emailCss,
    title: "Transfer sent"
  })

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      "cache-Control": "no-cache",
    }
  })
}