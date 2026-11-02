'use client'

import { Search, LayoutGrid, Video, BookMarked } from 'lucide-react'

export default function FeatureCardsSection() {
  const features = [
    {
      num: '01',
      title: 'Từ điển ngôn ngữ ký hiệu',
      desc: 'Tìm kiếm và tra cứu ký hiệu theo từ khóa, giúp bạn dễ dàng tìm nội dung cần học.',
      icon: <Search className="w-7 h-7 stroke-[2.2]" />,
      colorType: 'blue',
      // Base styles
      baseBorder: 'border-[#1A8CFF]/25',
      baseShadow: 'shadow-[0_14px_34px_rgba(26,140,255,0.12)]',
      numColor: 'text-[#1A8CFF]/20 group-hover:text-white/20',
      iconGradient: 'from-[#5CB0FF] to-[#1A8CFF]',
      iconShadow: 'shadow-[0_12px_24px_rgba(26,140,255,0.35)]',
      // Hover styles
      hoverBg: 'hover:bg-[#0B6FE0] hover:border-[#0B6FE0] hover:shadow-[0_24px_48px_rgba(26,140,255,0.35)]',
      hoverIcon: 'group-hover:text-[#1A8CFF]',
    },
    {
      num: '02',
      title: 'Bảng ngôn ngữ ký hiệu',
      desc: 'Khám phá các ký hiệu quen thuộc được sắp xếp theo chủ đề, từ những điều đơn giản trong cuộc sống.',
      icon: <LayoutGrid className="w-7 h-7 stroke-[2.2]" />,
      colorType: 'pink',
      baseBorder: 'border-[#F0436A]/25',
      baseShadow: 'shadow-[0_14px_34px_rgba(240,67,106,0.12)]',
      numColor: 'text-[#F0436A]/20 group-hover:text-white/20',
      iconGradient: 'from-[#FF7A96] to-[#F0436A]',
      iconShadow: 'shadow-[0_12px_24px_rgba(240,67,106,0.35)]',
      hoverBg: 'hover:bg-[#C8284F] hover:border-[#C8284F] hover:shadow-[0_24px_48px_rgba(240,67,106,0.35)]',
      hoverIcon: 'group-hover:text-[#F0436A]',
    },
    {
      num: '03',
      title: 'Học tập trực quan',
      desc: 'Quan sát hình ảnh hoặc video minh họa để làm quen với hình thức thể hiện của từng ký hiệu.',
      icon: <Video className="w-7 h-7 stroke-[2.2]" />,
      colorType: 'green',
      baseBorder: 'border-[#17A673]/25',
      baseShadow: 'shadow-[0_14px_34px_rgba(23,166,115,0.12)]',
      numColor: 'text-[#17A673]/20 group-hover:text-white/20',
      iconGradient: 'from-[#4FCF9C] to-[#17A673]',
      iconShadow: 'shadow-[0_12px_24px_rgba(23,166,115,0.35)]',
      hoverBg: 'hover:bg-[#0C8558] hover:border-[#0C8558] hover:shadow-[0_24px_48px_rgba(23,166,115,0.35)]',
      hoverIcon: 'group-hover:text-[#17A673]',
    },
    {
      num: '04',
      title: 'Học theo chủ đề',
      desc: 'Bắt đầu từ chào hỏi, giao tiếp cơ bản và từng bước mở rộng vốn ký hiệu của mình.',
      icon: <BookMarked className="w-7 h-7 stroke-[2.2]" />,
      colorType: 'purple',
      baseBorder: 'border-[#7B5BB5]/25',
      baseShadow: 'shadow-[0_14px_34px_rgba(123,91,181,0.12)]',
      numColor: 'text-[#7B5BB5]/20 group-hover:text-white/20',
      iconGradient: 'from-[#A286D6] to-[#7B5BB5]',
      iconShadow: 'shadow-[0_12px_24px_rgba(123,91,181,0.35)]',
      hoverBg: 'hover:bg-[#5F4396] hover:border-[#5F4396] hover:shadow-[0_24px_48px_rgba(123,91,181,0.35)]',
      hoverIcon: 'group-hover:text-[#7B5BB5]',
    },
  ]

  return (
    <section id="tinh-nang" className="relative overflow-hidden bg-white py-24 font-sans">
      {/* Decorative floating shapes */}
      <span
        aria-hidden="true"
        className="absolute left-[3%] top-28 w-[30px] h-[30px] rounded-full border-[5px] border-[#F9C31F] pointer-events-none"
      />
      <span
        aria-hidden="true"
        className="absolute right-[5%] top-36 w-3.5 h-3.5 rounded-full bg-[#F0436A] pointer-events-none animate-handy-float"
      />
      <svg
        aria-hidden="true"
        className="absolute right-[9%] bottom-20 pointer-events-none animate-handy-twinkle"
        width="22"
        height="22"
        viewBox="0 0 40 40"
      >
        <path
          d="M20 0 C21.5 13 27 18.5 40 20 C27 21.5 21.5 27 20 40 C18.5 27 13 21.5 0 20 C13 18.5 18.5 13 20 0Z"
          fill="#1A8CFF"
        />
      </svg>

      <div className="relative z-10 max-w-[1240px] mx-auto px-6 flex flex-col gap-12">
        {/* Section Heading */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-bold text-3xl sm:text-4xl lg:text-[40px] text-[#1E1E1E] tracking-tight">
            Làm quen với <span className="text-[#1A8CFF]">ngôn ngữ ký hiệu</span> theo cách trực quan
          </h2>
          <p className="text-base text-[#4A4A4A] max-w-[680px] leading-relaxed">
            HANDY kết hợp từ điển tra cứu, bảng ký hiệu theo chủ đề và video minh họa, giúp bạn dễ dàng tìm, xem và ghi nhớ từng ký hiệu.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => (
            <div
              key={feat.num}
              className={`group relative overflow-hidden isolate flex flex-col gap-3 p-7 rounded-3xl bg-white border ${feat.baseBorder} ${feat.baseShadow} ${feat.hoverBg} transition-all duration-300 hover:-translate-y-2 cursor-default`}
            >
              {/* Corner big number */}
              <span
                className={`absolute top-3.5 right-5 text-6xl font-bold leading-none select-none transition-colors duration-300 ${feat.numColor}`}
              >
                {feat.num}
              </span>

              {/* Icon Container */}
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feat.iconGradient} text-white flex items-center justify-center mb-2.5 ${feat.iconShadow} -rotate-6 transition-all duration-300 group-hover:rotate-0 group-hover:scale-105 group-hover:bg-white ${feat.hoverIcon} group-hover:shadow-lg`}
              >
                {feat.icon}
              </div>

              {/* Title */}
              <h3 className="font-bold text-xl text-[#1E1E1E] leading-snug group-hover:text-white transition-colors duration-300">
                {feat.title}
              </h3>

              {/* Description */}
              <p className="text-[14.5px] leading-relaxed text-[#4A4A4A] group-hover:text-white/90 transition-colors duration-300">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
