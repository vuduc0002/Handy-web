import { BookOpen, Video, Users, CheckCircle2, ArrowRight, UserPlus, PlayCircle, Award } from 'lucide-react'

export default function StatsAndBenefitsSection() {
  const stats = [
    {
      number: '30+',
      label: 'Chủ đề học',
      icon: <BookOpen className="w-5 h-5 text-orange-500" />,
      color: 'bg-orange-50 border-orange-200',
    },
    {
      number: '1000+',
      label: 'Từ vựng video',
      icon: <Video className="w-5 h-5 text-amber-500" />,
      color: 'bg-amber-50 border-amber-200',
    },
    {
      number: '10,000+',
      label: 'Học viên',
      icon: <Users className="w-5 h-5 text-blue-500" />,
      color: 'bg-blue-50 border-blue-200',
    },
    {
      number: 'Quizlet',
      label: 'Luyện tập Quizlet',
      icon: <Award className="w-5 h-5 text-emerald-500" />,
      color: 'bg-emerald-50 border-emerald-200',
    },
  ]

  const steps = [
    {
      step: 'Bước 1',
      title: 'Đăng ký tài khoản',
      desc: 'Tạo tài khoản miễn phí chỉ trong 1 phút để lưu lại lộ trình học của bạn.',
      icon: <UserPlus className="w-6 h-6 text-orange-500" />,
      tag: '👤 Khởi đầu',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
    },
    {
      step: 'Bước 2',
      title: 'Xem video bài học',
      desc: 'Học từ vựng qua các video thủ ngữ trực quan, chuẩn xác và cực kỳ dễ hiểu.',
      icon: <PlayCircle className="w-6 h-6 text-amber-500" />,
      tag: '📺 Trực quan',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    {
      step: 'Bước 3',
      title: 'Luyện tập Quiz vui nhộn',
      desc: 'Ôn tập phản xạ dạng flashcard và trắc nghiệm game để ghi nhớ lâu dài.',
      icon: <Award className="w-6 h-6 text-emerald-500" />,
      tag: '✍️ Ghi nhớ',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
  ]

  return (
    <section className="mb-16 space-y-12">
      {/* 4 Khối thống kê nổi bật */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-3xl p-5 sm:p-6 border-2 ${stat.color} shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center sm:items-start`}
          >
            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-3">
              {stat.icon}
            </div>
            <p className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">
              {stat.number}
            </p>
            <p className="text-xs sm:text-sm font-bold text-gray-500 mt-0.5">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* 3 Bước đơn giản để chinh phục */}
      <div className="bg-white rounded-3xl border-2 border-amber-200/80 p-6 sm:p-10 shadow-sm">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-black text-orange-600 uppercase tracking-widest bg-orange-100 px-3.5 py-1.5 rounded-full inline-block mb-3">
            Phương Pháp Đột Phá
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-800">
            3 Bước Đơn Giản Để Chinh Phục
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Học ngôn ngữ ký hiệu chưa bao giờ nhẹ nhàng và trực quan đến thế
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className={`relative bg-amber-50/40 rounded-3xl p-6 border-2 ${s.border} flex flex-col items-center text-center group hover:bg-white hover:shadow-md transition-all duration-200`}
            >
              {/* Badge số thứ tự bước */}
              <div className="w-12 h-12 rounded-2xl bg-white shadow-md border-2 border-amber-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {s.icon}
              </div>

              <span className="text-[11px] font-black uppercase tracking-wider text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full mb-2">
                {s.step}
              </span>

              <h3 className="text-lg font-black text-gray-800 mb-2">
                {s.title}
              </h3>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {s.desc}
              </p>

              {/* Mũi tên liên kết bước trên desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border-2 border-amber-300 items-center justify-center shadow-sm text-orange-500">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
