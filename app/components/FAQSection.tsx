'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: 'Handy có hoàn toàn miễn phí không?',
      a: 'Handy cung cấp nhiều chủ đề cơ bản hoàn toàn MIỄN PHÍ để mọi người đều có thể bắt đầu tiếp cận ngôn ngữ ký hiệu. Bên cạnh đó, chúng tôi có gói VIP mở rộng dành cho những học viên muốn chinh phục toàn bộ kho từ vựng nâng cao.',
    },
    {
      q: 'Làm sao để tôi nâng cấp tài khoản VIP?',
      a: 'Bạn chỉ cần nhấp vào nút "Nâng cấp VIP" ở bất kỳ chủ đề có khóa nào hoặc vào mục Thanh toán (/checkout). Hệ thống sẽ cung cấp mã VietQR để bạn quét chuyển khoản nhanh chóng.',
    },
    {
      q: 'Quy trình thanh toán qua SePAY hoạt động như thế nào?',
      a: 'Khi bạn chuyển khoản qua mã VietQR với nội dung chuẩn (ví dụ: HANDY_USERID), cổng thanh toán SePAY sẽ tự động gửi Webhook thông báo và hệ thống Handy sẽ kích hoạt quyền VIP ngay lập tức trong vòng 10-30 giây mà không cần chờ duyệt thủ công.',
    },
    {
      q: 'Tôi có thể học trên điện thoại được không?',
      a: 'Hoàn toàn được! Giao diện Handy được thiết kế tối ưu hóa 100% cho mọi kích thước màn hình từ điện thoại thông minh, máy tính bảng đến máy tính để bàn. Video tải nhanh và thao tác cực kỳ mượt mà.',
    },
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="my-16 max-w-4xl mx-auto px-2">
      <div className="text-center mb-10">
        <span className="text-xs font-black text-orange-600 uppercase tracking-widest bg-orange-100 px-3.5 py-1.5 rounded-full inline-block mb-3">
          Hỗ Trợ 24/7
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-800">
          Câu Hỏi Thường Gặp (FAQ)
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Giải đáp các thắc mắc phổ biến nhất khi học tập cùng Handy
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx

          return (
            <div
              key={idx}
              className={`bg-white rounded-3xl border-2 transition-all duration-200 overflow-hidden ${
                isOpen ? 'border-orange-300 shadow-md' : 'border-amber-200/80 hover:border-amber-300'
              }`}
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                      isOpen
                        ? 'bg-orange-500 text-white'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <span className="text-base sm:text-lg font-extrabold text-gray-800">
                    {faq.q}
                  </span>
                </div>

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center bg-amber-50 text-amber-800 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-orange-100 text-orange-600' : ''
                  }`}
                >
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-gray-600 leading-relaxed border-t border-amber-100 animate-in fade-in duration-150">
                  <p className="pl-12">{faq.a}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
