'use client'

import { useState } from 'react'
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
      a: 'Có. Bạn có thể bắt đầu từ những ký hiệu quen thuộc như chào hỏi, giới thiệu bản thân và các từ liên quan đến cuộc sống hằng ngày, sau đó học theo từng chủ đề.',
    },
    {
      q: 'Bảng ngôn ngữ ký hiệu dùng để làm gì?',
      a: 'Bảng ngôn ngữ ký hiệu giúp người học tham khảo các ký hiệu theo từ hoặc chủ đề. Khi học, bạn nên kết hợp quan sát hình minh họa hoặc video để hiểu rõ hơn cách thực hiện ký hiệu.',
    },
    {
      q: 'Từ điển ngôn ngữ ký hiệu trên HANDY hỗ trợ điều gì?',
      a: 'HANDY hướng đến việc tổ chức nội dung ký hiệu thành nguồn tra cứu thuận tiện, giúp người học tìm kiếm và tham khảo các ký hiệu theo từ khóa hoặc chủ đề.',
    },
    {
      q: 'Ngôn ngữ ký hiệu có giống nhau ở mọi nơi không?',
      a: 'Không hoàn toàn. Ngôn ngữ ký hiệu có thể khác nhau giữa các quốc gia và cộng đồng, đồng thời có những biến thể theo vùng miền. Vì vậy, cần xem xét ngữ cảnh và nguồn tham khảo khi học một ký hiệu.',
    },
  ]

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  return (
    <section
      id="faq"
      className="relative overflow-hidden py-24 font-sans"
      style={{
        background: 'linear-gradient(180deg,#FFF8EC 0%,#FFF9F4 50%,#F7F2FD 100%)',
      }}
    >
      {/* Decorative background items */}
      <span
        aria-hidden="true"
        className="absolute -right-52 top-[20%] w-[620px] h-[620px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(closest-side,rgba(123,91,181,0.09) 0%,rgba(123,91,181,0) 100%)',
        }}
      />
      <span
        aria-hidden="true"
        className="absolute right-[3%] bottom-28 w-5 h-5 rounded-full bg-[#1A8CFF] pointer-events-none animate-handy-float"
      />
      <svg
        aria-hidden="true"
        className="absolute left-[46%] top-24 pointer-events-none animate-handy-twinkle"
        width="20"
        height="20"
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/faq-girl.png"
              alt="Bé gái học ngôn ngữ ký hiệu"
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
