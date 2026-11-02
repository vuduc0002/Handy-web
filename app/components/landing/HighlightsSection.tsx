'use client'

import { BookOpen, Layers, Video, Search } from 'lucide-react'

export default function HighlightsSection() {
  const highlights = [
    {
      title: 'Sách theo chủ đề',
      desc: 'Nội dung ký hiệu sắp xếp theo từng chủ đề gần gũi',
      icon: <BookOpen className="w-6 h-6 stroke-[2]" />,
      bg: 'bg-[#FFF4F2]',
      border: 'border-[#F9C9C1]',
      text: 'text-[#E8503A]',
      iconColor: 'text-[#E8503A]',
      shadow: 'hover:shadow-[0_18px_38px_rgba(232,80,58,0.24)] shadow-[0_12px_28px_rgba(232,80,58,0.12)]',
    },
    {
      title: 'Flashcard',
      desc: 'Thẻ học trực quan, quét mã QR để xem video',
      icon: <Layers className="w-6 h-6 stroke-[2]" />,
      bg: 'bg-[#FFFBEA]',
      border: 'border-[#F6E2A0]',
      text: 'text-[#D99A00]',
      iconColor: 'text-[#D99A00]',
      shadow: 'hover:shadow-[0_18px_38px_rgba(217,154,0,0.24)] shadow-[0_12px_28px_rgba(217,154,0,0.12)]',
    },
    {
      title: 'Video minh họa',
      desc: 'Quan sát cách thực hiện từng ký hiệu',
      icon: <Video className="w-6 h-6 stroke-[2]" />,
      bg: 'bg-[#F0FBF6]',
      border: 'border-[#B9E6D3]',
      text: 'text-[#17A673]',
      iconColor: 'text-[#17A673]',
      shadow: 'hover:shadow-[0_18px_38px_rgba(23,166,115,0.24)] shadow-[0_12px_28px_rgba(23,166,115,0.12)]',
    },
    {
      title: 'Website tra cứu',
      desc: 'Tìm ký hiệu theo từ khóa, dùng tốt trên điện thoại và máy tính',
      icon: <Search className="w-6 h-6 stroke-[2]" />,
      bg: 'bg-[#F7F3FC]',
      border: 'border-[#D9CCEE]',
      text: 'text-[#7B5BB5]',
      iconColor: 'text-[#7B5BB5]',
      shadow: 'hover:shadow-[0_18px_38px_rgba(123,91,181,0.24)] shadow-[0_12px_28px_rgba(123,91,181,0.12)]',
    },
  ]

  return (
    <section className="relative z-20 -mt-20 sm:-mt-24 font-sans">
      <div className="max-w-[1240px] mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {highlights.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-4 p-5 rounded-2xl border ${item.bg} ${item.border} ${item.shadow} transition-all duration-300 hover:-translate-y-1`}
            >
              <div
                className={`w-14 h-14 rounded-full bg-white ${item.iconColor} shadow-md flex items-center justify-center shrink-0`}
              >
                {item.icon}
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className={`text-lg font-bold ${item.text} leading-snug truncate`}>
                  {item.title}
                </span>
                <span className="text-[13.5px] leading-relaxed text-[#4A4A4A] line-clamp-2">
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
