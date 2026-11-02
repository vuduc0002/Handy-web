'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Crown,
  Check,
  ChevronRight,
  QrCode,
  Sparkles,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react'

interface PricingPlan {
  id: string
  name: string
  price: string
  per: string
  tag?: string
  popular?: boolean
  features: string[]
}

const PLANS: PricingPlan[] = [
  {
    id: '3m',
    name: 'Gói 3 tháng',
    price: '199.000đ',
    per: '3 tháng',
    features: [
      'Mở khóa toàn bộ chủ đề',
      'Luyện tập không giới hạn',
      'Truy cập video HD',
    ],
  },
  {
    id: '6m',
    name: 'Gói 6 tháng',
    price: '349.000đ',
    per: '6 tháng',
    tag: 'Tiết kiệm 49.000đ',
    features: [
      'Mở khóa toàn bộ chủ đề',
      'Luyện tập không giới hạn',
      'Truy cập video HD',
      'Ưu tiên hỗ trợ',
    ],
  },
  {
    id: '1y',
    name: 'Gói 1 năm',
    price: '599.000đ',
    per: '1 năm',
    tag: 'Tiết kiệm 79.000đ',
    popular: true,
    features: [
      'Mở khóa toàn bộ chủ đề',
      'Luyện tập không giới hạn',
      'Truy cập video HD',
      'Ưu tiên hỗ trợ',
      'Nội dung mới sớm nhất',
    ],
  },
  {
    id: 'lifetime',
    name: 'Gói vĩnh viễn',
    price: '999.000đ',
    per: 'Trọn đời',
    tag: 'Không cần gia hạn',
    features: [
      'Mở khóa toàn bộ chủ đề',
      'Luyện tập không giới hạn',
      'Truy cập video HD',
      'Ưu tiên hỗ trợ',
      'Nội dung mới sớm nhất',
      'Cập nhật vĩnh viễn',
    ],
  },
]

const FAQS = [
  {
    q: 'Thanh toán bằng cách nào?',
    a: 'Bạn chuyển khoản qua mã QR do SePAY tạo. Giao dịch được đối soát tự động, gói VIP được kích hoạt ngay sau khi xác nhận.',
  },
  {
    q: 'Đã chuyển khoản nhưng gói chưa được kích hoạt?',
    a: 'Hãy kiểm tra lại nội dung chuyển khoản. Nếu vẫn chưa được, bạn liên hệ hỗ trợ kèm ảnh chụp giao dịch để đội ngũ hỗ trợ xử lý ngay.',
  },
  {
    q: 'Gói VIP có dùng được cho cả sách và flashcard không?',
    a: 'Gói VIP áp dụng cho nội dung trên website. Video ký hiệu mở từ mã QR trên flashcard thuộc chủ đề đã mở khóa cũng xem được đầy đủ.',
  },
]

