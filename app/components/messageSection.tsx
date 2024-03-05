import Logo from "~/images/simpletransfer_logo.svg"

interface MessageSectionProps {
  title: string
  children: React.ReactNode
}

export default function MessageSection({ title, children}: MessageSectionProps) {
  return (
    <section className="w-full max-w-screen-md mx-auto px-8 sm:px-16 pt-12 pb-8 sm:pb-16 card">
      <header className="flex items-center justify-center mb-8 sm:mb-14">
        <img width="30" height="30" src={Logo} alt="Transfer icon" />
        <h1 className="text-3xl font-semibold text-slate-700 text-center ml-3">{title}</h1>
      </header>
      {children}
    </section>
  )
}