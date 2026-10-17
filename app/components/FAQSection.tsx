'use client'

import { HelpCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function FAQSection() {
  return (
    <section className="my-16 md:my-24 max-w-4xl mx-auto px-2">
      {/* Tiêu đề mục FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center mb-10"
      >
        <span className="text-xs font-black text-orange-600 uppercase tracking-widest bg-orange-100 px-3.5 py-1.5 rounded-full inline-block mb-3">
          Hỗ Trợ 24/7
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-800">
          Câu Hỏi Thường Gặp (FAQ)
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Giải đáp các thắc mắc phổ biến nhất khi học tập cùng Handy
        </p>
      </motion.div>

      {/* 1 Khối Placeholder lớn cho toàn bộ danh sách FAQ với hiệu ứng trượt lên */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
        className="w-full min-h-[220px] rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex flex-col items-center justify-center p-8 text-center hover:border-gray-400 hover:bg-gray-50/80 transition-all duration-300 shadow-2xs"
      >
        <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
          <HelpCircle className="w-7 h-7" />
        </div>
        <p className="text-base font-bold text-gray-500">
          Khu vực hiển thị Danh sách câu hỏi FAQ
        </p>
        <p className="text-xs text-gray-400 italic mt-1.5">
          (Chờ Admin cập nhật)
        </p>
      </motion.div>
    </section>
  )
}
