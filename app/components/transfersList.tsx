
import TransferInline from "~/components/transferInline"

interface RecipientEmail {
  email: string
}

export interface InlineTransfer {
  id: string
  createdAt: string
  subject: string
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
    <ul className="card">
      {transfers.map(transfer => (
        <TransferInline key={transfer.id} transfer={transfer} />
      ))}
    </ul>
  )
}