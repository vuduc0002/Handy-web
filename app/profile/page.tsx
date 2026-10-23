'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { logoutUser } from '@/lib/authUtils'
import {
  User,
  Crown,
  Calendar,
  Mail,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  LogOut,
  Loader2,
  BookOpen,
  QrCode,
  CheckCircle2
} from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  role: string
  is_premium: boolean
  vip_until?: string | null
  plan_type?: string | null
  created_at?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [authUser, setAuthUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadUserData = async () => {
      try {
        setLoading(true)
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.replace('/login')
          return
        }

        if (isMounted) setAuthUser(user)

        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, email, role, is_premium, vip_until, plan_type, created_at')
          .eq('id', user.id)
          .maybeSingle()

        if (isMounted) {
          setProfile(profileData ?? {
            id: user.id,
            email: user.email || '',
            role: 'USER',
            is_premium: false,
            created_at: user.created_at,
          })
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadUserData()

    return () => {
      isMounted = false
    }
  }, [router])

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    await logoutUser('/login')
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-3" />
        <p className="text-gray-600 font-bold">Đang tải thông tin cá nhân...</p>
      </div>
    )
  }

  const joinDate = authUser?.created_at
    ? new Date(authUser.created_at).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Chưa cập nhật'

  const isVip = (() => {
    if (profile?.role === 'ADMIN') return true
    return Boolean(profile?.is_premium && (!profile?.vip_until || new Date(profile.vip_until) > new Date()))
  })()

  const vipExpiryStr = profile?.vip_until
    ? new Date(profile.vip_until).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      })
    : null

  const PLAN_LABELS: Record<string, string> = {
    '3m': '3 Tháng',
    '6m': '6 Tháng',
    '1y': '1 Năm',
    'lifetime': 'Trọn Đời',
  }
  const planLabel = profile?.plan_type ? PLAN_LABELS[profile.plan_type] ?? profile.plan_type : null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs sm:text-sm font-extrabold mb-3">
          <User className="w-4 h-4 text-orange-500" />
          <span>Hồ Sơ Học Viên</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-800 tracking-tight">
          Thông Tin Cá Nhân
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Quản lý tài khoản, trạng thái gói học và hành trình học tập cùng Handy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* CỘT TRÁI: Thẻ Avatar & Trạng thái tài khoản */}
        <div className="md:col-span-5 bg-white rounded-3xl border-2 border-amber-300 p-6 sm:p-8 shadow-xl text-center flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-orange-400 to-amber-300 text-white flex items-center justify-center text-4xl shadow-lg shadow-orange-200">
              <User className="w-12 h-12" />
            </div>
            {isVip && (
              <div
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-400 text-white flex items-center justify-center shadow border-2 border-white"
                title="Thành viên VIP"
              >
                <Crown className="w-4 h-4" />
              </div>
            )}
          </div>

          <h2 className="text-xl font-black text-gray-800 mb-1 max-w-full truncate px-2">
            {profile?.email?.split('@')[0] || 'Học viên'}
          </h2>
          <p className="text-xs text-gray-500 mb-4 break-all max-w-full px-2 text-center">{profile?.email}</p>

          {/* Badge trạng thái */}
          <div className="mb-6">
            {isVip ? (
              <div className="flex flex-col items-center gap-1.5">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-black shadow-md shadow-amber-200">
                  <Crown className="w-4 h-4" />
                  <span>Tài Khoản VIP{planLabel ? ` — ${planLabel}` : ' Trọn Đời'}</span>
                </div>
                {vipExpiryStr && (
                  <span className="text-xs font-bold text-gray-500">
                    Hết hạn: <span className="text-orange-600">{vipExpiryStr}</span>
                  </span>
                )}
                {!vipExpiryStr && profile?.is_premium && (
                  <span className="text-xs font-bold text-gray-500">Hiệu lực vĩnh viễn</span>
                )}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Tài Khoản Thường (Miễn phí)</span>
              </div>
            )}
          </div>

          <div className="w-full pt-4 border-t border-amber-100 space-y-2">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất tài khoản'}</span>
            </button>
          </div>
        </div>

        {/* CỘT PHẢI: Chi tiết tài khoản & Banner Nâng cấp VIP */}
        <div className="md:col-span-7 space-y-6">
          {/* Box chi tiết */}
          <div className="bg-white rounded-3xl border-2 border-amber-200 p-6 sm:p-7 shadow-sm space-y-4">
            <h3 className="font-extrabold text-gray-800 text-base flex items-center gap-2 pb-3 border-b border-amber-100">
              <span>📋</span> Thông tin chi tiết
            </h3>

            <div className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
                <div className="flex items-center gap-3 min-w-0">
                  <Mail className="w-5 h-5 text-orange-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs text-gray-500 font-bold block">Email đăng ký</span>
                    <span className="text-sm font-black text-gray-800 break-all">{profile?.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <div>
                    <span className="text-xs text-gray-500 font-bold block">Ngày tham gia hệ thống</span>
                    <span className="text-sm font-black text-gray-800">{joinDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <div>
                    <span className="text-xs text-gray-500 font-bold block">Vai trò người dùng</span>
                    <span className="text-sm font-black text-gray-800">
                      {profile?.role === 'ADMIN' ? 'Quản Trị Viên (ADMIN)' : 'Học Viên (USER)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Nâng cấp VIP nếu chưa nâng cấp */}
          {!isVip ? (
            <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black">
                  <Sparkles className="w-4 h-4 text-yellow-200" />
                  GÓI NÂNG CẤP VIP
                </div>

                <h3 className="text-2xl font-black">Mở Khóa Toàn Bộ Bài Học VIP</h3>

                <p className="text-xs sm:text-sm text-amber-100 max-w-md leading-relaxed">
                  Xem không giới hạn kho video từ vựng chất lượng cao, các chủ đề nâng cao và tài liệu luyện tập thủ ngữ trọn đời!
                </p>

                <div className="pt-2">
                  <Link
                    href="/checkout"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-orange-600 font-black text-sm shadow-md hover:bg-amber-50 transition active:scale-95"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Nâng cấp VIP ngay (Quét VietQR)</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 rounded-3xl p-6 border-2 border-emerald-200 text-emerald-900 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-base">Bạn đã kích hoạt gói VIP{planLabel ? ` ${planLabel}` : ''}!</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Bạn có toàn quyền truy cập tất cả các chủ đề và tính năng luyện tập Quizlet trên Handy.
                </p>
                {vipExpiryStr && (
                  <p className="text-xs text-emerald-600 font-bold mt-1">
                    Hết hạn: <span className="text-orange-600">{vipExpiryStr}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
