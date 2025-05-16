import { createContext, useContext, useState } from "react"
import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const ToastContext = createContext<{
  toasts: ToasterToast[]
  addToast: (toast: Omit<ToasterToast, "id">) => void
  removeToast: (id: string) => void
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToasterToast[]>([])

  const addToast = (toast: Omit<ToasterToast, "id">) => {
    setToasts((prevToasts) => [
      ...prevToasts,
      { ...toast, id: crypto.randomUUID() },
    ])
  }

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const { toasts, addToast, removeToast } = useContext(ToastContext)

  return {
    toasts,
    toast: (props: Omit<ToasterToast, "id">) => {
      addToast(props)
    },
    dismiss: (id: string) => {
      removeToast(id)
    },
  }
}
