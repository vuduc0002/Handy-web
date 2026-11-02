'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen, Heart, Hand, Play } from 'lucide-react'

export default function CTASection() {
  const handleScrollToRoadmap = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const target = document.getElementById('lo-trinh')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      className="relative overflow-hidden font-sans text-white py-28 lg:py-36"
      style={{
        background:
          'radial-gradient(60% 90% at 15% 0%,#4FB0FF 0%,rgba(79,176,255,0) 60%),radial-gradient(50% 80% at 100% 100%,#1478EA 0%,rgba(20,120,234,0) 70%),#2A97FF',
      }}
    >
      {/* Decorative dot matrix overlay */}
      <span
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.7) 1.5px,transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Floating Graphic: Yellow Hand */}
      <div
        aria-hidden="true"
        className="hidden sm:flex absolute left-[6%] top-14 w-20 h-20 lg:w-24 lg:h-24 rounded-3xl bg-[#FFD84D] text-[#1E1E1E] -rotate-12 items-center justify-center shadow-[0_10px_0_rgba(0,40,100,0.15)] pointer-events-none animate-handy-float"
      >
        <Hand className="w-10 h-10 lg:w-12 lg:h-12 stroke-[1.8]" />
      </div>

      {/* Floating Graphic: Pink Heart */}
      <div
        aria-hidden="true"
        className="hidden sm:flex absolute right-[7%] top-16 w-18 h-16 lg:w-20 lg:h-18 rounded-3xl bg-[#F0436A] text-white rotate-12 items-center justify-center shadow-[0_10px_0_rgba(0,40,100,0.15)] pointer-events-none animate-handy-float [animation-delay:-2.5s]"
      >
        <Heart className="w-8 h-8 lg:w-9 lg:h-9 fill-current stroke-none" />
      </div>

      {/* Floating Graphic: Green Play */}
      <div
        aria-hidden="true"
        className="hidden md:flex absolute right-[12%] bottom-36 w-16 h-16 rounded-full bg-[#17A673] text-white items-center justify-center shadow-[0_10px_0_rgba(0,40,100,0.15)] pointer-events-none animate-handy-float [animation-delay:-4s]"
      >
        <Play className="w-7 h-7 fill-current stroke-none ml-0.5" />
      </div>

      {/* Center Content */}
      <div className="relative z-10 max-w-[820px] mx-auto px-6 flex flex-col items-center gap-6 text-center">
        <h2 className="font-bold text-3xl sm:text-4xl lg:text-[50px] leading-tight tracking-tight text-white">
          Bắt đầu{' '}
          <span className="inline-block bg-[#FFD84D] text-[#1E1E1E] px-4 pb-1 rounded-2xl -rotate-2 shadow-[0_6px_0_rgba(0,40,100,0.18)]">
            hành trình
          </span>{' '}
          cùng HANDY
        </h2>

        <p className="text-base sm:text-lg text-white/95 max-w-[620px] leading-relaxed">
          Một ký hiệu mới có thể mở ra một cách kết nối mới. Khám phá nội dung học tập và bắt đầu làm quen với ngôn ngữ ký hiệu ngay hôm nay.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap pt-2">
          <a
            href="#lo-trinh"
            onClick={handleScrollToRoadmap}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-[15px] text-white bg-gradient-to-r from-[#B0173C] to-[#F0436A] hover:brightness-105 shadow-[0_12px_28px_rgba(176,23,60,0.35)] transition-all cursor-pointer"
          >
            <span>Bắt đầu khám phá</span>
            <ArrowRight className="w-4 h-4 stroke-[2.6]" />
          </a>

          <Link
            href="/topics"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-[15px] text-[#0B6FE0] bg-white hover:bg-[#F4F9FF] shadow-sm transition-all"
          >
            <BookOpen className="w-4 h-4 stroke-[2.2]" />
            <span>Xem các chủ đề</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
