'use client'

import { Sparkles, ArrowRight, Play, Video } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function HeroSection() {
  const scrollToTopics = () => {
    const el = document.getElementById('topics-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative overflow-hidden pt-8 pb-14 md:py-20 bg-gradient-to-br from-amber-100/90 via-orange-50/70 to-amber-50 rounded-3xl border-2 border-amber-200/80 shadow-sm mb-12 md:mb-16">
      {/* Pattern chấm bi chìm nhẹ */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#ea580c 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Cột trái: Tiêu đề, mô tả và 2 nút CTA bọc trong motion.div */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="lg:col-span-7 text-center lg:text-left space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-amber-300 text-amber-800 text-xs sm:text-sm font-extrabold shadow-sm">
            <Sparkles className="w-4 h-4 text-orange-500 fill-orange-400" />
            <span>Nền tảng học thủ ngữ trực quan số 1 cho trẻ</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black text-gray-900 leading-[1.15] tracking-tight">
            Phá Vỡ Rào Cản <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600">
              Ngôn Ngữ
            </span>{' '}
            Bằng{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              Ký Hiệu
            </span>{' '}
            🌟
          </h1>

          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Học ngôn ngữ ký hiệu tự nhiên & hào hứng cùng <strong className="text-orange-500 font-extrabold">HANDY</strong>! Khám phá từ vựng qua video sinh động, học thật vui và dễ dàng.
          </p>

          {/* Cụm nút Call-to-Action */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
            <button
              onClick={scrollToTopics}
              className="relative group w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-500 text-white font-black text-base shadow-lg shadow-orange-400/40 hover:shadow-orange-500/60 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer animate-pulse-glow"
            >
              <span>Học thử miễn phí</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <Link 
              href="/font-demo" 
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-3.5 border-2 border-purple-500 text-purple-700 font-bold rounded-xl hover:bg-purple-50 transition-colors shadow-sm active:scale-95"
            >
              🎨 Trải nghiệm Font Cao Cấp
            </Link>

            <button
              onClick={scrollToTopics}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/90 hover:bg-white text-gray-700 font-extrabold text-base border-2 border-amber-300/80 hover:border-orange-400 shadow-sm transition-all duration-200 active:scale-95 cursor-pointer hover:shadow-md"
            >
              <Play className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>Tìm hiểu thêm</span>
            </button>
          </div>
        </motion.div>

        {/* Cột phải: Khối Placeholder lớn (aspect-video) được bảo tồn 100% thiết kế nét đứt */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          className="lg:col-span-5 w-full"
        >
          <div className="w-full aspect-video rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex flex-col items-center justify-center p-6 text-center shadow-inner hover:border-gray-400 hover:bg-gray-50/80 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
              <Video className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-gray-500 max-w-xs">
              Khu vực hiển thị Video / Banner nổi bật
            </p>
            <p className="text-xs text-gray-400 italic mt-1">
              (Chờ Admin cập nhật)
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
