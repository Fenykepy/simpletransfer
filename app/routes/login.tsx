import type { ActionFunctionArgs } from "@remix-run/node"
import {
  Form,
  useActionData,
  useSearchParams,
} from "@remix-run/react"

import { badRequest } from "~/utils/request.server"
import {
  validateEmail,
  validatePassword,
} from "~/utils/validate"
import { createUserSession, login } from "~/utils/session.server"

import Label from "~/components/label"
import PrimaryButton from "~/components/primaryButton"
import TextInput from "~/components/textInput"
import FormError from "~/components/formError"
import FieldError from "~/components/fieldError"

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
  if (!user) {
    return badRequest({
      fieldErrors: null,
      fields,
      formError: "Incorrect credentials"
    })
  }
  console.log("create session:", user.id, redirectTo)
  return createUserSession(user.id, redirectTo)
}

export default function Login() {
  const actionData = useActionData<typeof action>()
  const [searchParams] = useSearchParams()

  return (
    <div className="w-full max-w-lg bg-white shadow-lg rounded-md px-3 sm:px-16 pt-12 pb-8 sm:pb-16 mx-auto border border-slate-900/10">
      <h1 className="text-3xl font-semibold text-slate-700 text-center mb-8">Login</h1>
      <Form method="post">
        <input
          type="hidden"
          name="redirectTo"
          value={
            searchParams.get("redirectTo") ?? undefined
          } 
        />
        <div className="mb-5">
          <Label text="Email:" htmlFor="email-input" />
          <TextInput 
            type="email"
            id="email-input"
            name="email"
            defaultValue={actionData?.fields?.email}
            invalid={Boolean(actionData?.fieldErrors?.email)}
            errorMessage={actionData?.fieldErrors?.email ? "email-error" : undefined }
            required={true}
            spellCheck={false}
            placeholder="you@example.com"
          />
          <FieldError errorMessage={actionData?.fieldErrors?.email || undefined} />
        </div>
        <div className="mb-5">
          <Label text="Password:" htmlFor="password-input" />
          <TextInput 
            type="password"
            id="password-input"
            name="password"
            defaultValue={actionData?.fields?.password}
            invalid={Boolean(actionData?.fieldErrors?.password)}
            errorMessage={actionData?.fieldErrors?.password ? "password-error" : undefined }
            required={true}
            spellCheck={false}
            placeholder="your password"
          />
          <FieldError errorMessage={actionData?.fieldErrors?.password || undefined} />
        </div>
        <FormError errorMessage={actionData?.formError || undefined} className="mb-5" />
        <PrimaryButton text="Login" type="submit" className="w-full mt-8" />
      </Form>
    </div>
  )
}