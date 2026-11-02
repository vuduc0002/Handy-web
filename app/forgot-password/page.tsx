'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import {
  Mail,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Heart,
  Check
} from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Vui lòng nhập địa chỉ email của bạn.')
      return
    }

    setLoading(true)

    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/reset-password`
          : '/reset-password'

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo,
      })

      if (resetError) {
        throw resetError
      }

      setSuccess(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Vui lòng thử lại sau!'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex font-sans text-[#1E1E1E] bg-white">
      {/* ================================================================
          CỘT TRÁI: BRANDING BANNER (ẨN TRÊN MÀN HÌNH NHỎ)
          ================================================================ */}
      <aside
        className="hidden lg:flex flex-col justify-between p-10 xl:p-14 w-[46%] min-h-screen relative overflow-hidden text-white select-none shrink-0"
        style={{
          background:
            'radial-gradient(60% 60% at 15% 0%,#4FB0FF 0%,rgba(79,176,255,0) 60%),radial-gradient(50% 60% at 100% 100%,#1478EA 0%,rgba(20,120,234,0) 70%),#2A97FF',
        }}
      >
        {/* Dot pattern background */}
        <span
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.7) 1.6px,transparent 1.8px)',
            backgroundSize: '26px 26px',
          }}
        />

        {/* Decorative Circles */}
        <span
          aria-hidden="true"
          className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-[#F9C31F] opacity-90 pointer-events-none"
        />
        <span
          aria-hidden="true"
          className="absolute -left-16 -bottom-16 w-44 h-44 rounded-full bg-[#7B5BB5] opacity-85 pointer-events-none"
        />

        {/* Floating Heart Icon */}
        <div
          aria-hidden="true"
          className="absolute right-7 bottom-24 w-20 h-20 rounded-2xl bg-[#F0436A] flex items-center justify-center rotate-12 shadow-[0_10px_0_rgba(0,40,100,0.15)] pointer-events-none animate-handy-float"
        >
          <Heart className="w-9 h-9 fill-current stroke-none text-white" />
        </div>

        {/* Brand Logo */}
        <Link
          href="/"
          aria-label="Về trang chủ HANDY"
          className="relative z-10 self-start flex items-center px-4 py-2.5 rounded-2xl bg-white shadow-md hover:opacity-95 transition"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo-handy-sm.png"
            alt="HANDY"
            className="h-11 w-auto block object-contain"
          />
        </Link>

        {/* Brand Narrative */}
        <div className="relative z-10 flex flex-col gap-5 max-w-[460px]">
          <h1 className="font-bold text-4xl xl:text-5xl leading-tight text-white tracking-tight">
            Thế giới to trong{' '}
            <span className="inline-block bg-[#FFD84D] text-[#1E1E1E] px-3.5 pb-1 rounded-xl -rotate-2 shadow-[0_6px_0_rgba(0,40,100,0.18)]">
              bàn tay nhỏ
            </span>
          </h1>

          <p className="text-base text-white/95 leading-relaxed">
            Tạo tài khoản để lưu tiến độ học, luyện tập và làm bài kiểm tra theo từng chủ đề ngôn ngữ ký hiệu.
          </p>

          <ul className="flex flex-col gap-3 pt-2">
            {[
              'Lưu ký hiệu đã thuộc',
              'Xem lại kết quả kiểm tra',
              'Học tiếp trên điện thoại và máy tính',
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-3 text-[15px] font-medium text-white">
                <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-white stroke-[2.8]" />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Brand Footer */}
        <span className="relative z-10 text-xs text-white/70">
          © 2026 HANDY. Đã đăng ký bản quyền.
        </span>
      </aside>

      {/* ================================================================
          CỘT PHẢI: FORM QUÊN MẬT KHẨU
          ================================================================ */}
      <main className="flex-1 min-w-0 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 bg-white overflow-y-auto">
        {/* Top Header Navigation */}
        <div className="flex justify-between items-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#4A4A4A] hover:text-[#1A8CFF] transition"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.4]" />
            <span>Quay lại đăng nhập</span>
          </Link>

          {/* Logo on mobile only */}
          <div className="lg:hidden">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/logo-handy-sm.png"
                alt="HANDY"
                className="h-9 w-auto block object-contain"
              />
            </Link>
          </div>
        </div>

        {/* Center Content Box */}
        <div className="w-full max-w-[440px] mx-auto my-auto py-8 flex flex-col gap-6">
          {/* Header Title */}
          <div className="flex flex-col gap-2">
            <h2 className="font-bold text-2xl sm:text-3xl text-[#1E1E1E] tracking-tight">
              <span className="text-[#7B5BB5]">Quên</span> mật khẩu?
            </h2>
            <p className="text-sm text-[#4A4A4A] leading-relaxed">
              Nhập email đã đăng ký, HANDY sẽ gửi hướng dẫn đặt lại mật khẩu cho bạn.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-[#FFF0F3] border border-[#F9C4D1] text-[#C8284F] text-sm flex items-start gap-2.5 animate-slide-down">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Success State */}
          {success ? (
            <div className="flex flex-col gap-5 p-6 rounded-2xl bg-[#E3F7EE] border border-[#B9E6D3] text-center animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-[#17A673] text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-bold text-lg text-[#0C8558]">Đã gửi hướng dẫn!</h3>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">
                  Chúng tôi đã gửi đường dẫn đặt lại mật khẩu tới email{' '}
                  <b className="text-[#1E1E1E]">{email}</b>. Vui lòng kiểm tra hộp thư (kể cả mục Spam).
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false)
                    setError(null)
                  }}
                  className="w-full py-2.5 rounded-xl border border-[#B9E6D3] text-[#0C8558] hover:bg-white text-xs font-bold transition cursor-pointer"
                >
                  Chưa nhận được? Thử gửi lại
                </button>
                <Link
                  href="/login"
                  className="w-full py-3 rounded-full bg-[#1A8CFF] hover:bg-[#0B6FE0] text-white text-sm font-semibold shadow-md transition"
                >
                  Quay lại Đăng nhập
                </Link>
              </div>
            </div>
          ) : (
            /* Request Form */
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-bold text-[#1E1E1E]">
                  Email đăng ký
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vidu@gmail.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#E3E7EE] text-[15px] text-[#1E1E1E] placeholder-[#9AA0AA] outline-none focus:border-[#7B5BB5] focus:ring-4 focus:ring-[rgba(123,91,181,0.12)] transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-white font-semibold text-base shadow-[0_12px_26px_rgba(123,91,181,0.3)] bg-gradient-to-r from-[#4E2F8C] to-[#7B5BB5] hover:brightness-105 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang gửi hướng dẫn…</span>
                  </>
                ) : (
                  'Gửi hướng dẫn'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Bottom copyright on mobile */}
        <div className="lg:hidden text-center text-xs text-[#8A8F99] pt-4">
          © 2026 HANDY. Đã đăng ký bản quyền.
        </div>
      </main>
    </div>
  )
}
