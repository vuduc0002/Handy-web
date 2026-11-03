'use client'

import React from 'react'
import Link from 'next/link'
import SupportLayout from '@/components/support/SupportLayout'

export default function TermsPage() {
  return (
    <SupportLayout currentTab="terms">
      <article className="flex flex-col gap-7 max-w-[780px]">
        {/* Notice Badge */}
        <div className="flex items-center gap-2.5 flex-wrap p-4 px-5 rounded-2xl bg-[#FFF8EC] text-sm leading-relaxed text-[#8A5A00] border border-[#FDEAC9]">
          <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
          <span>Quy định sử dụng dịch vụ nền tảng HANDY. Cập nhật lần cuối: Tháng 3/2026.</span>
        </div>

        {/* Section 1 */}
        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#1E1E1E]">1. Giới thiệu</h2>
          <p className="text-[15.5px] leading-[1.8] text-[#4A4A4A]">
            HANDY là bộ giải pháp hỗ trợ học ngôn ngữ ký hiệu, gồm sách theo chủ đề, flashcard và website tra cứu. Website hiện là bản phát triển thuộc đồ án của nhóm sinh viên Đại học FPT Hà Nội. Khi sử dụng website, bạn đồng ý với các điều khoản dưới đây.
          </p>
        </section>

        {/* Section 2 */}
        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#1E1E1E]">2. Tài khoản</h2>
          <p className="text-[15.5px] leading-[1.8] text-[#4A4A4A]">
            Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình. Tài khoản cho trẻ em cần được phụ huynh hoặc người chăm sóc tạo và quản lý để đảm bảo môi trường học tập an toàn, lành mạnh nhất.
          </p>
        </section>

        {/* Section 3 */}
        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#1E1E1E]">3. Nội dung học tập</h2>
          <p className="text-[15.5px] leading-[1.8] text-[#4A4A4A]">
            Nội dung ký hiệu tham chiếu Ngôn ngữ ký hiệu Hà Nội và đang được rà soát cùng người dùng ngôn ngữ ký hiệu và chuyên gia. HANDY là công cụ hỗ trợ học tập, không thay thế hoàn toàn các hệ thống ngôn ngữ ký hiệu chính quy hay chương trình giáo dục chuyên biệt khác.
          </p>
        </section>

        {/* Section 4 */}
        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#1E1E1E]">4. Gói tài khoản và thanh toán</h2>
          <p className="text-[15.5px] leading-[1.8] text-[#4A4A4A]">
            Một số chủ đề học tập nâng cao yêu cầu gói tài khoản VIP. Thông tin gói, giá niêm yết và chính sách hoàn tiền được công bố minh bạch tại trang{' '}
            <Link href="/pricing" className="text-[#1A8CFF] font-semibold hover:underline">
              Gói tài khoản VIP
            </Link>{' '}
            và{' '}
            <Link href="/payment-guide" className="text-[#1A8CFF] font-semibold hover:underline">
              Hướng dẫn thanh toán
            </Link>
            .
          </p>
        </section>

        {/* Section 5 */}
        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#1E1E1E]">5. Quy tắc sử dụng</h2>
          <p className="text-[15.5px] leading-[1.8] text-[#4A4A4A]">
            Không sao chép, thu thập tự động, phân phối lại video, hình ảnh minh họa và tài liệu của HANDY cho mục đích thương mại khi chưa có sự đồng ý bằng văn bản. Không sử dụng website để đăng tải nội dung xúc phạm, quấy rối hoặc vi phạm pháp luật.
          </p>
        </section>

        {/* Section 6 */}
        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#1E1E1E]">6. Thay đổi điều khoản</h2>
          <p className="text-[15.5px] leading-[1.8] text-[#4A4A4A]">
            Điều khoản có thể được cập nhật định kỳ để phù hợp với pháp luật hiện hành và sự phát triển của sản phẩm. Các thay đổi quan trọng sẽ được thông báo rõ ràng trên website hoặc qua email đã đăng ký của người dùng.
          </p>
        </section>
      </article>
    </SupportLayout>
  )
}
