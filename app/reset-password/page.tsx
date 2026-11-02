'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  Heart,
  Check
} from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [verifyingSession, setVerifyingSession] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let isMounted = true

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session && isMounted) {
        setHasSession(true)
        setVerifyingSession(false)
      }
    }
    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return
      if (event === 'PASSWORD_RECOVERY' || session) {
        setHasSession(true)
        setVerifyingSession(false)
      }
    })

    const timer = setTimeout(() => {
      if (isMounted) {
        setVerifyingSession(false)
      }
    }, 1800)

    return () => {
      isMounted = false
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Mật khẩu mới phải có tối thiểu 6 ký tự.')
      return
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp với mật khẩu mới.')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        throw updateError
      }

      setSuccess(true)

      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi đặt lại mật khẩu.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (verifyingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-[#1A8CFF] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex font-sans text-[#1E1E1E] bg-white">
      {/* ================================================================
          CỘT TRÁI: BRANDING BANNER
          ================================================================ */}
      <aside
        className="hidden lg:flex flex-col justify-between p-10 xl:p-14 w-[46%] min-h-screen relative overflow-hidden text-white select-none shrink-0"
        style={{
          background:
            'radial-gradient(60% 60% at 15% 0%,#4FB0FF 0%,rgba(79,176,255,0) 60%),radial-gradient(50% 60% at 100% 100%,#1478EA 0%,rgba(20,120,234,0) 70%),#2A97FF',
        }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.7) 1.6px,transparent 1.8px)',
            backgroundSize: '26px 26px',
          }}
        />

        <span
          aria-hidden="true"
          className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-[#F9C31F] opacity-90 pointer-events-none"
        />
        <span
          aria-hidden="true"
          className="absolute -left-16 -bottom-16 w-44 h-44 rounded-full bg-[#7B5BB5] opacity-85 pointer-events-none"
        />

        <div
          aria-hidden="true"
          className="absolute right-7 bottom-24 w-20 h-20 rounded-2xl bg-[#F0436A] flex items-center justify-center rotate-12 shadow-[0_10px_0_rgba(0,40,100,0.15)] pointer-events-none animate-handy-float"
        >
          <Heart className="w-9 h-9 fill-current stroke-none text-white" />
        </div>

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

        <div className="relative z-10 flex flex-col gap-5 max-w-[460px]">
          <h1 className="font-bold text-4xl xl:text-5xl leading-tight text-white tracking-tight">
            Thế giới to trong{' '}
            <span className="inline-block bg-[#FFD84D] text-[#1E1E1E] px-3.5 pb-1 rounded-xl -rotate-2 shadow-[0_6px_0_rgba(0,40,100,0.18)]">
              bàn tay nhỏ
            </span>
          </h1>

          <p className="text-base text-white/95 leading-relaxed">
            Thiết lập mật khẩu mới an toàn để tiếp tục hành trình học ngôn ngữ ký hiệu cùng HANDY.
          </p>

          <ul className="flex flex-col gap-3 pt-2">
            {[
              'Bảo mật thông tin tài khoản',
              'Đồng bộ tiến độ học tập',
              'Học trên máy tính và điện thoại',
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

        <span className="relative z-10 text-xs text-white/70">
          © 2026 HANDY. Đã đăng ký bản quyền.
        </span>
      </aside>

      {/* ================================================================
          CỘT PHẢI: FORM ĐẶT LẠI MẬT KHẨU
          ================================================================ */}
      <main className="flex-1 min-w-0 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 bg-white overflow-y-auto">
        <div className="flex justify-between items-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#4A4A4A] hover:text-[#1A8CFF] transition"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.4]" />
            <span>Quay lại đăng nhập</span>
          </Link>

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

        <div className="w-full max-w-[440px] mx-auto my-auto py-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-bold text-2xl sm:text-3xl text-[#1E1E1E] tracking-tight">
              Đặt lại <span className="text-[#1A8CFF]">mật khẩu</span>
            </h2>
            <p className="text-sm text-[#4A4A4A] leading-relaxed">
              Tạo mật khẩu mới cho tài khoản của bạn (tối thiểu 6 ký tự).
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-[#FFF0F3] border border-[#F9C4D1] text-[#C8284F] text-sm flex items-start gap-2.5 animate-slide-down">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {success ? (
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-[#E3F7EE] border border-[#B9E6D3] text-center animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-[#17A673] text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-lg text-[#0C8558]">Đổi mật khẩu thành công!</h3>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">
                  Mật khẩu của bạn đã được cập nhật. Đang chuyển hướng về trang đăng nhập...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-bold text-[#1E1E1E]">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-4 pr-11 py-3 rounded-xl border border-[#E3E7EE] text-[15px] text-[#1E1E1E] placeholder-[#9AA0AA] outline-none focus:border-[#1A8CFF] focus:ring-4 focus:ring-[rgba(26,140,255,0.12)] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#1E1E1E] transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirmPassword" className="text-sm font-bold text-[#1E1E1E]">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full pl-4 pr-11 py-3 rounded-xl border border-[#E3E7EE] text-[15px] text-[#1E1E1E] placeholder-[#9AA0AA] outline-none focus:border-[#1A8CFF] focus:ring-4 focus:ring-[rgba(26,140,255,0.12)] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#1E1E1E] transition"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-white font-semibold text-base shadow-[0_12px_26px_rgba(26,140,255,0.3)] bg-gradient-to-r from-[#0050B3] to-[#1A8CFF] hover:brightness-105 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang cập nhật mật khẩu…</span>
                  </>
                ) : (
                  'Lưu mật khẩu mới'
                )}
              </button>
            </form>
          )}
        </div>

        <div className="lg:hidden text-center text-xs text-[#8A8F99] pt-4">
          © 2026 HANDY. Đã đăng ký bản quyền.
        </div>
      </main>
    </div>
  )
}
