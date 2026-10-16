import { BarChart3, Sparkles, Layers, Award } from 'lucide-react'

export default function StatsAndBenefitsSection() {
  const placeholders = [
    { icon: <BarChart3 className="w-6 h-6 text-gray-400" /> },
    { icon: <Sparkles className="w-6 h-6 text-gray-400" /> },
    { icon: <Layers className="w-6 h-6 text-gray-400" /> },
    { icon: <Award className="w-6 h-6 text-gray-400" /> },
  ]

  return (
    <section className="mb-14">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {placeholders.map((item, idx) => (
          <div
            key={idx}
            className="w-full min-h-[140px] rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex flex-col items-center justify-center p-6 text-center hover:border-gray-400 transition-colors"
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
          </div>
        ))}
      </div>
    </section>
  )
}
