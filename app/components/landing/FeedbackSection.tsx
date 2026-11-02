'use client'

import { Star, Quote } from 'lucide-react'

export default function FeedbackSection() {
  const row1 = [
    {
      name: 'Chị Thu Hà',
      role: 'Phụ huynh bé 5 tuổi',
      quote: 'Tối nào hai mẹ con cũng mở vài ký hiệu chào hỏi để tập. Video ngắn, rõ tay nên con bắt chước được ngay.',
      initial: 'H',
      grad: 'from-[#FF8FA8] to-[#F0436A]',
    },
    {
      name: 'Cô Ngọc Lan',
      role: 'Giáo viên mầm non',
      quote: 'Mình dùng flashcard trong giờ sinh hoạt sáng. Quét mã là có video, đỡ phải tìm tài liệu ở nhiều nơi.',
      initial: 'L',
      grad: 'from-[#5CB0FF] to-[#1A6FE0]',
    },
    {
      name: 'Anh Minh Quân',
      role: 'Người khiếm thính',
      quote: 'Giao diện sạch, chủ đề gần gũi. Mình gửi trang cho bạn bè nghe muốn học vài câu giao tiếp cơ bản.',
      initial: 'Q',
      grad: 'from-[#6FDDB0] to-[#17A673]',
    },
    {
      name: 'Chị Phương Anh',
      role: 'Phụ huynh',
      quote: 'Thích phần luyện tập có gắn sao, những ký hiệu con hay quên mình đánh dấu để ôn lại cuối tuần.',
      initial: 'A',
      grad: 'from-[#FFD25C] to-[#F7A21B]',
    },
  ]

  const row2 = [
    {
      name: 'Thầy Đức Huy',
      role: 'Giáo viên trường chuyên biệt',
      quote: 'Nội dung chia theo chủ đề nên dễ lồng vào giáo án. Mong HANDY sớm có thêm chủ đề cảm xúc.',
      initial: 'H',
      grad: 'from-[#B48CF0] to-[#7B4FD0]',
    },
    {
      name: 'Bạn Khánh Linh',
      role: 'Sinh viên tình nguyện',
      quote: 'Trước khi đi tình nguyện mình học trên HANDY vài buổi, đủ để chào hỏi và làm quen với các em.',
      initial: 'L',
      grad: 'from-[#5CB0FF] to-[#1A6FE0]',
    },
    {
      name: 'Chị Hồng Nhung',
      role: 'Phụ huynh bé 4 tuổi',
      quote: 'Bé nhà mình mê màu sắc của sách và thẻ, cầm lên là đòi mẹ mở video xem cùng.',
      initial: 'N',
      grad: 'from-[#FF8FA8] to-[#F0436A]',
    },
    {
      name: 'Anh Tuấn Kiệt',
      role: 'Người quan tâm',
      quote: 'Tra cứu nhanh, mở trên điện thoại vẫn xem video tốt. Phần giải nghĩa kèm tình huống rất dễ hiểu.',
      initial: 'K',
      grad: 'from-[#6FDDB0] to-[#17A673]',
    },
  ]

  // Duplicate for seamless infinite marquee loop
  const row1Doubled = [...row1, ...row1, ...row1, ...row1]
  const row2Doubled = [...row2, ...row2, ...row2, ...row2]

  return (
    <section
      id="feedback"
      className="relative overflow-hidden py-24 font-sans"
      style={{
        background: 'linear-gradient(180deg,#FFFFFF 0%,#F2F8FF 45%,#FFF8EC 100%)',
      }}
    >
      {/* Decorative floating dots */}
      <span
        aria-hidden="true"
        className="absolute left-[4%] top-20 w-6 h-6 rounded-full border-[5px] border-[#F0436A] pointer-events-none"
      />
      <svg
        aria-hidden="true"
        className="absolute right-[6%] top-24 pointer-events-none animate-handy-twinkle"
        width="22"
        height="22"
        viewBox="0 0 40 40"
      >
        <path
          d="M20 0 C21.5 13 27 18.5 40 20 C27 21.5 21.5 27 20 40 C18.5 27 13 21.5 0 20 C13 18.5 18.5 13 20 0Z"
          fill="#1A8CFF"
        />
      </svg>

      <div className="relative z-10 max-w-[1240px] mx-auto px-6 mb-12">
        {/* Section Heading */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-bold text-3xl sm:text-4xl lg:text-[44px] text-[#1E1E1E] tracking-tight">
            Người dùng <span className="text-[#1A8CFF]">nói gì</span> về HANDY
          </h2>
          <p className="text-base text-[#4A4A4A] max-w-[620px] leading-relaxed">
            Chia sẻ từ phụ huynh, thầy cô và người học đã cùng HANDY làm quen với ngôn ngữ ký hiệu.
          </p>
        </div>
      </div>

      {/* Marquee Ticker with mask fade edges */}
      <div
        className="relative flex flex-col gap-6"
        style={{
          maskImage: 'linear-gradient(90deg,transparent 0%,#000 8%,#000 92%,transparent 100%)',
          WebkitMaskImage: 'linear-gradient(90deg,transparent 0%,#000 8%,#000 92%,transparent 100%)',
        }}
      >
        {/* Row 1: Forward Marquee */}
        <div className="overflow-hidden py-3">
          <div className="flex gap-6 w-max animate-fb-scroll pause-hover">
            {row1Doubled.map((item, idx) => (
              <figure
                key={idx}
                className="w-[340px] sm:w-[360px] p-6 rounded-2xl bg-white border border-[#EEF1F6] shadow-[0_8px_22px_rgba(20,30,60,0.05)] hover:shadow-[0_14px_30px_rgba(26,140,255,0.13)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between shrink-0 select-none"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-[#F7A21B]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current stroke-none" />
                      ))}
                    </div>
                    <Quote className="w-5 h-5 text-[#1A8CFF]/25 stroke-[1.8]" />
                  </div>

                  <blockquote className="text-[14.5px] leading-relaxed text-[#1E1E1E] line-clamp-3">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                </div>

                <figcaption className="flex items-center gap-3 pt-4 mt-4 border-t border-[#F1F3F7]">
                  <span
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.grad} text-white flex items-center justify-center font-bold text-sm shrink-0`}
                  >
                    {item.initial}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm text-[#1E1E1E] truncate">
                      {item.name}
                    </span>
                    <span className="text-xs text-[#6B6B6B] truncate">
                      {item.role}
                    </span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* Row 2: Reverse Marquee */}
        <div className="overflow-hidden py-3">
          <div className="flex gap-6 w-max animate-fb-scroll-rev pause-hover">
            {row2Doubled.map((item, idx) => (
              <figure
                key={idx}
                className="w-[340px] sm:w-[360px] p-6 rounded-2xl bg-white border border-[#EEF1F6] shadow-[0_8px_22px_rgba(20,30,60,0.05)] hover:shadow-[0_14px_30px_rgba(26,140,255,0.13)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between shrink-0 select-none"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-[#F7A21B]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current stroke-none" />
                      ))}
                    </div>
                    <Quote className="w-5 h-5 text-[#F0436A]/25 stroke-[1.8]" />
                  </div>

                  <blockquote className="text-[14.5px] leading-relaxed text-[#1E1E1E] line-clamp-3">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                </div>

                <figcaption className="flex items-center gap-3 pt-4 mt-4 border-t border-[#F1F3F7]">
                  <span
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.grad} text-white flex items-center justify-center font-bold text-sm shrink-0`}
                  >
                    {item.initial}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm text-[#1E1E1E] truncate">
                      {item.name}
                    </span>
                    <span className="text-xs text-[#6B6B6B] truncate">
                      {item.role}
                    </span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
