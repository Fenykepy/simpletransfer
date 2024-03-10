import fs from "node:fs/promises"
import Handlebars from "handlebars"

export const loader = async () => {
  // Endpoint to test emails html without actually sending emails
  if (process.env.NODE_ENV === "production") {
    throw new Response("Not found", { status: 404 })
  }

  const emailRaw = await fs.readFile('./app/templates/htmlEmail.handlebars', 'utf-8')
  const emailCss = await fs.readFile('./app/templates/email.css', 'utf-8')
  const minifiedCss = emailCss.replaceAll("\n", "")
  Handlebars.registerPartial('cssPartial', minifiedCss)
  const emailTemplate = Handlebars.compile(emailRaw)

  let html = emailTemplate({
    title: "Transfer sent",
    to: ["tom@example.com", "tina@example.com"],
    errors: ["invalid@example.com", "falsemail@example.com"],
    filename: "my_file.md",
    filesize: "8.9 MB",
    subject: "Photos du weekend dernier",
    message: "Les photos du weekend dernier \n\n Enjoy!",
    //downloadLink: "http://localhost/downloads/test",
    transferLink: "/transfers/test",
    shareLink: "/downloads/test",
    origin: "http://localhost:4000",
  })

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      "cache-Control": "no-cache",
    }
  })
}