import { humanSize } from "~/utils/humanSize"

interface TransferFileFieldProps {
  originalName: string
  archiveSize: number
}

export default function TransferFileField({ originalName, archiveSize}: TransferFileFieldProps) {
  return (
    <div className="border-b border-slate-900/10 py-3 flex items-center">
      <div>
        <span className="font-semibold text-slate-700">File:</span>
        <span className="text-slate-500 ml-2 truncate">{originalName}</span>
      </div>
      <div className="ml-auto text-sm text-slate-500">
        {humanSize(archiveSize)}
      </div>
    </div>
  )
}