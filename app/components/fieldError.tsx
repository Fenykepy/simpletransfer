interface FieldErrorProps {
  errorMessage?: string
  className?: string
}

export default function FieldError({ errorMessage, className}: FieldErrorProps) {
  if (!errorMessage) return null
  return (
    <p
      className={"text-red-700 text-xs font-semibold mt-1.5" + " " + className}
      role="alert"
    >
      {errorMessage}
    </p>
  )
}