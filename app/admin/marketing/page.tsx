'use client'

import React, { useState } from 'react'
import MarketingKpiCards from './components/MarketingKpiCards'
import ConversionFunnelChart from './components/ConversionFunnelChart'
import TrafficChannelsChart from './components/TrafficChannelsChart'
import RetentionTrendChart from './components/RetentionTrendChart'
import {
  TrendingUp,
  Presentation,
  Download,
  Share2,
  Calendar,
  Sparkles,
  Award,
  Layers,
  ArrowRight,
  CheckCircle2,
  BookMarked,
  Printer,
  Maximize2,
} from 'lucide-react'

export default function MarketingReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'q3' | '6m' | 'all'>('q3')
  const [isSlideMode, setIsSlideMode] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className={`min-h-screen bg-gray-50/70 text-gray-900 font-sans pb-16 ${isSlideMode ? 'p-2 sm:p-4' : ''}`}>
      {/* Container chuẩn khổ ngang lý tưởng cho chụp slide trình chiếu 16:9 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ========================================================================= */}
        {/* TOP BAR: TIÊU ĐỀ BÁO CÁO & CÁC NÚT ĐIỀU KHIỂN TRÌNH CHIẾU                  */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#1E4FA8]/10 text-[#1E4FA8] border border-[#1E4FA8]/20">
                <Sparkles className="w-3 h-3 text-[#1E4FA8]" />
                Đồ án Marketing · EdTech SaaS
              </span>
              <span className="text-gray-400 text-xs">•</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Chiến dịch Q3/2026: Lan tỏa Ký hiệu
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
              <span>Báo Cáo Tăng Trưởng & Phễu Marketing</span>
              <span className="text-[#1E4FA8] font-mono text-xl sm:text-2xl font-black">(Handy Growth Deck)</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-3xl leading-relaxed">
              Dữ liệu phân tích hiệu quả chiến dịch chuyển đổi, chi phí CAC/LTV và xu hướng giữ chân học viên
              phục vụ slide báo cáo & thuyết trình đồ án chiến lược tiếp thị.
            </p>
          </div>

          {/* Action Buttons: Bộ lọc thời gian & Nút chụp slide */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0 print:hidden">
            <div className="flex items-center rounded-lg border border-gray-300 bg-white p-0.5 shadow-2xs text-xs">
              <button
                type="button"
                onClick={() => setSelectedPeriod('q3')}
                className={`px-3 py-1.5 rounded-md font-bold transition ${
                  selectedPeriod === 'q3'
                    ? 'bg-[#1E4FA8] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Quý 3 (Gần nhất)
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod('6m')}
                className={`px-3 py-1.5 rounded-md font-bold transition ${
                  selectedPeriod === '6m'
                    ? 'bg-[#1E4FA8] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                6 Tháng
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsSlideMode(!isSlideMode)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-2xs transition active:scale-95 cursor-pointer"
              title="Chế độ chụp slide gọn gàng"
            >
              <Maximize2 className="w-3.5 h-3.5 text-gray-600" />
              <span>{isSlideMode ? 'Thu gọn' : 'Chế độ Slide'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
              title="In hoặc lưu file PDF slide"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In / Lưu PDF Slide</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BANNER TỔNG QUAN HIỆU QUẢ ĐẦU TƯ (CAMPAIGN ROI & UNIT ECONOMICS)           */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-r from-[#0F2A5C] via-[#1E4FA8] to-[#1E3A8A] text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 text-center sm:text-left">
            <div className="sm:px-3 pt-2 sm:pt-0">
              <span className="text-[11px] uppercase tracking-wider text-blue-200 font-bold block">
                Ngân sách MKT
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono mt-1 block">
                15.000.000 ₫
              </span>
              <span className="text-[10px] text-blue-200/80 mt-0.5 block">
                Meta Ads + KOLs
              </span>
            </div>

            <div className="sm:px-3 pt-2 sm:pt-0">
              <span className="text-[11px] uppercase tracking-wider text-blue-200 font-bold block">
                Lưu lượng truy cập
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono mt-1 block">
                10.000
              </span>
              <span className="text-[10px] text-blue-200/80 mt-0.5 block">
                75% Organic Search/Social
              </span>
            </div>

            <div className="sm:px-3 pt-2 sm:pt-0">
              <span className="text-[11px] uppercase tracking-wider text-blue-200 font-bold block">
                Học viên đăng ký
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono mt-1 block">
                2.500
              </span>
              <span className="text-[10px] text-blue-200/80 mt-0.5 block">
                CR Truy cập → ĐK: 25%
              </span>
            </div>

            <div className="sm:px-3 pt-2 sm:pt-0">
              <span className="text-[11px] uppercase tracking-wider text-blue-200 font-bold block">
                Học viên mua VIP
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono mt-1 block text-amber-300">
                200 VIP
              </span>
              <span className="text-[10px] text-blue-200/80 mt-0.5 block">
                CR Học thử → VIP: 20%
              </span>
            </div>

            <div className="sm:px-3 pt-2 sm:pt-0">
              <span className="text-[11px] uppercase tracking-wider text-blue-200 font-bold block">
                Doanh thu mang lại
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono mt-1 block text-emerald-300">
                99.800.000 ₫
              </span>
              <span className="text-[10px] text-blue-200/80 mt-0.5 block">
                AOV: 499.000 ₫ / VIP
              </span>
            </div>

            <div className="sm:px-3 pt-2 sm:pt-0">
              <span className="text-[11px] uppercase tracking-wider text-blue-200 font-bold block">
                Tỷ suất ROI
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono mt-1 block text-teal-300">
                +565%
              </span>
              <span className="text-[10px] text-teal-200/90 mt-0.5 block font-bold">
                Hoàn vốn trong 1.1 tháng
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COMPONENT 1: THẺ CHỈ SỐ MKT (4 THẺ NGANG: CAC, LTV, CR, CHURN RATE)       */}
        {/* ========================================================================= */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1E4FA8]" />
              Nhóm Chỉ Số Tài Chính & Hiệu Quả Đơn Vị (Unit Economics)
            </h2>
            <span className="text-xs text-gray-400 font-mono">Benchmark EdTech Global</span>
          </div>
          <MarketingKpiCards />
        </section>

        {/* ========================================================================= */}
        {/* COMPONENT 2: BIỂU ĐỒ PHỄU CHUYỂN ĐỔI (CONVERSION FUNNEL)                  */}
        {/* ========================================================================= */}
        <section className="space-y-2">
          <ConversionFunnelChart />
        </section>

        {/* ========================================================================= */}
        {/* COMPONENT 3 & 4: NGUỒN KHÁCH HÀNG (DONUT) & GIỮ CHÂN (LINE CHART)         */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cột trái: Donut Chart Nguồn khách hàng */}
          <div className="flex flex-col">
            <TrafficChannelsChart />
          </div>

          {/* Cột phải: Line Chart Tăng trưởng & Giữ chân 6 tháng */}
          <div className="flex flex-col">
            <RetentionTrendChart />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* EXECUTIVE SUMMARY & STRATEGIC TAKEAWAYS CHO SLIDE ĐỒ ÁN                    */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-xl border border-gray-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-150">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Tổng Kết Chiến Lược & Luận Điểm Thuyết Trình (Slide Key Takeaways)
              </h3>
              <p className="text-xs text-gray-500">
                Các luận điểm cốt lõi chứng minh tính khả thi tài chính và tiềm năng tăng trưởng của đề án Handy
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Luận điểm 1 */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-1.5">
              <span className="font-extrabold text-[#1E4FA8] flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                1. Hiệu Quả Kênh Organic (Moat)
              </span>
              <p className="text-gray-700 leading-relaxed">
                75% lưu lượng đến từ SEO tự nhiên và video viral giáo dục, giúp đè bẹp chi phí CAC xuống mức <strong>45.000 ₫</strong>.
                Tỷ lệ LTV/CAC đạt <strong>11.1x</strong> (vượt xa chuẩn SaaS lành mạnh 3.0x).
              </p>
            </div>

            {/* Luận điểm 2 */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5">
              <span className="font-extrabold text-emerald-800 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                2. Sức Hút Giữ Chân Khách Hàng
              </span>
              <p className="text-gray-700 leading-relaxed">
                Tỷ lệ người học quay lại tăng trưởng liên tục 6 tháng (+547%) và chính thức vượt số lượng khách mới ở tháng 10.
                Điều này khẳng định tính năng <strong>Flashcard tương tác & Quizlet</strong> thực sự giải quyết nỗi đau của phụ huynh.
              </p>
            </div>

            {/* Luận điểm 3 */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
              <span className="font-extrabold text-amber-800 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                3. Đề Xuất Đòn Bẩy Tăng Tốc
              </span>
              <p className="text-gray-700 leading-relaxed">
                Tập trung tối ưu điểm nghẽn lớn nhất tại tầng <strong>Học thử → Mua VIP (Drop-off 80%)</strong> thông qua
                chiến dịch nuôi dưỡng Email tự động, ưu đãi VietQR thanh toán 1-chạm và mở rộng thêm 10 chủ đề nâng cao.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
