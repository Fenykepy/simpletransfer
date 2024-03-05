import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import {
  Form,
  useActionData,
  useLoaderData,
} from "@remix-run/react"

import { db } from "~/utils/db.server"
import { isDropboxEntry, listDropbox } from "~/utils/filesystem.server"
import { requireUserId } from "~/utils/session.server"
import { badRequest } from "~/utils/request.server"
import {
  validateEmail,
} from "~/utils/validate"

import MessageSection from "~/components/messageSection"
import EmailChip from "~/components/emailChip"
import FieldError from "~/components/fieldError"
import PrimaryButton from "~/components/primaryButton"


export const loader = async({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request)
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      signature: true,
    }
  })
  const dropboxContent = await listDropbox()

  return json({ user, dropboxContent })
}

async function validateFile(file: string) {
  if (file.trim().length === 0) {
    return "File is required"
  }
  // Ensure file is in dropbox
  if (! await isDropboxEntry(file)) {
    return "File not found in dropbox directory"
  }
}

function validateObject(object: string) {
  if (object.trim().length === 0) {
    return "Object is required"
  }
}

function validateMessage(message: string) {
  if (message.trim().length === 0) {
    return "Message is required"
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
    toErrors.push("Email is required")
  }

  const fieldErrors = {
    to: toErrors.length > 0 ? toErrors.join(", ") : undefined,
    file: await validateFile(file),
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
  const data = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <MessageSection title="New Transfer">
      <Form method="post">
        <div className="border-b border-slate-900/10 py-2">
          <label className="flex text-slate-700">
            {/* coma separated list of emails */}
            <span className="font-semibold mr-1">To: </span>
            <input 
              className="outline-none grow placeholder:italic placeholder-slate-400 truncate"
              type="text"
              name="to"
              placeholder="tom@example.com, tina@example.com"
              spellCheck={false}
              aria-invalid={Boolean(actionData?.fields?.to)}
              aria-errorMessage={actionData?.fieldErrors?.to ? "to-error" : undefined}
              defaultValue={actionData?.fields?.to}
            />
          </label>
          <FieldError errorMessage={actionData?.fieldErrors?.to} />
        </div>
        <div className="border-b border-slate-900/10 py-2">
          <span className="font-semibold text-slate-700 mr-1">From:</span>
          <EmailChip email={data.user?.email || ""} />
        </div>
        <div className="border-b border-slate-900/10 py-3">
          <label className="flex items-center text-slate-700">
            <span className="font-semibold mr-1">File: </span>
            <select
              name="file"
              className="outline-none bg-white py-0 grow min-w-0 truncate"
              aria-invalid={Boolean(actionData?.fields?.file)}
              aria-errorMessage={actionData?.fieldErrors?.file ? "file-error" : undefined}
            >
              <option value=""></option>
              {data.dropboxContent.map( contentItem =>
                <option
                  key={contentItem.name}
                >{contentItem.name}</option>
              )}
            </select>
          </label>
          <FieldError errorMessage={actionData?.fieldErrors?.file} />
        </div>
        <div className="border-b border-slate-900/10 py-3">
          <label className="flex text-slate-700">
            <span className="font-semibold mr-1">Object: </span>
            <input
              className="outline-none grow"
              type="text"
              name="object" 
              aria-invalid={Boolean(actionData?.fields?.object)}
              aria-errorMessage={actionData?.fieldErrors?.object ? "object-error" : undefined}
            />
          </label>
          <FieldError errorMessage={actionData?.fieldErrors?.object} />
        </div>
        <div className="border-b border-slate-900/10">
          <textarea 
            className="w-full outline-none text-slate-700 py-4"
            name="message"
            rows={12}
            aria-invalid={Boolean(actionData?.fields?.message)}
            aria-errorMessage={actionData?.fieldErrors?.message ? "message-error" : undefined}
          />
          <FieldError
            errorMessage={actionData?.fieldErrors?.message}
            className="mb-3"
          />
        </div>
        <FieldError
          errorMessage={actionData?.formError || undefined }
          className="mt-3"
        />
        <div className="flex mt-5">
          <PrimaryButton text="Send" type="submit" className="mx-auto min-w-52" />
        </div>
      </Form>
    </MessageSection>
  )
}