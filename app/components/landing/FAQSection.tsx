'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

export default function FAQSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqs = [
    {
      q: 'Ngôn ngữ ký hiệu là gì?',
      a: 'Ngôn ngữ ký hiệu là ngôn ngữ sử dụng các yếu tố trực quan như hình dạng, vị trí và chuyển động của bàn tay, kết hợp với biểu cảm khuôn mặt và cơ thể để truyền đạt ý nghĩa.',
    },
    {
      q: 'Người chưa biết gì có thể học ngôn ngữ ký hiệu không?',
      a: 'Hoàn toàn có thể. HANDY được thiết kế dành cho mọi đối tượng bắt đầu từ con số không, với các chủ đề từ chào hỏi, gia đình, đến các hoạt động sinh hoạt quen thuộc hàng ngày.',
    },
    {
      q: 'HANDY có hỗ trợ video minh họa không?',
      a: 'Có. Mỗi từ vựng và câu trong từng chủ đề đều đi kèm video mẫu do người thành thạo ngôn ngữ ký hiệu thực hiện, giúp bạn quan sát chính xác khẩu hình và chuyển động tay.',
    },
    {
      q: 'Tôi có thể dùng HANDY trên điện thoại không?',
      a: 'HANDY hoạt động mượt mà trên trình duyệt web của mọi thiết bị: máy tính bảng, điện thoại và máy tính cá nhân. Ngoài ra bạn cũng có thể cài đặt bản ứng dụng APK trực tiếp cho Android.',
    },
    {
      q: 'Làm thế nào để nâng cấp tài khoản VIP?',
      a: 'Bạn chỉ cần chọn gói thành viên trong mục Bảng giá và thanh toán tự động qua SePAY bằng VietQR. Tài khoản sẽ được kích hoạt tự động ngay sau khi hoàn tất chuyển khoản.',
    },
  ]

  const toggleFaq = (idx: number) => {
    setOpenFaq((prev) => (prev === idx ? null : idx))
  }

  return (
    <section id="faq" className="relative overflow-hidden bg-white py-24 font-sans">
      {/* Decorative floating shapes */}
      <span
        aria-hidden="true"
        className="hidden sm:block absolute right-[4%] top-20 w-4 h-4 rounded-full bg-[#1A8CFF] pointer-events-none animate-handy-float"
      />
      <span
        aria-hidden="true"
        className="hidden sm:block absolute left-[8%] bottom-16 w-3 h-3 rounded-full bg-[#F0436A] pointer-events-none"
      />
      <svg
        aria-hidden="true"
        className="absolute right-[8%] bottom-24 pointer-events-none animate-handy-twinkle"
        width="28"
        height="28"
        viewBox="0 0 40 40"
      >
        <path
          d="M20 0 C21.5 13 27 18.5 40 20 C27 21.5 21.5 27 20 40 C18.5 27 13 21.5 0 20 C13 18.5 18.5 13 20 0Z"
          fill="#7B5BB5"
        />
      </svg>

      <div className="relative z-10 max-w-[1240px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
        {/* Left Column: Heading & Illustration */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <h2 className="font-bold text-3xl sm:text-4xl lg:text-[44px] text-[#1E1E1E] leading-snug tracking-tight">
            <span className="inline-block bg-[#F9C31F] text-[#1E1E1E] px-3.5 pb-1 rounded-xl -rotate-2 shadow-[0_6px_0_rgba(176,120,0,0.18)] mr-2">
              Câu hỏi
            </span>
            thường gặp về ngôn ngữ ký hiệu
          </h2>

          <div className="relative h-[340px] sm:h-[400px] flex items-end justify-center lg:justify-start">
            {/* Color stripe bars behind image */}
            <span
              aria-hidden="true"
              className="absolute left-0 w-[80%] top-[15%] h-[14%] rounded-r-full bg-[#1A8CFF]"
            />
            <span
              aria-hidden="true"
              className="absolute left-0 w-[95%] top-[34%] h-[20%] rounded-r-full bg-[#F0436A]"
            />
            <span
              aria-hidden="true"
              className="absolute left-0 w-[85%] top-[58%] h-[18%] rounded-r-full bg-[#17A673]"
            />

            {/* Illustration */}
            <Image
              src="/assets/faq-girl.png"
              alt="Bé gái học ngôn ngữ ký hiệu"
              width={410}
              height={425}
              className="relative z-10 h-full w-auto max-w-full object-contain filter drop-shadow-[0_18px_24px_rgba(20,30,60,0.18)]"
            />
          </div>
        </div>

        {/* Right Column: Interactive Accordion */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx

            return (
              <div
                key={idx}
                className={`border-2 rounded-2xl bg-white transition-all duration-300 ${
                  isOpen
                    ? 'border-[#1A8CFF] shadow-[0_14px_30px_rgba(26,140,255,0.16)]'
                    : 'border-[#E3E7EE] shadow-[0_4px_14px_rgba(20,30,60,0.05)]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer"
                >
                  <span
                    className={`font-bold text-base sm:text-lg transition-colors ${
                      isOpen ? 'text-[#1A8CFF]' : 'text-[#1E1E1E]'
                    }`}
                  >
                    {faq.q}
                  </span>

                  <span
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isOpen ? 'bg-[#1A8CFF] text-white' : 'bg-[#1E1E1E] text-white'
                    }`}
                  >
                    <ChevronRight
                      className={`w-4 h-4 stroke-[3] transition-transform duration-300 ${
                        isOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-0 animate-fade-in">
                    <p className="text-[15px] sm:text-base text-[#4A4A4A] leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
