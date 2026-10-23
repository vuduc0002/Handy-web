import Link from 'next/link'
import { ArrowLeft, Sparkles, Palette } from 'lucide-react'

// Các biến thể font demo sử dụng CSS classes
const quicksand = { className: 'font-sans' }
const nunito = { className: 'font-sans' }
const jakarta = { className: 'font-sans' }
const montserrat = { className: 'font-sans' }
const beVietnam = { className: 'font-be-vietnam' }

export default function FontDemoPage() {
  const sampleText = {
    badge: 'Kho Bài Giảng Phong Phú',
    heading: 'Lộ Trình Học Tập Của Bạn',
    paragraph:
      'Hãy chọn chủ đề và bắt đầu hành trình của bạn ngay hôm nay! (Hiển thị các số: 0 1 2 3 4 5 6 7 8 9)'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-14">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Thanh Header điều hướng */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-purple-200 shadow-sm">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-purple-600 mb-2 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại Trang chủ
            </Link>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-purple-100 text-purple-700">
                <Palette className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  Bảng Demo Typography - Dự án HANDY
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  So sánh trực quan độ mượt mà của dấu tiếng Việt ở 5 Font cao cấp để chọn font chính thức.
                </p>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-purple-100 text-purple-700 text-xs font-extrabold border border-purple-200 shadow-xs">
              <Sparkles className="w-4 h-4 text-purple-600" /> Review Nội Bộ
            </span>
          </div>
        </div>

        {/* 1. Gói EdTech: Quicksand */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Option 1: EdTech (Giáo Dục)
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-2">
                Quicksand <span className="text-sm font-normal text-gray-500">(Bo tròn, đáng yêu, thân thiện)</span>
              </h2>
            </div>
          </div>
          <div className={quicksand.className}>
            <span className="text-sm font-bold text-orange-600 uppercase tracking-widest bg-orange-100 px-3.5 py-1.5 rounded-full inline-block">
              {sampleText.badge}
            </span>
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-2">
              {sampleText.heading}
            </h3>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              {sampleText.paragraph}
            </p>
          </div>
        </div>

        {/* 2. Gói EdTech: Nunito */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border-2 border-purple-200 ring-2 ring-purple-100 transition-all hover:shadow-md">
          <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Option 1: EdTech (Đề xuất số 1 cho Trẻ Em)
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-2">
                Nunito <span className="text-sm font-normal text-gray-500">(Mềm mại, chuẩn mực giáo dục)</span>
              </h2>
            </div>
            <span className="text-xs font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
              Khuyên dùng
            </span>
          </div>
          <div className={nunito.className}>
            <span className="text-sm font-black text-orange-600 uppercase tracking-widest bg-orange-100 px-3.5 py-1.5 rounded-full inline-block">
              {sampleText.badge}
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-2">
              {sampleText.heading}
            </h3>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              {sampleText.paragraph}
            </p>
          </div>
        </div>

        {/* 3. Gói SaaS: Plus Jakarta Sans */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Option 2: SaaS & Admin
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-2">
                Plus Jakarta Sans <span className="text-sm font-normal text-gray-500">(Sắc sảo, tối giản, hiện đại)</span>
              </h2>
            </div>
          </div>
          <div className={jakarta.className}>
            <span className="text-sm font-extrabold text-orange-600 uppercase tracking-widest bg-orange-100 px-3.5 py-1.5 rounded-full inline-block">
              {sampleText.badge}
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 mb-2">
              {sampleText.heading}
            </h3>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              {sampleText.paragraph}
            </p>
          </div>
        </div>

        {/* 4. Gói SaaS: Montserrat */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Option 2: SaaS & Admin
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-2">
                Montserrat <span className="text-sm font-normal text-gray-500">(Hình học, quyền lực, cứng cáp)</span>
              </h2>
            </div>
          </div>
          <div className={montserrat.className}>
            <span className="text-sm font-black text-orange-600 uppercase tracking-widest bg-orange-100 px-3.5 py-1.5 rounded-full inline-block">
              {sampleText.badge}
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-2">
              {sampleText.heading}
            </h3>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              {sampleText.paragraph}
            </p>
          </div>
        </div>

        {/* 5. Gói Bản địa hóa: Be Vietnam Pro */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-emerald-200 transition-all hover:shadow-md">
          <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Option 3: Tối ưu Tiếng Việt
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-2">
                Be Vietnam Pro <span className="text-sm font-normal text-gray-500">(Dấu chuẩn xác 100%, nét căng)</span>
              </h2>
            </div>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Đang hoạt động
            </span>
          </div>
          <div className={beVietnam.className}>
            <span className="text-sm font-black text-orange-600 uppercase tracking-widest bg-orange-100 px-3.5 py-1.5 rounded-full inline-block">
              {sampleText.badge}
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-2">
              {sampleText.heading}
            </h3>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              {sampleText.paragraph}
            </p>
          </div>
        </div>

        {/* Ghi chú chân trang */}
        <div className="p-5 bg-purple-50 rounded-2xl border border-purple-200 text-center">
          <p className="text-sm font-bold text-purple-900">
            💬 Quý khách hàng thích bộ font nào nhất? Vui lòng gửi lại tên Font để đội ngũ kỹ thuật áp dụng chính thức cho toàn bộ website!
          </p>
        </div>

      </div>
    </div>
  )
}
