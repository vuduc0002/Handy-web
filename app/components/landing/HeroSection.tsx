'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Search } from 'lucide-react'

export default function HeroSection() {
  const handleScrollToRoadmap = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const target = document.getElementById('lo-trinh')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleFocusSearch = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => {
      const input = document.querySelector('header input[type="text"]') as HTMLInputElement
      input?.focus()
    }, 300)
  }

  return (
    <section
      id="top"
      className="relative overflow-hidden font-sans"
      style={{
        background:
          'radial-gradient(55% 80% at 0% 50%,#FFE9EC 0%,rgba(255,233,236,0) 70%),radial-gradient(45% 60% at 100% 0%,#E2F0FF 0%,rgba(226,240,255,0) 70%),transparent',
      }}
    >
      <div className="max-w-[1240px] mx-auto px-6 pt-10 pb-28 lg:pb-36 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left Column: Heading & CTAs */}
        <div className="flex flex-col gap-5 sm:gap-6 z-10">
          <h1 className="font-bold text-4xl sm:text-5xl lg:text-[58px] leading-[1.18] tracking-tight text-[#1E1E1E]">
            Phá vỡ <span className="text-[#1A8CFF]">rào cản</span> bằng ngôn ngữ ký hiệu
          </h1>

          <p className="text-base sm:text-lg text-[#4A4A4A] leading-relaxed max-w-[580px]">
            HANDY đồng hành cùng bạn khám phá ngôn ngữ ký hiệu qua nội dung trực quan, chủ đề gần gũi và công cụ tra cứu thuận tiện. Bắt đầu từ một ký hiệu nhỏ để kết nối với thế giới xung quanh.
          </p>

          <div className="flex items-center gap-3.5 flex-wrap pt-2">
            <a
              href="#lo-trinh"
              onClick={handleScrollToRoadmap}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-[15px] text-white bg-gradient-to-r from-[#0050B3] to-[#1A8CFF] hover:brightness-105 shadow-[0_12px_28px_rgba(26,140,255,0.3)] transition-all cursor-pointer"
            >
              <span>Bắt đầu học</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </a>

            <a
              href="#"
              onClick={handleFocusSearch}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full font-semibold text-[15px] text-[#1E1E1E] bg-white border border-[#E3E7EE] hover:border-[#1A8CFF] hover:text-[#1A8CFF] transition-all cursor-pointer shadow-sm"
            >
              <Search className="w-4 h-4 text-[#1A8CFF] stroke-[2.5]" />
              <span>Tìm kiếm từ vựng</span>
            </a>
          </div>
        </div>

        {/* Right Column: Hero Girl Image */}
        <div className="w-full max-w-[560px] mx-auto justify-self-center z-10">
          <Image
            src="/assets/hero-girl-sm.png"
            alt="Người học ngôn ngữ ký hiệu cùng HANDY"
            width={560}
            height={560}
            sizes="(max-width: 768px) 100vw, 560px"
            priority
            className="w-full h-auto block object-contain select-none"
          />
        </div>
      </div>
    </section>
  )
}
