'use client'

import { ArrowDown } from 'lucide-react'

export default function HeroSection() {
  const scrollToTopics = () => {
    const el = document.getElementById('topics-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="py-12 md:py-16 text-center max-w-4xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm border-2 border-amber-200 rounded-3xl p-8 md:p-12 shadow-sm">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-800 leading-tight mb-4">
          [Điền Tiêu đề chính: Nêu bật tên sản phẩm hoặc Slogan thu hút]
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
          [Điền Đoạn mô tả: Giải thích ngắn gọn ứng dụng này giải quyết vấn đề gì hoặc mang lại lợi ích gì cho người dùng]
        </p>
        <button
          onClick={scrollToTopics}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-base shadow-lg shadow-amber-200 transition active:scale-95 cursor-pointer"
        >
          <span>[Tên Nút: Lời kêu gọi hành động]</span>
          <ArrowDown className="w-5 h-5 animate-bounce" />
        </button>
      </div>
    </section>
  )
}
