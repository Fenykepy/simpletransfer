import clsx from 'clsx'

export default function TransferCompleteIndicator({ complete }: { complete: boolean }) {
  return (
    <div
      className={clsx(
        "inline-block rounded-full border w-32 px-4 py-1 text-center text-sm cursor-default",
        {
          "bg-yellow-50 border-yellow-200/90 text-yellow-500": !complete,
          "bg-green-50 border-green-100 text-green-600": complete,
        },
      )}
      title={complete ? 
        "All recipients downloaded this transfer" :
        "Some recipients did not download it yet"
      }
    >
      {complete ? "Complete" : "Pending"}
    </div>
  )
}