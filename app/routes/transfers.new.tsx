import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import {
  useActionData,
  useNavigation,
} from "@remix-run/react"

import { db } from "~/utils/db.server"
import { badRequest } from "~/utils/request.server"
import {
  validateEmail,
} from "~/utils/validate"

export const loader = async({ request }: LoaderFunctionArgs) => {
  /* TODO handle authentication
  const userId = await getUserId(request)
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 })
  }
  */

  // TODO scan dropbox folder's content

  return json({ })
}

function validateFile(file: string) {
  if (file.trim().length === 0) {
    return "Invalid filename"
  }
  // TODO ensure file is in dropbox
}

function validateObject(object: string) {
  if (object.trim().length === 0) {
    return "Object must be set"
  }
}

function validateMessage(message: string) {
  if (message.trim().length === 0) {
    return "Message must be set"
  }

}

function parseRecipientsString(recipientsString: string) {
  const parsed = recipientsString.trim().split(",")
  let emails = []
  let errors = []
  for (let item of parsed) {
    const email = item.trim()
    let error = validateEmail(email)
    if (error) {
      errors.push(error)
    } else {
      emails.push(email)
    }
  }

  return [ emails, errors ]
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData()
  const to = form.get("to")
  const file = form.get("file")
  const object = form.get("object")
  const message = form.get("message")

  if (typeof to !== "string" || typeof file !== "string" ||
      typeof object !== "string" || typeof message !== "string") {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "Form not submitted correctly."
    })
  }
  const [ toEmails, toErrors ] = parseRecipientsString(to)
  if (toErrors.length === 0 && toEmails.length === 0) {
    // We must at least have one valid email
    toErrors.push("This field must be set")
  }

  const fieldErrors = {
    to: toErrors.length > 0 ? toErrors : undefined,
    file: validateFile(file),
    object: validateObject(object),
    message: validateMessage(message),
  }
  const fields = { to, file, object, message }
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    })
  }

  // TODO create transfer and recipients
  let transfer = { id: "test" }
  return redirect(`/transfers/${transfer.id}`)
}

export default function NewTransferRoute() {
  return (
    <div>
      <h2>New Transfer</h2>
      <form method="post">
        <div>
          <label>
            {/* coma separated list of emails */}
            To: <input type="text" name="to" />
          </label>
        </div>
        <div>
          <label>
            File: <input type="text" name="file" />
          </label>
        </div>
        <div>
          <label>
            Object: <input type="text" name="object" />
          </label>
        </div>
        <div>
          <label>
            Message: <textarea name="message" />
          </label>
        </div>
        <div>
          <button type="submit">Send</button>
        </div>
      </form>
    </div>
  )
}