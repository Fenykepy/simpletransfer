import clsx from 'clsx'

interface TextInputProps {
  type: "text" | "password" | "url" | "email"
  id?: string
  name: string
  defaultValue?: string
  invalid: boolean
  errorMessage?: string 
  required?: boolean
  placeholder?: string
  spellCheck?: boolean
}

export default function TextInput({ 
  type, id, name, defaultValue, invalid, errorMessage, required, placeholder, spellCheck=true,
}: TextInputProps) {
  return <input
    type={type}
    id={id}
    name={name}
    defaultValue={defaultValue}
    aria-invalid={invalid}
    aria-errormessage={errorMessage}
    required={required}
    spellCheck={spellCheck}
    placeholder={placeholder}
    className={clsx(
      "mt-1 block w-full px-4 py-3 rounded-md text-sm bg-white border border-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder:italic placeholder-slate-400",
      {
        "border-red-500 focus:border-red-500 focus:ring-red-500": invalid,
      }
    )}
  />
}


    /*className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
    focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500
    disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
    invalid:border-pink-500 invalid:text-pink-600
    focus:invalid:border-pink-500 focus:invalid:ring-pink-500"*/