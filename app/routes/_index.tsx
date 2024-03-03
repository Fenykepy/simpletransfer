import { redirect } from "@remix-run/node"

export const loader = async () => {
  // Nothing there, we redirect to transfers
  return redirect("/transfers")
}