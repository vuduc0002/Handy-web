'use client'

import { MessageSquareQuote } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TestimonialsSection() {
  return (
    <section className="my-16 md:my-24">
      {/* Tiêu đề mục Đánh giá có hiệu ứng Fade-in-up */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center max-w-2xl mx-auto mb-10"
      >
        <span className="text-xs font-black text-amber-700 uppercase tracking-widest bg-amber-100 px-3.5 py-1.5 rounded-full inline-block mb-3">
          Chia Sẻ Thực Tế
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-800">
          Học Viên & Phụ Huynh Nói Gì Về Handy?
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Ghi nhận những trải nghiệm và ý kiến đóng góp từ cộng đồng học viên
        </p>
      </motion.div>

      {/* 3 ô Placeholder Đánh giá trượt lên theo hiệu ứng Domino Stagger (0s, 0.2s, 0.4s) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {[0, 1, 2].map((idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.2 }}
            className="w-full min-h-[200px] rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex flex-col items-center justify-center p-6 sm:p-8 text-center hover:border-gray-400 hover:bg-gray-50/80 transition-all duration-300 shadow-2xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
              <MessageSquareQuote className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-500 max-w-xs leading-snug">
              Khu vực hiển thị Đánh giá của Học viên
            </p>
            <p className="text-xs text-gray-400 italic mt-1.5">
              (Chờ Admin cập nhật)
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
