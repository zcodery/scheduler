import React, { useEffect, useState } from "react"
import ReactDOM from "react-dom/client"

type ConfirmOptions = {
  title?: string
  message?: React.ReactNode
  confirmButtonText?: string
  cancelButtonText?: string
  showClose?: boolean
  beforeClose?: (action: "confirm" | "cancel") => boolean | Promise<boolean>
  className?: string
}

const ConfirmHost: React.FC<{ options: ConfirmOptions; resolve: (v: true) => void; reject: (v: false) => void; close: () => void }> = ({ options, resolve, reject, close }) => {
  const [open, setOpen] = useState(true)
  const onClose = async (action: "confirm" | "cancel") => {
    if (options.beforeClose) {
      const r = await options.beforeClose(action)
      if (r === false) return
    }
    setOpen(false)
    if (action === "confirm") resolve(true)
    else reject(false)
    close()
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose("cancel")
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])
  return (
    <div className={`fixed inset-0 z-[2000] ${open ? "" : "pointer-events-none"}`}>
      <div className={`absolute inset-0 bg-black/40 ${open ? "opacity-100" : "opacity-0"} transition-opacity`} onClick={() => onClose("cancel")} />
      <div className={`absolute inset-0 flex items-center justify-center p-4`}>
        <div className={`bg-white rounded-lg shadow-xl w-full max-w-[90vw] sm:max-w-md ${options.className ?? ""} ${open ? "opacity-100 scale-100" : "opacity-0 scale-95"} transition-all`}>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-800">{options.title ?? "提示"}</div>
            {options.showClose && (
              <button className="text-gray-400 hover:text-gray-600" onClick={() => onClose("cancel")}>×</button>
            )}
          </div>
          <div className="px-4 py-4 text-sm text-gray-700 break-words">{options.message}</div>
          <div className="px-4 py-3 border-t border-gray-100 flex justify-end gap-2">
            <button className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 rounded" onClick={() => onClose("cancel")}>{options.cancelButtonText ?? "取消"}</button>
            <button className="px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded" onClick={() => onClose("confirm")}>{options.confirmButtonText ?? "确定"}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Confirm = {
  show(options: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const container = document.createElement("div")
      document.body.appendChild(container)
      const root = ReactDOM.createRoot(container)
      const close = () => {
        setTimeout(() => {
          root.unmount()
          container.remove()
        }, 200)
      }
      root.render(<ConfirmHost options={options} resolve={v => resolve(v)} reject={v => reject(v)} close={close} />)
    })
  },
}

