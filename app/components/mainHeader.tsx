import Logo from "~/images/simpletransfer_0.2.svg"

export default function MainHeader() {
  return (
    <header className="flex px-8 sticky top-0 z-40 w-full border-b border-slate-900/10 bg-white">
      <img className="inline-block mr-3" width="35" height="35" src={Logo} alt="SimpleTransfer logo" />
      <h1 className="inline-block my-4 text-2xl font-semibold text-slate-700">SimpleTransfer</h1>
    </header>
  )
}