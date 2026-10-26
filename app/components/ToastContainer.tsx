'use client'

import { useState, useEffect } from 'react'
import { toast, ToastItem } from '@/lib/toast'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const unsubscribe = toast.subscribe((newToast) => {
      setToasts((prev) => [...prev, newToast])

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id))
      }, newToast.duration)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((item) => {
        const isError = item.type === 'error'
        const isSuccess = item.type === 'success'
        const isWarning = item.type === 'warning'

        const bg = isError
          ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-rose-100'
          : isSuccess
          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-emerald-100'
          : isWarning
          ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-amber-100'
          : 'bg-blue-50 border-blue-300 text-blue-900 shadow-blue-100'

        const icon = isError ? (
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        ) : isSuccess ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        ) : isWarning ? (
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        ) : (
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        )

        return (
          <div
            key={item.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border-2 shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-down ${bg}`}
          >
            {icon}
            <div className="flex-1 text-xs sm:text-sm font-semibold leading-relaxed">
              {item.message}
            </div>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== item.id))}
              className="text-gray-400 hover:text-gray-700 p-0.5 rounded-lg transition shrink-0"
              aria-label="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
