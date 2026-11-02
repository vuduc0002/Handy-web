'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ChevronLeft,
  Check,
  Heart,
  Sparkles,
  AlertCircle
} from 'lucide-react'

type AuthMode = 'login' | 'register'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login'

  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [selectedRole, setSelectedRole] = useState('learner')
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // Prefetch trang chủ ngay khi mở trang login
  useEffect(() => {
    router.prefetch('/')
  }, [router])

  // Kiểm tra nếu user đã đăng nhập thì tự động chuyển về trang chủ
  useEffect(() => {
    let isMounted = true
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session && isMounted) {
        router.replace('/')
      } else if (isMounted) {
        setCheckingAuth(false)
      }
    }
    checkSession()
    return () => {
      isMounted = false
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (mode === 'register' && !agreeTerms) {
      setError('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.')
      return
    }

    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) throw error

        router.refresh()
        router.replace('/')
        return
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim() || undefined,
              role: selectedRole,
            },
          },
        })
        if (error) throw error
        setMessage('🎉 Đăng ký thành công! Hãy kiểm tra hộp thư email để kích hoạt tài khoản.')
        setLoading(false)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Vui lòng thử lại!'
      setError(msg)
      setLoading(false)
    }
  }

  const roles = [
    { key: 'parent', label: 'Phụ huynh', color: 'text-[#F0436A] bg-[#FFF0F3]' },
    { key: 'teacher', label: 'Giáo viên', color: 'text-[#1A8CFF] bg-[#EAF4FF]' },
    { key: 'learner', label: 'Người học', color: 'text-[#17A673] bg-[#E3F7EE]' },
    { key: 'other', label: 'Người quan tâm', color: 'text-[#7B5BB5] bg-[#F3EEFC]' },
  ]

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-[#1A8CFF] animate-spin" />
      </div>
    )
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

        {/* Twinkle Sparkle */}
        <svg
          aria-hidden="true"
          className="absolute right-48 top-12 pointer-events-none animate-handy-twinkle"
          width="28"
          height="28"
          viewBox="0 0 40 40"
        >
          <path
            d="M20 0 C21.5 13 27 18.5 40 20 C27 21.5 21.5 27 20 40 C18.5 27 13 21.5 0 20 C13 18.5 18.5 13 20 0Z"
            fill="#FFD84D"
          />
        </svg>

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
          CỘT PHẢI: FORM ĐĂNG NHẬP / ĐĂNG KÝ
          ================================================================ */}
      <main className="flex-1 min-w-0 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 bg-white overflow-y-auto">
        {/* Top Header Navigation */}
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#4A4A4A] hover:text-[#1A8CFF] transition"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.4]" />
            <span>Về trang chủ</span>
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
          {/* Segmented Mode Switcher */}
          <div
            role="tablist"
            aria-label="Đăng nhập hoặc đăng ký"
            className="relative grid grid-cols-2 p-1.5 rounded-full bg-[#F1F4F9] border border-[#E3E7EE]/80"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => {
                setMode('login')
                setError(null)
                setMessage(null)
              }}
              className={`py-2.5 rounded-full text-[15px] font-bold transition-all duration-300 cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#1A8CFF] shadow-[0_6px_16px_rgba(20,30,60,0.10)]'
                  : 'text-[#6B6B6B] hover:text-[#1E1E1E]'
              }`}
            >
              Đăng nhập
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => {
                setMode('register')
                setError(null)
                setMessage(null)
              }}
              className={`py-2.5 rounded-full text-[15px] font-bold transition-all duration-300 cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-[#F0436A] shadow-[0_6px_16px_rgba(20,30,60,0.10)]'
                  : 'text-[#6B6B6B] hover:text-[#1E1E1E]'
              }`}
            >
              Đăng ký
            </button>
          </div>

          {/* Alert Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-[#FFF0F3] border border-[#F9C4D1] text-[#C8284F] text-sm flex items-start gap-2.5 animate-slide-down">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Alert Success Message */}
          {message && (
            <div className="p-4 rounded-2xl bg-[#E3F7EE] border border-[#B9E6D3] text-[#0C8558] text-sm flex items-start gap-2.5 animate-slide-down">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{message}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Heading */}
            <div className="flex flex-col gap-1 mb-2">
              <h2 className="font-bold text-2xl sm:text-3xl text-[#1E1E1E] tracking-tight">
                {mode === 'login' ? (
                  <>
                    Chào mừng <span className="text-[#1A8CFF]">trở lại</span>
                  </>
                ) : (
                  <>
                    Tạo tài khoản <span className="text-[#F0436A]">HANDY</span>
                  </>
                )}
              </h2>
              <p className="text-sm text-[#4A4A4A]">
                {mode === 'login'
                  ? 'Đăng nhập để tiếp tục hành trình học cùng HANDY.'
                  : 'Miễn phí, chỉ mất chưa đến một phút.'}
              </p>
            </div>

            {/* REGISTER-ONLY: Role selection */}
            {mode === 'register' && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold text-[#1E1E1E]">Bạn là</span>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((r) => {
                    const isSelected = selectedRole === r.key
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => setSelectedRole(r.key)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm font-semibold transition cursor-pointer text-left ${
                          isSelected
                            ? 'border-[#F0436A] bg-[#FFF0F3] text-[#F0436A]'
                            : 'border-[#E3E7EE] bg-white text-[#1E1E1E] hover:border-[#1A8CFF]'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-[#F0436A]' : 'bg-[#D5DAE3]'}`} />
                        <span>{r.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* REGISTER-ONLY: Full name */}
            {mode === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fullName" className="text-sm font-bold text-[#1E1E1E]">
                  Họ và tên
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn An"
                  className="w-full px-4 py-3 rounded-xl border border-[#E3E7EE] text-[15px] text-[#1E1E1E] placeholder-[#9AA0AA] outline-none focus:border-[#F0436A] focus:ring-4 focus:ring-[rgba(240,67,106,0.12)] transition"
                />
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-bold text-[#1E1E1E]">
                Email
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
                  className={`w-full px-4 py-3 rounded-xl border border-[#E3E7EE] text-[15px] text-[#1E1E1E] placeholder-[#9AA0AA] outline-none transition ${
                    mode === 'login'
                      ? 'focus:border-[#1A8CFF] focus:ring-4 focus:ring-[rgba(26,140,255,0.12)]'
                      : 'focus:border-[#F0436A] focus:ring-4 focus:ring-[rgba(240,67,106,0.12)]'
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-bold text-[#1E1E1E]">
                  Mật khẩu
                </label>
                {mode === 'login' && (
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-[#1A8CFF] hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'login' ? 'Nhập mật khẩu' : 'Ít nhất 6 ký tự'}
                  className={`w-full pl-4 pr-11 py-3 rounded-xl border border-[#E3E7EE] text-[15px] text-[#1E1E1E] placeholder-[#9AA0AA] outline-none transition ${
                    mode === 'login'
                      ? 'focus:border-[#1A8CFF] focus:ring-4 focus:ring-[rgba(26,140,255,0.12)]'
                      : 'focus:border-[#F0436A] focus:ring-4 focus:ring-[rgba(240,67,106,0.12)]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#1E1E1E] transition"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* REGISTER-ONLY: Agree to Terms Checkbox */}
            {mode === 'register' && (
              <label className="flex items-start gap-2.5 text-xs sm:text-sm text-[#4A4A4A] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-[#F0436A] accent-[#F0436A]"
                />
                <span className="leading-relaxed">
                  Tôi đồng ý với{' '}
                  <Link href="/terms" className="text-[#1A8CFF] font-semibold hover:underline">
                    Điều khoản dịch vụ
                  </Link>{' '}
                  và{' '}
                  <Link href="/privacy" className="text-[#1A8CFF] font-semibold hover:underline">
                    Chính sách bảo mật
                  </Link>{' '}
                  của HANDY.
                </span>
              </label>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-white font-semibold text-base shadow-md transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer mt-2 ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-[#0050B3] to-[#1A8CFF] shadow-[0_12px_26px_rgba(26,140,255,0.3)] hover:brightness-105'
                  : 'bg-gradient-to-r from-[#B0173C] to-[#F0436A] shadow-[0_12px_26px_rgba(240,67,106,0.3)] hover:brightness-105'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{mode === 'login' ? 'Đang đăng nhập…' : 'Đang tạo tài khoản…'}</span>
                </>
              ) : mode === 'login' ? (
                'Đăng nhập'
              ) : (
                'Tạo tài khoản'
              )}
            </button>
          </form>

          {/* Switch mode footer */}
          <div className="text-center text-sm text-[#4A4A4A] pt-2">
            {mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login')
                setError(null)
                setMessage(null)
              }}
              className={`font-bold hover:underline cursor-pointer ${
                mode === 'login' ? 'text-[#F0436A]' : 'text-[#1A8CFF]'
              }`}
            >
              {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </div>
        </div>

        {/* Bottom copyright on mobile */}
        <div className="lg:hidden text-center text-xs text-[#8A8F99] pt-4">
          © 2026 HANDY. Đã đăng ký bản quyền.
        </div>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-8 h-8 text-[#1A8CFF] animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
