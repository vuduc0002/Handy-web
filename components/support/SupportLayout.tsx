'use client'

import React from 'react'
import Link from 'next/link'

export type SupportTabKey = 'support' | 'terms' | 'privacy' | 'payment-guide'

interface SupportTabConfig {
  key: SupportTabKey
  title: string
  href: string
  lead: string
  color: string
  softBg: string
  icon: React.ReactNode
}

export const SUPPORT_TABS: SupportTabConfig[] = [
  {
    key: 'support',
    title: 'Liên hệ hỗ trợ',
    href: '/support',
    lead: 'Bạn gặp vấn đề khi học, đăng nhập hay thanh toán? Gửi yêu cầu để nhóm HANDY hỗ trợ bạn.',
    color: '#1A8CFF',
    softBg: '#EAF4FF',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
        <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    ),
  },
  {
    key: 'terms',
    title: 'Điều khoản dịch vụ',
    href: '/terms',
    lead: 'Các quy định khi sử dụng website và tài khoản HANDY.',
    color: '#7B5BB5',
    softBg: '#F3EEFC',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
      </svg>
    ),
  },
  {
    key: 'privacy',
    title: 'Chính sách bảo mật',
    href: '/privacy',
    lead: 'Cách HANDY thu thập, sử dụng và bảo vệ thông tin của bạn và gia đình.',
    color: '#17A673',
    softBg: '#E3F7EE',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
    ),
  },
  {
    key: 'payment-guide',
    title: 'Hướng dẫn thanh toán',
    href: '/payment-guide',
    lead: 'Các bước mua gói tài khoản VIP để mở khóa toàn bộ chủ đề.',
    color: '#F0436A',
    softBg: '#FFF0F3',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
]

interface SupportLayoutProps {
  currentTab: SupportTabKey
  children: React.ReactNode
}

export default function SupportLayout({ currentTab, children }: SupportLayoutProps) {
  const current = SUPPORT_TABS.find((t) => t.key === currentTab) || SUPPORT_TABS[0]

  return (
    <div className="min-h-screen bg-white font-sans text-[#1E1E1E]">
      {/* Banner Section */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            'radial-gradient(45% 80% at 100% 0%, #E2F0FF 0%, rgba(226,240,255,0) 70%), radial-gradient(40% 70% at 0% 100%, #FFEAF0 0%, rgba(255,234,240,0) 70%), #F7FAFF',
        }}
      >
        {/* Decorative Golden Ring */}
        <span
          aria-hidden="true"
          className="absolute right-[8%] top-11 w-7 h-7 rounded-full border-[5px] border-[#F9C31F] pointer-events-none hidden sm:block"
        />
        {/* Decorative Twinkle Star */}
        <svg
          aria-hidden="true"
          className="absolute right-28 top-14 pointer-events-none animate-pulse hidden sm:block"
          width="22"
          height="22"
          viewBox="0 0 40 40"
        >
          <path
            d="M20 0 C21.5 13 27 18.5 40 20 C27 21.5 21.5 27 20 40 C18.5 27 13 21.5 0 20 C13 18.5 18.5 13 20 0Z"
            fill="#F0436A"
          />
        </svg>

        <div className="relative z-10 max-w-[1240px] mx-auto px-6 py-9 sm:py-11 flex flex-col gap-3">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 flex-wrap text-sm text-[#6B6B6B]">
            <Link href="/" className="text-[#6B6B6B] hover:text-[#1A8CFF] transition-colors">
              Trang chủ
            </Link>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
            <span className="text-[#1A8CFF] font-semibold">{current.title}</span>
          </nav>

          <h1 className="font-bold text-[30px] sm:text-[38px] md:text-[46px] leading-[1.2] tracking-tight text-[#1E1E1E]">
            {current.title}
          </h1>
          <p className="text-base leading-relaxed text-[#4A4A4A] max-w-[680px]">
            {current.lead}
          </p>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="max-w-[1240px] mx-auto px-6 py-10 pb-24 flex flex-col md:flex-row gap-9 items-start">
        {/* Sidebar */}
        <aside className="w-full md:w-[280px] shrink-0 sticky top-24 flex flex-col gap-1.5">
          <span className="px-3 pb-1.5 text-xs font-bold tracking-[0.08em] text-[#8A8F99] uppercase">
            Hỗ trợ
          </span>
          {SUPPORT_TABS.map((t) => {
            const isActive = t.key === currentTab
            return (
              <Link
                key={t.key}
                href={t.href}
                className="flex items-center gap-3 p-3 rounded-2xl text-[15px] font-semibold transition-all duration-200"
                style={{
                  backgroundColor: isActive ? t.softBg : 'transparent',
                  color: isActive ? t.color : '#1E1E1E',
                }}
              >
                <span
                  className="w-[34px] h-[34px] rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200"
                  style={{
                    backgroundColor: isActive ? t.color : '#F1F3F7',
                    color: isActive ? '#FFFFFF' : '#4A4A4A',
                  }}
                >
                  {t.icon}
                </span>
                <span>{t.title}</span>
              </Link>
            )
          })}
        </aside>

        {/* Dynamic Page Content */}
        <div className="flex-1 min-w-0 w-full">
          {children}
        </div>
      </section>
    </div>
  )
}
