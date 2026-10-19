'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import { Mail, Lock, Eye, EyeOff, Loader2, Star } from 'lucide-react'

type AuthMode = 'login' | 'register'

export default function LoginPage() {
  const router = useRouter()

  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // Kiểm tra nếu user đã đăng nhập thì tự động chuyển về trang chủ (chống lỗi ấn Back)
  useEffect(() => {
    let isMounted = true
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
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
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // Dùng replace để thay thế trang login trong lịch sử, tránh ấn Back lại bị rơi vào login
        router.replace('/')
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('🎉 Đăng ký thành công! Hãy kiểm tra email để xác nhận tài khoản nhé!')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Vui lòng thử lại!'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div
        className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-amber-50"
        style={{ backgroundColor: '#fffbeb' }}
      >
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    )
  }

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{
        backgroundColor: '#fffbeb',
        background: 'linear-gradient(135deg, #fff9e6 0%, #ffecd2 50%, #ffe0f0 100%)',
      }}
    >
      {/* Decorative stars */}
      <Star className="absolute top-24 left-8 w-6 h-6 text-yellow-400 fill-yellow-400 opacity-70 rotate-12 hidden md:block" />
      <Star className="absolute top-32 right-12 w-4 h-4 text-pink-400 fill-pink-400 opacity-70 -rotate-12 hidden md:block" />
      <Star className="absolute bottom-24 left-16 w-5 h-5 text-orange-400 fill-orange-400 opacity-60 rotate-45 hidden md:block" />
      <Star className="absolute bottom-32 right-8 w-7 h-7 text-purple-400 fill-purple-400 opacity-60 -rotate-6 hidden md:block" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-amber-200 overflow-hidden">
          {/* Top colorful strip */}
          <div className="h-3 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-teal-400 via-blue-400 to-purple-500" />

          <div className="p-8">
            {/* Logo + Title */}
            <div className="flex flex-col items-center mb-6">
              <Image
                src="/handy-logo.png"
                alt="HANDY"
                width={160}
                height={64}
                className="object-contain mb-2"
                style={{ height: 'auto' }}
                priority
              />
              <h1 className="text-2xl font-extrabold text-gray-800">
                {mode === 'login' ? '👋 Chào mừng trở lại!' : '🌟 Tạo tài khoản mới!'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {mode === 'login' ? 'Đăng nhập để tiếp tục học nào!' : 'Tham gia HANDY để bắt đầu học!'}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex rounded-2xl bg-amber-50 border-2 border-amber-200 p-1 mb-6 gap-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError(null)
                  setMessage(null)
                }}
                className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-md'
                    : 'text-amber-700 hover:text-orange-500'
                }`}
              >
                🔑 Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register')
                  setError(null)
                  setMessage(null)
                }}
                className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
                  mode === 'register'
                    ? 'bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-md'
                    : 'text-amber-700 hover:text-orange-500'
                }`}
              >
                ✨ Đăng ký
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1.5">
                  📧 Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@cua.ban@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-amber-50/60 border-2 border-amber-200 text-gray-800 placeholder-amber-400 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1.5">
                  🔒 Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-2xl bg-amber-50/60 border-2 border-amber-200 text-gray-800 placeholder-amber-400 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-500 hover:text-orange-500 transition"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === 'login' && (
                  <div className="flex justify-end mt-1.5">
                    <Link
                      href="/forgot-password"
                      className="text-xs text-orange-600 hover:underline font-medium"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                )}
                {mode === 'register' && (
                  <p className="text-xs text-gray-500 mt-1.5 ml-1">Tối thiểu 6 ký tự nhé bạn!</p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-2xl bg-red-50 border-2 border-red-200 px-4 py-3 text-sm text-red-600 font-medium">
                  😅 {error}
                </div>
              )}

              {/* Success */}
              {message && (
                <div className="rounded-2xl bg-green-50 border-2 border-green-200 px-4 py-3 text-sm text-green-600 font-medium">
                  {message}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-base shadow-lg shadow-amber-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2 active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {mode === 'login' ? 'Đang đăng nhập…' : 'Đang đăng ký…'}
                  </>
                ) : mode === 'login' ? (
                  '🚀 Đăng nhập'
                ) : (
                  '🎉 Đăng ký ngay'
                )}
              </button>
            </form>

            {/* Footer switch */}
            <p className="text-center text-sm text-gray-500 mt-5">
              {mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login')
                  setError(null)
                  setMessage(null)
                }}
                className="text-orange-500 hover:text-orange-600 font-bold transition"
              >
                {mode === 'login' ? 'Đăng ký ngay!' : 'Đăng nhập!'}
              </button>
            </p>
          </div>

          {/* Bottom colorful strip */}
          <div className="h-2 bg-gradient-to-r from-purple-400 via-blue-400 via-teal-400 via-green-400 via-yellow-400 to-red-400" />
        </div>
      </div>
    </div>
  )
}
