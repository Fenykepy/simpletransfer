import clsx from 'clsx'

export default function TransferActiveIndicator({ active }: { active: boolean }) {
  return (
    <div
      className={clsx(
        "inline-block rounded-full border w-32 px-4 py-1 text-center text-sm cursor-default",
        {
          "bg-pink-50 border-pink-100 text-pink-600": !active,
          "bg-cyan-50 border-cyan-100 text-cyan-600": active,
        },
      )}
      title={active ? "" : "This transfer cannot be downloaded"}
    >
      {active ? "Active" : "Inactive"}
    </div>
  )
}