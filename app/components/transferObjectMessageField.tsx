interface TransferObjectMessageFieldProps {
  object: string
  message: string
}

export default function TransferObjectMessageField({ object, message }: TransferObjectMessageFieldProps) {
  return (
    <div className="border-b border-slate-900/10">
      <h2 className="font-bold text-slate-700 text-xl mt-8">{object}</h2>
      <div className="whitespace-pre-wrap mt-6 mb-8">{message}</div>
    </div>
  )
}