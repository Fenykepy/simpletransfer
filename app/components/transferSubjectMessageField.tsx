interface TransferSubjectMessageFieldProps {
  subject: string
  message: string
}

export default function TransferSubjectMessageField({ subject, message }: TransferSubjectMessageFieldProps) {
  return (
    <div className="border-b border-slate-900/10">
      <h2 className="font-bold text-slate-700 text-xl mt-8">{subject}</h2>
      <div className="whitespace-pre-wrap mt-6 mb-8">{message}</div>
    </div>
  )
}