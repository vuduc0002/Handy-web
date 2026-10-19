'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Star } from 'lucide-react'

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
      const redirectTo = typeof window !== 'undefined'
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
            {/* Logo + Header */}
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
                Khôi phục mật khẩu
              </h1>
              <p className="text-sm text-gray-500 mt-1 text-center">
                Nhập email đăng ký để nhận liên kết đặt lại mật khẩu
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-5 rounded-2xl bg-red-50 border-2 border-red-200 p-4 text-sm text-red-600 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{error}</div>
              </div>
            )}

            {/* Success State */}
            {success ? (
              <div className="space-y-5">
                <div className="rounded-2xl bg-green-50 border-2 border-green-200 p-4 text-sm text-green-800 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-green-900">Yêu cầu đã được gửi!</p>
                    <p className="text-green-700 leading-relaxed">
                      Đã gửi link khôi phục vào email của bạn. Vui lòng kiểm tra hộp thư (cả hòm thư Rác/Spam).
                    </p>
                    <p className="text-xs text-green-600 pt-1 font-medium">
                      Gửi tới: <span className="font-bold underline">{email}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(false)
                      setError(null)
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-amber-300 text-amber-800 hover:bg-amber-50 font-bold text-xs transition active:scale-95 text-center"
                  >
                    Chưa nhận được? Thử gửi lại
                  </button>

                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-md shadow-amber-200 transition-all duration-200 active:scale-95"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại Đăng nhập
                  </Link>
                </div>
              </div>
            ) : (
              /* Request Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1.5">
                    📧 Email đăng ký
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
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-base shadow-lg shadow-amber-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2 active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang gửi yêu cầu...</span>
                    </>
                  ) : (
                    '📩 Gửi yêu cầu'
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
