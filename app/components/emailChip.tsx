interface EmailChipProps {
  email: string,
  title?: string,
  color?: "green" | "cyan" | "pink"
}

export default function EmailChip({ email, title, color="cyan" }: EmailChipProps) {
  return (
    <li
      title={title}
      className={`inline-block rounded-full border ml-1 my-1 px-4 py-0.5 text-center text-sm cursor-default bg-${color}-50 border-${color}-100 text-${color}-600`}
    >
      {email}
    </li>
  )
}