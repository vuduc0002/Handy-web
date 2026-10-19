'use client'

import { motion } from 'framer-motion'
import TopicsGrid, { Topic } from '@/app/components/TopicsGrid'

interface TopicsSectionProps {
  initialTopics?: Topic[]
}

export default function TopicsSection({ initialTopics }: TopicsSectionProps) {
  return (
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

      {/* Lưới danh sách chủ đề học tập kết nối dữ liệu Server-rendered */}
      <TopicsGrid initialTopics={initialTopics} />
    </motion.section>
  )
}
