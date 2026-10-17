'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Download, ShieldCheck, Heart, Share2, Video } from 'lucide-react'

export default function Footer() {
  const pathname = usePathname()

  // Không hiển thị Footer học sinh khi đang ở giao diện Quản trị (/admin/*)
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="bg-amber-950 text-amber-100 border-t-4 border-amber-400 mt-auto pt-14 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-amber-800/60">
          {/* CỘT TRÁI: Logo, giới thiệu, mạng xã hội */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-block bg-white p-2 rounded-2xl shadow-md">
              <Image
                src="/handy-logo.png"
                alt="HANDY"
                width={120}
                height={46}
                className="object-contain"
                style={{ height: 'auto' }}
              />
            </Link>

            <p className="text-sm text-amber-200/90 leading-relaxed max-w-sm">
              HANDY là ứng dụng học ngôn ngữ ký hiệu thông qua video tương tác và game thẻ nhớ sinh động, đồng hành cùng trẻ em và gia đình trên hành trình kết nối yêu thương.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-amber-900/80 hover:bg-orange-500 text-amber-200 hover:text-white flex items-center justify-center transition shadow-sm"
                title="Facebook Handy"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-amber-900/80 hover:bg-red-500 text-amber-200 hover:text-white flex items-center justify-center transition shadow-sm"
                title="YouTube Handy"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* CỘT GIỮA: Liên kết Khám phá & Hỗ trợ */}
          <div className="md:col-span-4 grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-wider mb-4 border-b border-amber-800/80 pb-2">
                Khám Phá
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-amber-200/80 font-medium">
                <li>
                  <Link href="/#topics-section" className="hover:text-amber-400 transition">
                    Chủ đề bài học
                  </Link>
                </li>
                <li>
                  <Link href="/#topics-section" className="hover:text-amber-400 transition">
                    Luyện tập Quiz
                  </Link>
                </li>
                <li>
                  <Link href="/checkout" className="hover:text-amber-400 transition">
                    Gói tài khoản VIP
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-amber-400 transition">
                    Tài khoản của tôi
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-wider mb-4 border-b border-amber-800/80 pb-2">
                Hỗ Trợ
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-amber-200/80 font-medium">
                <li>
                  <Link href="#" className="hover:text-amber-400 transition">
                    Liên hệ hỗ trợ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-amber-400 transition">
                    Điều khoản dịch vụ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-amber-400 transition">
                    Chính sách bảo mật
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-amber-400 transition">
                    Hướng dẫn thanh toán
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* CỘT PHẢI: Tải APK & Bảo mật */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-white font-black text-sm uppercase tracking-wider mb-4 border-b border-amber-800/80 pb-2">
              Ứng Dụng Di Động
            </h4>

            <p className="text-xs text-amber-300/80">
              Trải nghiệm học tập mượt mà hơn trên thiết bị di động Android.
            </p>

            {/* Nhãn hiệu Get it on Google APK */}
            <div className="inline-flex items-center gap-3 p-3.5 rounded-2xl bg-amber-900/60 border border-amber-700/80 text-white shadow-sm hover:border-amber-400 transition cursor-pointer group">
              <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow">
                <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                  Tải ngay cho Android
                </p>
                <p className="text-xs font-black tracking-wide">
                  Get it on Google APK
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-amber-300/70 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Thanh toán an toàn bảo mật qua SePAY</span>
            </div>
          </div>
        </div>

        {/* DÒNG BẢN QUYỀN COPYRIGHT */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-amber-300/70">
          <p>© 2026 HANDY. Đã đăng ký bản quyền.</p>
          <p className="flex items-center gap-1">
            Xây dựng với <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> vì cộng đồng
          </p>
        </div>
      </div>
    </footer>
  )
}
