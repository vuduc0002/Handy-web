'use client'

import React from 'react'
import Link from 'next/link'
import SupportLayout from '@/components/support/SupportLayout'

const PAYMENT_STEPS = [
  {
    n: '01',
    title: 'Chọn gói tài khoản',
    desc: 'Vào trang Gói tài khoản VIP và chọn gói học phù hợp với nhu cầu của bạn và gia đình.',
    gradient: 'linear-gradient(135deg, #5CB0FF 0%, #1A6FE0 100%)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H2z" />
        <path d="M22 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z" />
      </svg>
    ),
  },
  {
    n: '02',
    title: 'Đăng nhập tài khoản',
    desc: 'Đăng nhập để gói VIP được đồng bộ và gắn trực tiếp vào tài khoản của bạn ngay khi giao dịch thành công.',
    gradient: 'linear-gradient(135deg, #B48CF0 0%, #7B4FD0 100%)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <path d="m10 17 5-5-5-5" />
        <path d="M15 12H3" />
      </svg>
    ),
  },
  {
    n: '03',
    title: 'Quét mã QR chuyển khoản',
    desc: 'Mở ứng dụng ngân hàng quét mã VietQR SePAY được tạo sẵn. Vui lòng giữ nguyên số tiền và nội dung chuyển khoản.',
    gradient: 'linear-gradient(135deg, #FFB36B 0%, #F0436A 100%)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3h-3z" />
        <path d="M21 14v7h-7" />
      </svg>
    ),
  },
  {
    n: '04',
    title: 'Kích hoạt tự động',
    desc: 'Hệ thống SePAY tự động đối soát trong vài giây. Toàn bộ chủ đề, bài học và tính năng VIP sẽ mở khóa ngay lập tức.',
    gradient: 'linear-gradient(135deg, #6FDDB0 0%, #17A673 100%)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12 5 5L20 7" />
      </svg>
    ),
  },
]

export default function PaymentGuidePage() {
  return (
    <SupportLayout currentTab="payment-guide">
      <div className="flex flex-col gap-7">
        {/* Step Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PAYMENT_STEPS.map((st) => (
            <div
              key={st.n}
              className="relative flex flex-col gap-3 p-6 rounded-[20px] bg-white border border-[#ECEEF3] shadow-[0_10px_26px_rgba(20,30,60,0.05)] hover:shadow-md transition-shadow"
            >
              <span className="absolute right-4 top-3 text-[40px] font-bold leading-none text-[#F1F3F7] select-none">
                {st.n}
              </span>
              <span
                className="relative w-11 h-11 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-sm"
                style={{ background: st.gradient }}
              >
                {st.icon}
              </span>
              <h3 className="relative text-[17px] font-bold text-[#1E1E1E]">
                {st.title}
              </h3>
              <p className="relative text-[14.5px] leading-relaxed text-[#4A4A4A]">
                {st.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action Banner to Pricing */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#EAF4FF] to-[#F0F6FF] border border-[#9CCBFF]/40">
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <span className="text-[16px] font-bold text-[#1E1E1E]">
              Sẵn sàng bắt đầu hành trình học tập?
            </span>
            <span className="text-[14px] text-[#4A4A4A]">
              Chọn ngay gói VIP để mở khóa trọn bộ từ điển, video tương tác và game thẻ nhớ.
            </span>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 px-6 py-2.5 rounded-full bg-[#1A8CFF] hover:bg-[#0B6FE0] text-white font-semibold text-[14.5px] transition-colors shadow-sm"
          >
            Xem bảng giá VIP
          </Link>
        </div>

        {/* SePAY Assurance Card */}
        <div className="flex items-center gap-4 flex-wrap p-5 sm:p-6 rounded-[20px] bg-[#F3FAF7] border border-[#D5EFE3]">
          <span className="w-12 h-12 rounded-2xl bg-[#17A673] text-white flex items-center justify-center shrink-0 shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>
          <div className="flex-1 min-w-[280px] flex flex-col gap-1">
            <span className="text-base font-bold text-[#1E1E1E]">
              Thanh toán an toàn qua SePAY
            </span>
            <span className="text-[14.5px] leading-relaxed text-[#4A4A4A]">
              Giao dịch chuyển khoản được đối soát tự động theo thời gian thực. HANDY không bao giờ lưu trữ mật khẩu hay thông tin tài khoản ngân hàng của bạn.
            </span>
          </div>
        </div>

        {/* Lưu ý khi thanh toán */}
        <div className="flex flex-col gap-3 pt-2">
          <h2 className="text-xl font-bold text-[#1E1E1E]">
            Lưu ý khi thanh toán
          </h2>
          <ul className="flex flex-col gap-2.5 p-0 m-0 list-none">
            <li className="flex items-start gap-3 text-[15px] leading-relaxed text-[#4A4A4A]">
              <span className="w-2 h-2 rounded-full bg-[#1A8CFF] mt-2 shrink-0" />
              <span>
                <strong>Giữ nguyên nội dung chuyển khoản:</strong> Hệ thống sử dụng nội dung chuyển khoản mã hóa để nhận diện tài khoản và kích hoạt gói cước tự động trong vòng 1-3 phút.
              </span>
            </li>
            <li className="flex items-start gap-3 text-[15px] leading-relaxed text-[#4A4A4A]">
              <span className="w-2 h-2 rounded-full bg-[#F0436A] mt-2 shrink-0" />
              <span>
                <strong>Chuyển chính xác số tiền:</strong> Vui lòng chuyển đúng số tiền của gói đã chọn. Mã QR có thời hạn hiệu lực hiển thị trực quan trên màn hình thanh toán.
              </span>
            </li>
            <li className="flex items-start gap-3 text-[15px] leading-relaxed text-[#4A4A4A]">
              <span className="w-2 h-2 rounded-full bg-[#17A673] mt-2 shrink-0" />
              <span>
                <strong>Cần hỗ trợ giao dịch:</strong> Nếu bạn đã chuyển khoản nhưng gói chưa kích hoạt, xin vui lòng{' '}
                <Link href="/support" className="text-[#1A8CFF] font-semibold hover:underline">
                  liên hệ hỗ trợ
                </Link>{' '}
                kèm theo ảnh chụp biên lai giao dịch ngân hàng để được giải quyết nhanh nhất.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </SupportLayout>
  )
}
