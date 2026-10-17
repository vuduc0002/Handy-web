'use client'

import { BarChart3, Sparkles, Layers, Award } from 'lucide-react'
import { motion } from 'framer-motion'

export default function StatsAndBenefitsSection() {
  const placeholders = [
    { icon: <BarChart3 className="w-6 h-6 text-gray-400" /> },
    { icon: <Sparkles className="w-6 h-6 text-gray-400" /> },
    { icon: <Layers className="w-6 h-6 text-gray-400" /> },
    { icon: <Award className="w-6 h-6 text-gray-400" /> },
  ]

  return (
    <section className="mb-16 md:mb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {placeholders.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.15 }}
            className="w-full min-h-[150px] rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex flex-col items-center justify-center p-6 text-center hover:border-gray-400 hover:bg-gray-50/80 transition-all duration-300 shadow-2xs"
          >
            <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center mb-2.5">
              {item.icon}
            </div>
            <p className="text-xs sm:text-sm font-bold text-gray-500 leading-snug">
              Khối thông tin nổi bật (Tính năng/Số liệu)
            </p>
            <p className="text-xs text-gray-400 italic mt-1">
              (Chờ Admin cập nhật)
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