export default function PricingPage() {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('1y')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[2]

  return (
    <div className="min-h-screen bg-white">
      {/* 01 BANNER VIP */}
      <section className="relative overflow-hidden bg-[radial-gradient(45%_80%_at_100%_0%,#FFE9C7_0%,rgba(255,233,199,0)_70%),radial-gradient(40%_70%_at_0%_100%,#FFE3EA_0%,rgba(255,227,234,0)_70%),#FFFBF5] border-b border-[#F4E8D7]">
        {/* Floating decorative elements */}
        <span
          aria-hidden="true"
          className="absolute left-[7%] top-[70px] w-4 h-4 rounded-full bg-[#1A8CFF] opacity-80 animate-pulse pointer-events-none"
        />
        <span
          aria-hidden="true"
          className="absolute right-[8%] top-[56px] w-9 h-9 rounded-full border-4 border-[#F0436A] opacity-75 pointer-events-none"
        />
        <svg
          aria-hidden="true"
          className="absolute right-[5%] bottom-[40px] w-7 h-7 pointer-events-none"
          viewBox="0 0 40 40"
        >
          <path
            d="M20 0 C21.5 13 27 18.5 40 20 C27 21.5 21.5 27 20 40 C18.5 27 13 21.5 0 20 C13 18.5 18.5 13 20 0Z"
            fill="#F7A21B"
          />
        </svg>

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-10 pb-14 flex flex-col items-center gap-4 text-center">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[#6B6B6B]">
            <Link href="/" className="hover:text-[#1A8CFF] transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#A0A0A0]" />
            <span className="text-[#1A8CFF] font-semibold">Gói tài khoản VIP</span>
          </nav>

          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF1C9] text-[#9A5B00] text-xs md:text-sm font-bold tracking-wide shadow-sm">
            <Crown className="w-4 h-4 text-[#F7A21B] fill-[#F7A21B]" />
            NÂNG CẤP TÀI KHOẢN VIP
          </span>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1E1E1E] tracking-tight leading-tight">
            Chọn gói học{' '}
            <span className="inline-block bg-[#FFD84D] text-[#1E1E1E] px-3.5 py-1 rounded-2xl -rotate-2 shadow-sm">
              phù hợp
            </span>
          </h1>

          <p className="text-base md:text-lg text-[#4A4A4A] max-w-xl font-medium">
            Mở khóa toàn bộ bài giảng thủ ngữ chất lượng cao và luyện tập không giới hạn
          </p>
        </div>
      </section>

      {/* 02 BẢNG GÓI VIP */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-16 flex flex-col items-center gap-10">
        <div
          role="radiogroup"
          aria-label="Chọn gói"
          className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"
        >
          {PLANS.map((plan) => {
            const isSelected = selectedPlanId === plan.id
            return (
              <button
                key={plan.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`relative flex flex-col text-left gap-4 p-6 sm:p-7 rounded-[24px] border-2 transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-[#F4F9FF] border-[#1A8CFF] shadow-[0_18px_40px_rgba(26,140,255,0.18)] -translate-y-1.5'
                    : 'bg-white border-[#E6ECF5] shadow-[0_8px_22px_rgba(20,30,60,0.05)] hover:border-[#1A8CFF] hover:shadow-[0_18px_40px_rgba(26,140,255,0.14)] hover:-translate-y-1'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-3.5 py-1 rounded-full bg-gradient-to-r from-[#F0436A] to-[#F7A21B] text-white text-xs font-bold shadow-[0_6px_14px_rgba(240,67,106,0.3)]">
                    Phổ biến nhất
                  </span>
                )}

                {/* Plan Header */}
                <div className="flex flex-col gap-1.5 min-h-[56px]">
                  <span className="text-lg font-bold text-[#1E1E1E]">{plan.name}</span>
                  {plan.tag && (
                    <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E3F7EE] text-[#0C8558] w-fit">
                      {plan.tag}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-3xl font-extrabold text-[#1A8CFF] tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-sm text-[#6B6B6B] font-medium">/ {plan.per}</span>
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 flex-1 pt-2">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-[#1E1E1E] leading-snug"
                    >
                      <span className="flex-none mt-0.5 text-[#17A673]">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Radio selection footer */}
                <div
                  className={`flex items-center gap-2.5 pt-4 border-t text-sm font-bold transition-colors ${
                    isSelected
                      ? 'border-[#CFE3FB] text-[#1A8CFF]'
                      : 'border-[#EEF1F6] text-[#8A8F99]'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-[#1A8CFF] bg-white'
                        : 'border-[#C9CFD9] bg-white'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full transition-all ${
                        isSelected ? 'bg-[#1A8CFF]' : 'bg-transparent'
                      }`}
                    />
                  </span>
                  <span>{isSelected ? 'Đang chọn' : 'Chọn gói này'}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* CTA Button */}
        <Link
          href={`/checkout?plan=${selectedPlan.id}`}
          className="inline-flex items-center justify-center gap-3 w-full sm:w-auto min-w-[340px] px-8 py-4 rounded-full text-white text-base md:text-lg font-bold bg-gradient-to-r from-[#0050B3] to-[#1A8CFF] hover:from-[#003F8A] hover:to-[#0B6FE0] shadow-[0_16px_34px_rgba(26,140,255,0.32)] hover:shadow-[0_20px_40px_rgba(26,140,255,0.45)] transition-all duration-300 hover:scale-[1.02] active:scale-95"
        >
          <QrCode className="w-5 h-5" />
          <span>Tiến hành thanh toán – {selectedPlan.price}</span>
        </Link>
      </section>

      {/* 03 CÂU HỎI VỀ GÓI */}
      <section className="max-w-3xl mx-auto px-6 pb-20 flex flex-col gap-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] tracking-tight">
            <span className="text-[#1A8CFF]">Câu hỏi</span> về gói VIP
          </h2>
          <p className="text-sm text-[#6B6B6B] mt-1.5 font-medium">
            Những thắc mắc thường gặp khi nâng cấp tài khoản
          </p>
        </div>

        <div className="flex flex-col gap-3.5">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index
            return (
              <div
                key={index}
                className={`rounded-2xl border-2 transition-colors bg-white overflow-hidden ${
                  isOpen ? 'border-[#1A8CFF] shadow-sm' : 'border-[#E3E7EE]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer"
                >
                  <span className="text-base sm:text-lg font-bold text-[#1E1E1E]">
                    {faq.q}
                  </span>
                  <span
                    className={`flex-none w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-300 ${
                      isOpen ? 'bg-[#1A8CFF] rotate-90' : 'bg-[#1E1E1E] rotate-0'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </span>
                </button>
                {isOpen && (
                  <p className="px-5 sm:px-6 pb-5 text-sm sm:text-base text-[#4A4A4A] leading-relaxed border-t border-[#F1F3F7] pt-3">
                    {faq.a}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
