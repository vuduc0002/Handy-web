'use client'

import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  children: React.ReactNode
  /** Tùy chọn hiển thị nút đóng 'X' ở góc trên bên phải */
  showCloseButton?: boolean
  /** Cho phép tùy biến thêm class cho container Bottom Sheet */
  className?: string
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  className = '',
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  // 1. Khóa cuộn trang (Body Scroll Lock) chống scroll bleeding trên iOS Safari / Android
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    const originalTouchAction = document.body.style.touchAction

    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'

    return () => {
      document.body.style.overflow = originalOverflow || 'unset'
      document.body.style.touchAction = originalTouchAction || 'auto'
    }
  }, [isOpen])

  // 2. Lắng nghe phím Escape để đóng Bottom Sheet
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    // 1. Container bao bọc toàn màn hình cố định
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center"
    >
      {/* 2. Backdrop Overlay: Đóng modal khi bấm ra ngoài */}
      <div
        className="absolute inset-0 bg-black/60 transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 3. Bottom Sheet Container: An toàn chiều cao iOS Safari (90dvh) & bo tròn góc trên */}
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        className={`relative z-10 w-full max-w-lg bg-white rounded-t-[28px] sm:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden animate-slide-up ${className}`}
      >
        {/* Thanh kéo Handle Bar chuẩn Mobile Bottom Sheet */}
        <div className="pt-3 pb-1 flex justify-center shrink-0 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-gray-300" />
        </div>

        {/* Header của Bottom Sheet */}
        {(title || showCloseButton) && (
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="font-bold text-base text-[#1E1E1E]">
              {title}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Nội dung cuộn bên trong (Inner Scrolling) & xử lý Safe Area Padding cho iPhone */}
        <div className="p-5 overflow-y-auto flex-1 overscroll-contain pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
          {children}
        </div>
      </div>
    </div>
  )
}
