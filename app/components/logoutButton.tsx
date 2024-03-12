import { Form } from "@remix-run/react"

interface LogoutButtonProps {
  className?: string,
}

export default function LogoutButton({ className }: LogoutButtonProps) {
  return (
    <Form action="/logout" method="post">
      <button type="submit" className={className}>Logout</button>
    </Form>
  )
}