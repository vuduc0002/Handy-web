'use client'

import React from 'react'
import Link from 'next/link'
import SupportLayout from '@/components/support/SupportLayout'

export default function PrivacyPage() {
  return (
    <SupportLayout currentTab="privacy">
      <article className="flex flex-col gap-7 max-w-[780px]">
        {/* Notice Badge */}
        <div className="flex items-center gap-2.5 flex-wrap p-4 px-5 rounded-2xl bg-[#FFF8EC] text-sm leading-relaxed text-[#8A5A00] border border-[#FDEAC9]">
          <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
          <span>Chính sách bảo mật quyền riêng tư người dùng HANDY. Cập nhật lần cuối: Tháng 3/2026.</span>
        </div>

        {/* Section 1 */}
        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#1E1E1E]">1. Thông tin chúng tôi thu thập</h2>
          <p className="text-[15.5px] leading-[1.8] text-[#4A4A4A]">
            Họ tên, địa chỉ email hoặc số điện thoại, vai trò người dùng khi đăng ký tài khoản; tiến độ học tập các chủ đề, kết quả luyện tập flashcard và điểm số bài kiểm tra trong suốt quá trình sử dụng hệ thống.
          </p>
        </section>

        {/* Section 2 */}
        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#1E1E1E]">2. Mục đích sử dụng</h2>
          <p className="text-[15.5px] leading-[1.8] text-[#4A4A4A]">
            Lưu giữ và đồng bộ tiến độ học tập trên các thiết bị, hỗ trợ giải đáp thắc mắc khi bạn liên hệ, xử lý xác nhận thanh toán gói tài khoản VIP an toàn và không ngừng cải thiện chất lượng nội dung học tập.
          </p>
        </section>

        {/* Section 3 */}
        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#1E1E1E]">3. Thông tin của trẻ em</h2>
          <p className="text-[15.5px] leading-[1.8] text-[#4A4A4A]">
            HANDY đặc biệt coi trọng quyền riêng tư của trẻ em. Chúng tôi không thu thập hoặc công khai hình ảnh, thông tin cá nhân của trẻ khi chưa có sự đồng ý rõ ràng của cha mẹ hoặc người giám hộ hợp pháp.
          </p>
        </section>

        {/* Section 4 */}
        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#1E1E1E]">4. Chia sẻ thông tin</h2>
          <p className="text-[15.5px] leading-[1.8] text-[#4A4A4A]">
            Chúng tôi cam kết không bán hoặc cho thuê dữ liệu cá nhân cho bên thứ ba vì mục đích tiếp thị. Thông tin chỉ được chia sẻ với cổng thanh toán (SePAY) ở mức tối thiểu để hoàn tất giao dịch chuyển khoản, hoặc khi có yêu cầu từ cơ quan pháp luật có thẩm quyền.
          </p>
        </section>

        {/* Section 5 */}
        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#1E1E1E]">5. Quyền của bạn</h2>
          <p className="text-[15.5px] leading-[1.8] text-[#4A4A4A]">
            Bạn luôn có toàn quyền truy cập, chỉnh sửa hoặc yêu cầu xóa vĩnh viễn thông tin tài khoản và dữ liệu học tập cá nhân bất kỳ lúc nào bằng cách{' '}
            <Link href="/support" className="text-[#1A8CFF] font-semibold hover:underline">
              liên hệ hỗ trợ
            </Link>
            .
          </p>
        </section>
      </article>
    </SupportLayout>
  )
}
