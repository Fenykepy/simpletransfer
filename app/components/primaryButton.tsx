export interface ButtonProps {
  text: string
  type: "button" | "submit"
  onClick?: (e: React.SyntheticEvent) => void
  className?: string
}

export default function PrimaryButton({ text, type, onClick, className }: ButtonProps) {
  return (
    <button
      className={"leading-5 text-sm font-semibold rounded-md px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white" + " " + className}
      type={type}
      onClick={onClick}
    >{text}</button>
  )
} 