'use client'

import { useEffect } from 'react'

export default function CapacitorBridge() {
  useEffect(() => {
    // Only initialize when running inside Capacitor native container
    let isCapacitor = false
    try {
      // @ts-ignore
      isCapacitor = typeof window !== 'undefined' && Boolean(window?.Capacitor?.isNativePlatform())
    } catch {}

    if (!isCapacitor) return

    import('@capacitor/app').then(({ App }) => {
      const listener = App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back()
        } else {
          App.exitApp()
        }
      })

      return () => {
        listener.then((sub) => sub.remove())
      }
    }).catch(() => {})
  }, [])

  return null
}
