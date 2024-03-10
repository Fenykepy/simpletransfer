
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
  if (transfers.length === 0) {
    return (
    <ul className="card">
      <li className="flex items-center mx-5 sm:mx-8 py-5 text-slate-900">
        No transfers yet... New one ?
      </li>
    </ul>
    )
  }
  return (
    <ul className="card">
      {transfers.map(transfer => (
        <TransferInline key={transfer.id} transfer={transfer} />
      ))}
    </ul>
  )
}