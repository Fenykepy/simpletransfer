import type { ActionFunctionArgs } from "@remix-run/node"
import {
  Form,
  useActionData,
  useSearchParams,
} from "@remix-run/react"

import { db } from "~/utils/db.server"
import { badRequest } from "~/utils/request.server"
import {
  validateEmail,
  validatePassword,
} from "~/utils/validate"
import { createUserSession, login } from "~/utils/session.server"

function validateUrl(url: string) {
  const urls = ["/", "/transfers"]
  if (urls.includes(url)) {
    return url
  }
  return "/transfers"
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData()
  const password = form.get("password")
  const email = form.get("email")
  const redirectTo = validateUrl(
    (form.get("redirectTo") as string) || "/transfers"
  )
  if (typeof password !== "string" || typeof email !== "string") {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "Form not submitted correctly."
    })
  }

  const fields = { password, email }
  const fieldErrors = {
    password: validatePassword(password),
    email: validateEmail(email),
  }
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    })
  }

  const user = await login({ email, password })
  console.log({ user })
  if (!user) {
    return badRequest({
      fieldErrors: null,
      fields,
      formError: "Incorrect credentials"
    })
  }
  return createUserSession(user.id, redirectTo)
}

export default function Login() {
const actionData = useActionData<typeof action>()
const [searchParams] = useSearchParams()

  return (
    <div>
      <h1>Login</h1>
      <Form method="post">
        <input
          type="hidden"
          name="redirectTo"
          value={
            searchParams.get("redirectTo") ?? undefined
          } 
        />
        <div>
          <label htmlFor="email-input">Email</label>
          <input
            type="text"
            id="email-input"
            name="email"
            defaultValue={actionData?.fields?.email}
            aria-invalid={Boolean(
              actionData?.fieldErrors?.email
            )}
            aria-errormessage={
              actionData?.fieldErrors?.email
                ? "email-error" : undefined
            }
          />
          {actionData?.fieldErrors?.email ? (
            <p role="alert">
              {actionData.fieldErrors.email}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="password-input">Password</label>
          <input
            type="password"
            id="password-input"
            name="password"
            defaultValue={actionData?.fields?.password}
            aria-invalid={Boolean(
              actionData?.fieldErrors?.password
            )}
            aria-errormessage={
              actionData?.fieldErrors?.password
                ? "email-error" : undefined
            }
          />
          {actionData?.fieldErrors?.password ? (
            <p role="alert">
              {actionData.fieldErrors.password}
            </p>
          ) : null}
        </div>
        <button type="submit">Login</button>
      </Form>
    </div>
  )
}