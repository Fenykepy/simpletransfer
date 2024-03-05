import Logo from "~/images/simpletransfer_logo.svg"
import { humanDate} from "~/utils/humanDate"

interface MessageSectionProps {
  title: string
  children: React.ReactNode
  date?: string
}

export default function MessageSection({ title, children, date}: MessageSectionProps) {
  return (
    <section className="w-full max-w-screen-md mx-auto px-8 sm:px-16 pt-12 pb-8 sm:pb-16 card">
      <header className="mb-8 sm:mb-10 flex items-center">
        <img width="40" height="40" src={Logo} alt="Transfer icon" />
        <h1 className="text-3xl font-semibold text-slate-700 text-center ml-3">{title}</h1>
        {date ? (
          <div className="text-slate-500 text-sm ml-auto text-center">
            {humanDate(date)}
          </div>
        ) : null}
      </header>
      {children}
    </section>
  )
}