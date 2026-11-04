'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Download, ShieldCheck } from 'lucide-react'

export default function Footer() {
  const pathname = usePathname()

  // Không hiển thị Footer khi đang ở giao diện Quản trị (/admin/*) hoặc các trang Auth
  const isAuthPage =
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/forgot-password') ||
    pathname?.startsWith('/reset-password')

  if (pathname?.startsWith('/admin') || isAuthPage) {
    return null
  }

  return (
    <footer
      className="relative overflow-hidden font-sans mt-auto"
      style={{
        background:
          'radial-gradient(35% 90% at 0% 75%,rgba(240,67,106,0.22) 0%,rgba(240,67,106,0) 100%),radial-gradient(35% 90% at 100% 75%,rgba(26,140,255,0.28) 0%,rgba(26,140,255,0) 100%),linear-gradient(180deg,#C9E2FF 0%,#D9EAFF 55%,#FFDDE5 100%)',
      }}
    >
      <div className="max-w-[1240px] mx-auto px-6 pt-16 pb-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
        {/* Col 1 & 2: Brand Info & APK Download */}
        <div className="lg:col-span-2 flex flex-col gap-5 items-start max-w-[420px]">
          <Link href="/" className="inline-block hover:opacity-90 transition">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo-handy-sm.png"
              alt="HANDY"
              className="h-14 sm:h-16 w-auto block object-contain"
            />
          </Link>
          <p className="text-[15px] leading-relaxed text-[#4A4A4A]">
            HANDY là ứng dụng học ngôn ngữ ký hiệu thông qua video tương tác và game thẻ nhớ sinh động, đồng hành cùng trẻ em và gia đình trên hành trình kết nối yêu thương.
          </p>

          <a
            href="#"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#1E1E1E] hover:bg-[#1A8CFF] text-white transition-colors duration-200 shadow-sm"
          >
            <Download className="w-6 h-6 shrink-0" />
            <span className="flex flex-col text-left leading-tight">
              <span className="text-[10px] font-semibold tracking-wider opacity-85 uppercase">
                Tải ngay cho Android
              </span>
              <span className="text-base font-bold">
                Get it on Google APK
              </span>
            </span>
          </a>
        </div>

        {/* Col 3: Khám phá */}
        <div className="flex flex-col gap-3.5">
          <h4 className="font-bold text-lg text-[#1E1E1E] mb-1">
            Khám phá
          </h4>
          <Link
            href="/topics"
            className="text-[15px] text-[#4A4A4A] hover:text-[#0B6FE0] hover:translate-x-1 transition-all duration-200"
          >
            Chủ đề bài học
          </Link>
          <Link
            href="/quiz"
            className="text-[15px] text-[#4A4A4A] hover:text-[#0B6FE0] hover:translate-x-1 transition-all duration-200"
          >
            Luyện tập Quiz
          </Link>
          <Link
            href="/pricing"
            className="text-[15px] text-[#4A4A4A] hover:text-[#0B6FE0] hover:translate-x-1 transition-all duration-200"
          >
            Gói tài khoản VIP
          </Link>
          <Link
            href="/profile"
            className="text-[15px] text-[#4A4A4A] hover:text-[#0B6FE0] hover:translate-x-1 transition-all duration-200"
          >
            Tài khoản của tôi
          </Link>
        </div>

        {/* Col 4: Hỗ trợ */}
        <div className="flex flex-col gap-3.5">
          <h4 className="font-bold text-lg text-[#1E1E1E] mb-1">
            Hỗ trợ
          </h4>
          <Link
            href="/support"
            className="text-[15px] text-[#4A4A4A] hover:text-[#0B6FE0] hover:translate-x-1 transition-all duration-200"
          >
            Liên hệ hỗ trợ
          </Link>
          <Link
            href="/terms"
            className="text-[15px] text-[#4A4A4A] hover:text-[#0B6FE0] hover:translate-x-1 transition-all duration-200"
          >
            Điều khoản dịch vụ
          </Link>
          <Link
            href="/privacy"
            className="text-[15px] text-[#4A4A4A] hover:text-[#0B6FE0] hover:translate-x-1 transition-all duration-200"
          >
            Chính sách bảo mật
          </Link>
          <Link
            href="/payment-guide"
            className="text-[15px] text-[#4A4A4A] hover:text-[#0B6FE0] hover:translate-x-1 transition-all duration-200"
          >
            Hướng dẫn thanh toán
          </Link>
        </div>

        {/* Col 5: Kết nối & SePAY */}
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-lg text-[#1E1E1E] mb-1">
            Kết nối
          </h4>
          <div className="flex gap-2.5">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook Handy"
              className="w-10 h-10 rounded-xl bg-white text-[#1A8CFF] hover:bg-[#1A8CFF] hover:text-white flex items-center justify-center transition-colors duration-200 shadow-sm"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 0 0-1.6 19.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 12 2z" />
              </svg>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube Handy"
              className="w-10 h-10 rounded-xl bg-white text-[#1A8CFF] hover:bg-[#F0436A] hover:text-white flex items-center justify-center transition-colors duration-200 shadow-sm"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z" />
              </svg>
            </a>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#4A4A4A] leading-relaxed pt-1">
            <ShieldCheck className="w-5 h-5 text-[#17A673] shrink-0" />
            <span>Thanh toán an toàn bảo mật qua SePAY</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Legal */}
      <div className="border-t border-[#1E3A6B]/10">
        <div className="max-w-[1240px] mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm font-medium text-[#1E3A6B]">
          <span>© 2026 HANDY. Đã đăng ký bản quyền.</span>
          <div className="flex items-center gap-3.5">
            <Link
              href="/terms"
              className="text-[#1E3A6B] hover:text-[#0B6FE0] transition"
            >
              Điều khoản dịch vụ
            </Link>
            <span className="w-px h-3.5 bg-[#1E3A6B]/30" />
            <Link
              href="/privacy"
              className="text-[#1E3A6B] hover:text-[#0B6FE0] transition"
            >
              Chính sách bảo mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
