import { Sparkles, Video, Award } from 'lucide-react'

export default function FeaturesSection() {
  const features = [
    {
      icon: <Sparkles className="w-7 h-7 text-orange-500" />,
      title: '[Tên Tính năng 1]',
      desc: '[Mô tả chi tiết 1-2 câu cho tính năng 1]',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      icon: <Video className="w-7 h-7 text-amber-500" />,
      title: '[Tên Tính năng 2]',
      desc: '[Mô tả chi tiết 1-2 câu cho tính năng 2]',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      icon: <Award className="w-7 h-7 text-emerald-500" />,
      title: '[Tên Tính năng 3]',
      desc: '[Mô tả chi tiết 1-2 câu cho tính năng 3]',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
  ]

  return (
    <section className="py-10 md:py-14">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
          [Điền Tiêu đề: Tại sao nên chọn ứng dụng này?]
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-3xl border-2 ${feature.borderColor} p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center text-center`}
          >
            <div
              className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-4 shadow-inner`}
            >
              {feature.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
