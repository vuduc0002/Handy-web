'use client'

import { useState } from 'react'

export default function AudienceSection() {
  const [selectedChapter, setSelectedChapter] = useState(0)

  const chapters = [
    {
      num: '01',
      title: 'Tra cứu ký hiệu',
      desc: 'Tìm kiếm từ điển ngôn ngữ ký hiệu theo từ khóa để tham khảo ký hiệu bạn đang cần.',
      page: '04',
      nextPage: '05',
    },
    {
      num: '02',
      title: 'Khám phá ký hiệu mới',
      desc: 'Tìm hiểu bảng ngôn ngữ ký hiệu theo chủ đề và từng bước mở rộng vốn ký hiệu của mình.',
      page: '06',
      nextPage: '07',
    },
    {
      num: '03',
      title: 'Hỗ trợ giao tiếp và học tập',
      desc: 'Tham khảo nội dung ngôn ngữ ký hiệu để phục vụ nhu cầu giao tiếp, học tập, giảng dạy hoặc tìm hiểu cá nhân.',
      page: '08',
      nextPage: '09',
    },
  ]

  const current = chapters[selectedChapter]

  return (
    <section id="danh-cho-ai" className="relative overflow-hidden bg-white py-24 font-sans">
      {/* Decorative floating shapes */}
      <span
        aria-hidden="true"
        className="absolute left-[5%] top-24 w-[34px] h-[34px] rounded-full border-[5px] border-[#1A8CFF] pointer-events-none"
      />
      <span
        aria-hidden="true"
        className="absolute right-[6%] top-48 w-4 h-4 rounded-full bg-[#17A673] pointer-events-none animate-handy-float"
      />
      <svg
        aria-hidden="true"
        className="absolute left-[4%] bottom-36 pointer-events-none animate-handy-twinkle"
        width="24"
        height="24"
        viewBox="0 0 40 40"
      >
        <path
          d="M20 0 C21.5 13 27 18.5 40 20 C27 21.5 21.5 27 20 40 C18.5 27 13 21.5 0 20 C13 18.5 18.5 13 20 0Z"
          fill="#F9C31F"
        />
      </svg>

      <div className="relative z-10 max-w-[1240px] mx-auto px-6">
        {/* Section Heading */}
        <div className="flex flex-col items-center gap-3 text-center max-w-[840px] mx-auto mb-16">
          <h2 className="font-bold text-3xl sm:text-4xl lg:text-[44px] text-[#1E1E1E] tracking-tight">
            Ai <span className="text-[#1A8CFF]">cũng có thể</span> bắt đầu cùng HANDY
          </h2>
          <p className="text-base text-[#4A4A4A] leading-relaxed">
            Dù bạn cần tra cứu một ký hiệu cụ thể, muốn học thêm ngôn ngữ ký hiệu hay tìm tài liệu tham khảo phục vụ giao tiếp, HANDY giúp bạn tiếp cận kho nội dung ngôn ngữ ký hiệu thuận tiện hơn.
          </p>
        </div>

        {/* 2 Columns: TOC List & 3D Book Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Table of Contents */}
          <div className="flex flex-col gap-5">
            <span className="text-[13px] font-semibold tracking-[0.16em] text-[#6B6B6B] uppercase">
              Mục lục
            </span>

            <div className="flex flex-col border-t border-[#E3E7EE]">
              {chapters.map((chap, idx) => {
                const isSelected = selectedChapter === idx

                return (
                  <button
                    key={chap.num}
                    type="button"
                    onClick={() => setSelectedChapter(idx)}
                    onMouseEnter={() => setSelectedChapter(idx)}
                    className="w-full flex items-center gap-4 py-5 border-b border-[#E3E7EE] text-left transition-all duration-200 cursor-pointer group"
                  >
                    <span
                      className={`text-sm font-bold w-7 transition-colors ${
                        isSelected ? 'text-[#1A8CFF]' : 'text-[#8A8F99]'
                      }`}
                    >
                      {chap.num}
                    </span>

                    <span
                      className={`text-lg sm:text-xl font-bold transition-all duration-300 ${
                        isSelected
                          ? 'text-[#1E1E1E] translate-x-1.5'
                          : 'text-[#7A808A] group-hover:text-[#1E1E1E]'
                      }`}
                    >
                      {chap.title}
                    </span>

                    <span
                      className={`flex-1 min-w-[20px] border-b-[1.5px] border-dotted translate-y-1 transition-colors ${
                        isSelected ? 'border-[#1E1E1E]' : 'border-[#D5DAE3]'
                      }`}
                    />

                    <span
                      className={`text-sm font-semibold transition-colors ${
                        isSelected ? 'text-[#1A8CFF]' : 'text-[#8A8F99]'
                      }`}
                    >
                      tr. {chap.page}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Column: Open Book Graphic */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-[540px] aspect-[14/10] rounded-2xl shadow-[0_30px_60px_rgba(20,30,60,0.16),0_6px_16px_rgba(20,30,60,0.06)] flex overflow-hidden border border-[#E3E7EE]">
              {/* Left Page */}
              <div className="relative w-1/2 p-6 sm:p-7 flex flex-col justify-between bg-gradient-to-l from-[#E9ECF2] to-white border-r border-[#D5DAE3]">
                <span className="text-[11px] font-bold tracking-[0.14em] text-[#6B6B6B]">
                  HANDY × NGÔN NGỮ KÝ HIỆU
                </span>

                <span
                  className="text-6xl sm:text-7xl font-bold select-none text-transparent tracking-tight"
                  style={{
                    WebkitTextStroke: '2px #1A8CFF',
                  }}
                >
                  {current.num}
                </span>

                <div className="flex justify-between items-end text-xs sm:text-sm font-medium">
                  <span className="font-bold text-[#1E1E1E]">Chương {current.num}</span>
                  <span className="text-[#8A8F99]">{current.page}</span>
                </div>
              </div>

              {/* Spine shadow line */}
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-0 bottom-0 w-[2px] -ml-[1px] z-10 bg-gradient-to-b from-[#D5DAE3] via-[#C3C9D4] to-[#D5DAE3]"
              />

              {/* Right Page */}
              <div className="relative w-1/2 p-6 sm:p-7 flex flex-col justify-between bg-gradient-to-r from-[#E3E7EE] to-white">
                <div>
                  <span className="block w-11 h-1 rounded-full bg-gradient-to-r from-[#F0436A] via-[#F7A21B] to-[#1A8CFF] mb-4" />
                  <h3 className="font-bold text-lg sm:text-xl text-[#1E1E1E] leading-snug mb-2.5">
                    {current.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed">
                    {current.desc}
                  </p>
                </div>

                <span className="self-end text-xs sm:text-sm text-[#8A8F99]">
                  {current.nextPage}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
