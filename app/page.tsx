'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'
import HeroSection from '@/app/components/HeroSection'
import StatsAndBenefitsSection from '@/app/components/StatsAndBenefitsSection'
import TopicsGrid from '@/app/components/TopicsGrid'
import TestimonialsSection from '@/app/components/TestimonialsSection'
import FAQSection from '@/app/components/FAQSection'
import { Loader2 } from 'lucide-react'

function GridSkeleton() {
  return (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      {/* 1. HERO SECTION (Hấp dẫn, giàu thị giác, 2 cột + hiệu ứng fade-in-up) */}
      <HeroSection />

      {/* 2. STATS & BENEFITS SECTION (Khối thông tin nổi bật với hiệu ứng Domino Stagger) */}
      <StatsAndBenefitsSection />

      {/* 3. LỘ TRÌNH HỌC TẬP (Topics Section bọc trong motion.div) */}
      <motion.section
        id="topics-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="pt-8 md:pt-16 pb-8 md:pb-12 scroll-mt-20"
      >
        <div className="text-center mb-10 md:mb-12">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-100 px-3.5 py-1.5 rounded-full inline-block mb-3">
            Kho Bài Giảng Phong Phú
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            Lộ Trình Học Tập Của Bạn
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            Hãy chọn chủ đề và bắt đầu hành trình của bạn ngay hôm nay!
          </p>
        </div>

        {/* Lưới danh sách chủ đề học tập kết nối Supabase */}
        <Suspense fallback={<GridSkeleton />}>
          <TopicsGrid />
        </Suspense>
      </motion.section>

      {/* 4. TESTIMONIALS (Đánh giá học viên & phụ huynh với hiệu ứng Domino Stagger) */}
      <TestimonialsSection />

      {/* 5. FAQ SECTION (Giải đáp thắc mắc thường gặp với hiệu ứng Scroll Reveal) */}
      <FAQSection />
    </div>
  )
}
