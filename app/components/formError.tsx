interface FormErrorProps {
  errorPrefix?: string
  errorMessage?: string
  className?: string
}

export default function FormError({ errorPrefix, errorMessage, className }: FormErrorProps) {
  if (!errorMessage) return null
  return (
    <div 
      className={"bg-red-50 border border-red-500 text-red-700 px-4 py-3 text-sm rounded-md" + " " + className}
      role="alert"
    >
      { errorPrefix ? (
        <strong className="font-bold">{errorPrefix + " "}</strong>
      ) : null}
      <span className="block sm:inline">{errorMessage}</span>
    </div>
  )
}