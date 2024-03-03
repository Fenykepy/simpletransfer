interface LabelProps {
  text: string
  htmlFor: string
  className?: string
}

export default function Label({ text, htmlFor, className }: LabelProps) {
  return <label
    className={"lock text-sm font-bold text-slate-700/80 pl-2.5" + " " + className}
    htmlFor={htmlFor}
  >{text}</label>
}