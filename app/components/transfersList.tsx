
import InlineTransfer from "~/components/inlineTransfer"

interface RecipientEmail {
  email: string
}

export interface InlineTransfer {
  id: string
  createdAt: string
  object: string
  archiveSize: number
  recipients: Array<RecipientEmail>
  complete: boolean
  active: boolean
}

interface TransfersListProps {
  transfers: Array<InlineTransfer>
}

export default function TransfersList({ transfers }: TransfersListProps) {
  return (
    <ul className="bg-slate-100 rounded-md p-2">
      {transfers.map(transfer => (
        <InlineTransfer key={transfer.id} transfer={transfer} />
      ))}
    </ul>
  )
}