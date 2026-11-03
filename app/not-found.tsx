import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 - Không tìm thấy trang | HANDY',
  description: 'Trang bạn tìm có thể đã được đổi địa chỉ hoặc không còn tồn tại.',
}

export default function NotFound() {
  return (
    <section
      data-screen-label="01 Không tìm thấy trang"
      className="relative overflow-hidden min-h-[calc(100vh-200px)] flex items-center justify-center font-sans"
      style={{
        background:
          'radial-gradient(45% 80% at 100% 0%, #E2F0FF 0%, rgba(226,240,255,0) 70%), radial-gradient(40% 70% at 0% 100%, #FFEAF0 0%, rgba(255,234,240,0) 70%), #F7FAFF',
      }}
    >
      {/* Decorative shapes */}
      <span
        aria-hidden="true"
        className="absolute left-[8%] top-[70px] w-[22px] h-[22px] rounded-full bg-[#1A8CFF] pointer-events-none hidden sm:block"
      />
      <span
        aria-hidden="true"
        className="absolute right-[9%] top-[60px] w-[34px] h-[34px] rounded-full border-[5px] border-[#F9C31F] pointer-events-none hidden sm:block"
      />
      <span
        aria-hidden="true"
        className="absolute right-[14%] bottom-[70px] w-[16px] h-[16px] rounded-[4px] bg-[#F0436A] rotate-[20deg] pointer-events-none hidden sm:block"
      />

      <div className="relative max-w-[760px] mx-auto px-6 py-20 sm:py-24 flex flex-col items-center gap-4 sm:gap-5 text-center">
        {/* 404 Giant Number */}
        <span className="text-[96px] sm:text-[130px] md:text-[168px] font-bold leading-none tracking-[-0.04em] text-[#1A8CFF] select-none">
          4<span className="text-[#F0436A]">0</span>4
        </span>

        {/* Heading */}
        <h1 className="text-[28px] sm:text-[34px] md:text-[40px] font-bold tracking-[-0.02em] text-[#1E1E1E]">
          Không tìm thấy <span className="text-[#1A8CFF]">trang</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-[17px] leading-relaxed text-[#4A4A4A] max-w-[520px]">
          Trang bạn tìm có thể đã được đổi địa chỉ hoặc không còn tồn tại. Hãy quay về trang chủ hoặc chọn một chủ đề để tiếp tục học.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap justify-center mt-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-7 py-3.5 rounded-full text-white text-[15px] font-semibold bg-[#1A8CFF] hover:bg-[#0B6FE0] transition-colors shadow-md"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 9.5V21h14V9.5" />
              <path d="M10 21v-6h4v6" />
            </svg>
            <span>Về trang chủ</span>
          </Link>

          <Link
            href="/topics"
            className="flex items-center gap-2 px-6 py-3.5 rounded-full border-[1.5px] border-[#E3E7EE] bg-white text-[#1E1E1E] hover:border-[#1A8CFF] hover:text-[#1A8CFF] text-[15px] font-semibold transition-all shadow-sm"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H2z" />
              <path d="M22 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z" />
            </svg>
            <span>Xem chủ đề</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
