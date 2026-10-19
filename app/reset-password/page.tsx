'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ArrowLeft, Star } from 'lucide-react'

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

    // Kiểm tra session hiện tại hoặc lắng nghe sự kiện khôi phục từ link email
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session && isMounted) {
        setHasSession(true)
        setVerifyingSession(false)
      }
    }
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return
      if (event === 'PASSWORD_RECOVERY' || session) {
        setHasSession(true)
        setVerifyingSession(false)
      }
    })

    // Timeout dự phòng: nếu sau 1.8s không phát hiện session/token thì tắt trạng thái loading xác thực
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

      // Tự động chuyển hướng về trang /login sau 2 giây
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
        <div className="bg-white rounded-3xl shadow-xl border-2 border-amber-200 overflow-hidden">
          {/* Top colorful strip */}
          <div className="h-3 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-teal-400 via-blue-400 to-purple-500" />

          <div className="p-8">
            {/* Header */}
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
              <h1 className="text-2xl font-extrabold text-gray-800 text-center">
                Đặt lại mật khẩu mới
              </h1>
              <p className="text-sm text-gray-500 mt-1 text-center">
                Nhập mật khẩu mới cho tài khoản HANDY của bạn
              </p>
            </div>

            {/* Verifying Session Loader */}
            {verifyingSession ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                <p className="text-sm text-gray-500 font-medium">Đang xác thực liên kết khôi phục...</p>
              </div>
            ) : !hasSession && !success ? (
              /* Session Missing / Expired Notice */
              <div className="space-y-4">
                <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-4 text-sm text-amber-900 flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Liên kết đã hết hạn hoặc không hợp lệ</p>
                    <p className="text-amber-800 text-xs leading-relaxed">
                      Vui lòng mở đúng đường link từ email mới nhất, hoặc yêu cầu gửi lại link khôi phục mới.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href="/forgot-password"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-md shadow-amber-200 transition-all duration-200 active:scale-95"
                  >
                    Gửi lại yêu cầu khôi phục
                  </Link>

                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-1.5 py-2 text-xs text-orange-600 hover:underline font-bold"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Quay lại Đăng nhập
                  </Link>
                </div>
              </div>
            ) : success ? (
              /* Success Banner */
              <div className="space-y-5">
                <div className="rounded-2xl bg-green-50 border-2 border-green-200 p-4 text-sm text-green-800 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-green-900">Cập nhật mật khẩu thành công!</p>
                    <p className="text-green-700 text-xs">
                      Hệ thống đang tự động chuyển hướng về trang Đăng nhập sau 2 giây...
                    </p>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-md shadow-amber-200 transition-all duration-200 active:scale-95"
                  >
                    Đăng nhập ngay
                  </Link>
                </div>
              </div>
            ) : (
              /* Reset Password Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Banner */}
                {error && (
                  <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-3.5 text-sm text-red-600 font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* New Password */}
                <div>
                  <label htmlFor="new-password" className="block text-sm font-bold text-gray-700 mb-1.5">
                    🔒 Mật khẩu mới
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 pointer-events-none" />
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full pl-10 pr-11 py-3 rounded-2xl bg-amber-50/60 border-2 border-amber-200 text-gray-800 placeholder-amber-400 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                      autoFocus
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
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-bold text-gray-700 mb-1.5">
                    🔒 Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 pointer-events-none" />
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full pl-10 pr-11 py-3 rounded-2xl bg-amber-50/60 border-2 border-amber-200 text-gray-800 placeholder-amber-400 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-500 hover:text-orange-500 transition"
                      aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-500 ml-1">
                  Mật khẩu cần tối thiểu 6 ký tự để bảo vệ an toàn cho tài khoản của bạn.
                </p>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-base shadow-lg shadow-amber-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-3 active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang cập nhật...</span>
                    </>
                  ) : (
                    '🚀 Cập nhật mật khẩu'
                  )}
                </button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:underline font-bold"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Quay lại Đăng nhập
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
