'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight, Play, Heart, Users, Star } from 'lucide-react'

export default function HeroSection() {
  const scrollToTopics = () => {
    const el = document.getElementById('topics-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative overflow-hidden pt-8 pb-14 md:py-20 bg-gradient-to-br from-amber-100/90 via-orange-50/70 to-amber-50 rounded-3xl border-2 border-amber-200/80 shadow-sm mb-12">
      {/* Pattern chấm bi chìm nhẹ tạo chiều sâu */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#ea580c 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Cột trái: Nội dung tiêu đề, mô tả và CTA */}
        <div className="lg:col-span-7 text-center lg:text-left space-y-6">
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

          {/* Hai nút CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              onClick={scrollToTopics}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-white font-black text-base shadow-lg shadow-orange-300/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <span>Học thử miễn phí</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={scrollToTopics}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white/90 hover:bg-white text-gray-700 font-extrabold text-base border-2 border-amber-300/80 hover:border-orange-400 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>Tìm hiểu thêm</span>
            </button>
          </div>

          {/* Đánh giá nhanh */}
          <div className="flex items-center justify-center lg:justify-start gap-6 pt-3 text-xs font-bold text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="flex text-amber-400">★★★★★</span>
              <span className="text-gray-700">4.9/5 (2,400+ phụ huynh)</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-gray-700">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Thân thiện với trẻ em</span>
            </div>
          </div>
        </div>

        {/* Cột phải: Mockup Illustration sinh động */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          {/* Vòng sáng nền */}
          <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-orange-300/40 to-amber-200/50 blur-2xl" />

          {/* Khung minh họa chính */}
          <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 sm:p-8 border-4 border-amber-300/90 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <span className="text-xs font-black text-orange-500 tracking-wider">HANDY KIDS</span>
            </div>

            {/* Illustration Canvas đại diện cô giáo và bé */}
            <div className="relative aspect-[4/3] rounded-2xl bg-gradient-to-b from-amber-100 via-orange-50 to-amber-100/60 border-2 border-dashed border-amber-300 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
              <div className="text-6xl sm:text-7xl mb-2 animate-bounce">
                👩‍🏫 🤟 👧
              </div>
              <p className="text-sm font-black text-gray-800">
                Giao tiếp vui vẻ qua đôi bàn tay
              </p>
              <span className="text-xs text-orange-600 font-bold bg-white/80 px-3 py-1 rounded-full mt-1 shadow-sm">
                Từ vựng: "Xin chào & Cảm ơn"
              </span>

              {/* Tag nổi mini */}
              <div className="absolute bottom-2 left-2 bg-white/95 border border-amber-200 rounded-xl px-2.5 py-1 text-[11px] font-extrabold text-amber-800 shadow-sm flex items-center gap-1">
                <span>👌</span> Dễ bắt chước
              </div>
              <div className="absolute top-2 right-2 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl px-2.5 py-1 text-[11px] font-extrabold shadow-sm flex items-center gap-1">
                <span>⭐</span> Trực quan 100%
              </div>
            </div>

            {/* Thẻ nổi phía dưới */}
            <div className="flex items-center justify-between p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs font-bold text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black">
                  🤟
                </div>
                <div>
                  <p className="font-extrabold text-gray-800">Bài học hôm nay</p>
                  <p className="text-[11px] text-gray-500">Chủ đề: Gia đình yêu thương</p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                Miễn phí
              </span>
            </div>
          </div>

          {/* Emoji/Icon lơ lửng xung quanh tạo chiều sâu */}
          <div className="absolute -top-3 -right-2 sm:-right-4 bg-white p-3 rounded-2xl shadow-xl border-2 border-amber-200 text-2xl animate-pulse">
            ✨
          </div>
          <div className="absolute -bottom-4 -left-3 sm:-left-6 bg-white p-3 rounded-2xl shadow-xl border-2 border-amber-200 text-2xl">
            👋
          </div>
          <div className="absolute top-1/2 -right-4 sm:-right-8 bg-amber-400 text-white p-2.5 rounded-2xl shadow-lg font-black text-xs hidden sm:block">
            ❤️ Yêu thương
          </div>
        </div>
      </div>
    </section>
  )
}
