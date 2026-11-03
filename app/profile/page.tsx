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
  CreditCard,
  CheckCircle2,
  Lock,
  Layers,
  ChevronRight,
  Check,
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

interface TopicItem {
  id: string
  title: string
  is_free: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [authUser, setAuthUser] = useState<any>(null)
  const [topics, setTopics] = useState<TopicItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [activeTab, setActiveTab] = useState<'progress' | 'profile' | 'vip'>('progress')

  useEffect(() => {
    let isMounted = true

    const loadUserData = async () => {
      try {
        setLoading(true)
        const [userRes, topicsRes] = await Promise.all([
          supabase.auth.getUser(),
          supabase.from('topics').select('id, title, is_free').order('created_at', { ascending: true }),
        ])

        const user = userRes.data?.user
        if (!user) {
          router.replace('/login')
          return
        }

        if (isMounted) {
          setAuthUser(user)
          if (topicsRes.data) {
            setTopics(topicsRes.data)
          }
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, email, role, is_premium, vip_until, plan_type, created_at')
          .eq('id', user.id)
          .maybeSingle()

        if (isMounted) {
          setProfile(
            profileData ?? {
              id: user.id,
              email: user.email || '',
              role: 'USER',
              is_premium: false,
              created_at: user.created_at,
            }
          )
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

  const formatDateVN = (dateStr?: string | null): string => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#1A8CFF] animate-spin mb-3" />
        <p className="text-[#4A4A4A] font-bold">Đang tải thông tin tài khoản...</p>
      </div>
    )
  }

  const joinDate = authUser?.created_at
    ? formatDateVN(authUser.created_at)
    : 'Chưa cập nhật'

  // Kiểm tra trạng thái VIP còn hiệu lực
  const isVip = (() => {
    if (profile?.role === 'ADMIN') return true
    return Boolean(
      profile?.is_premium &&
        (!profile?.vip_until || new Date(profile.vip_until) > new Date())
    )
  })()

  const PLAN_LABELS: Record<string, string> = {
    '3m': 'Gói VIP 3 Tháng',
    '6m': 'Gói VIP 6 Tháng',
    '1y': 'Gói VIP 1 Năm',
    'lifetime': 'Gói VIP Trọn Đời',
  }

  const planName = (() => {
    if (!isVip) return 'Gói Miễn Phí'
    if (profile?.plan_type && PLAN_LABELS[profile.plan_type]) {
      return PLAN_LABELS[profile.plan_type]
    }
    return 'Gói VIP Trọn Đời'
  })()

  const isLifetime = profile?.plan_type === 'lifetime' || (!profile?.vip_until && isVip)
  const expiryDateFormatted = profile?.vip_until ? formatDateVN(profile.vip_until) : null

  const userDisplayName =
    profile?.email?.split('@')[0] || authUser?.email?.split('@')[0] || 'Học viên'
  const userInitial = (userDisplayName.charAt(0) || 'U').toUpperCase()

  const roleLabelMap: Record<string, string> = {
    STUDENT: 'Học sinh',
    TEACHER: 'Giáo viên',
    PARENT: 'Phụ huynh',
    ADMIN: 'Quản trị viên',
    USER: 'Học viên',
  }
  const roleLabel = roleLabelMap[profile?.role || 'USER'] || 'Học viên'

  return (
    <div className="min-h-screen bg-white">
      {/* 01 BANNER HỒ SƠ CHUẨN HANDY V2 */}
      <section className="relative overflow-hidden bg-[radial-gradient(45%_70%_at_100%_0%,#E2F0FF_0%,rgba(226,240,255,0)_70%),radial-gradient(40%_70%_at_0%_100%,#FFF1C9_0%,rgba(255,241,201,0)_70%),#F7FAFF] border-b border-[#E8EFF8]">
        <div className="relative max-w-6xl mx-auto px-6 py-8 md:py-10 flex flex-col gap-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[#6B6B6B]">
            <Link href="/" className="hover:text-[#1A8CFF] transition-colors">
              Trang chủ
            </Link>
            <span className="text-[#A0A0A0]">/</span>
            <span className="text-[#1A8CFF] font-semibold">Tài khoản của tôi</span>
          </nav>

          {/* User Profile Header Card */}
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-5 flex-1 min-w-[280px]">
              {/* Avatar circle */}
              <div className="flex-none w-20 h-20 sm:w-22 sm:h-22 rounded-[26px] bg-gradient-to-br from-[#5CB0FF] to-[#1A6FE0] text-white flex items-center justify-center text-3xl sm:text-4xl font-extrabold shadow-[0_14px_30px_rgba(26,111,224,0.3)] -rotate-3">
                {userInitial}
              </div>

              <div className="flex flex-col gap-1.5 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] tracking-tight">
                  Xin chào, <span className="text-[#1A8CFF]">{userDisplayName}</span>
                </h1>

                <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm text-[#4A4A4A]">
                  <span className="font-semibold px-3 py-0.5 rounded-full bg-[#FFF0F3] text-[#C8284F]">
                    {roleLabel}
                  </span>
                  <span
                    className={`font-semibold px-3 py-0.5 rounded-full ${
                      isVip ? 'bg-[#FFF1C9] text-[#9A5B00]' : 'bg-[#F1F3F7] text-[#4A4A4A]'
                    }`}
                  >
                    {planName}
                  </span>
                  <span className="text-[#6B6B6B] truncate max-w-[220px]">
                    {profile?.email}
                  </span>
                </div>
              </div>
            </div>

            {/* VIP CTA */}
            <div>
              {!isVip ? (
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-sm bg-gradient-to-r from-[#B0173C] to-[#F0436A] hover:opacity-95 shadow-[0_10px_24px_rgba(240,67,106,0.28)] transition-all hover:scale-105 active:scale-95"
                >
                  <Crown className="w-4 h-4" />
                  <span>Nâng cấp VIP</span>
                </Link>
              ) : (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFF1C9] text-[#9A5B00] border border-[#FBE3B5] text-xs sm:text-sm font-bold shadow-xs">
                  <Crown className="w-4 h-4 fill-[#F7A21B] text-[#F7A21B]" />
                  <span>{planName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 02 NỘI DUNG TÀI KHOẢN (2 Cột) */}
      <section className="max-w-6xl mx-auto px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI (3.5 cols): Tabs navigation */}
          <aside className="lg:col-span-4 sticky top-24 flex flex-col gap-2 p-4 rounded-[24px] bg-white border border-[#ECEEF3] shadow-[0_14px_36px_rgba(20,30,60,0.06)]">
            <button
              type="button"
              onClick={() => setActiveTab('progress')}
              className={`flex items-center gap-3 p-3.5 rounded-2xl text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'progress'
                  ? 'bg-[#EAF4FF] text-[#0B6FE0] shadow-xs'
                  : 'text-[#4A4A4A] hover:bg-[#F7FAFF] hover:text-[#1A8CFF]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  activeTab === 'progress'
                    ? 'bg-[#1A8CFF] text-white'
                    : 'bg-[#F1F3F7] text-[#6B6B6B]'
                }`}
              >
                <BookOpen className="w-4 h-4" />
              </div>
              <span>Tiến độ học tập</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 p-3.5 rounded-2xl text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#EAF4FF] text-[#0B6FE0] shadow-xs'
                  : 'text-[#4A4A4A] hover:bg-[#F7FAFF] hover:text-[#1A8CFF]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  activeTab === 'profile'
                    ? 'bg-[#1A8CFF] text-white'
                    : 'bg-[#F1F3F7] text-[#6B6B6B]'
                }`}
              >
                <User className="w-4 h-4" />
              </div>
              <span>Thông tin cá nhân</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('vip')}
              className={`flex items-center gap-3 p-3.5 rounded-2xl text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === 'vip'
                  ? 'bg-[#FFF6E5] text-[#B26A00] shadow-xs'
                  : 'text-[#4A4A4A] hover:bg-[#FFF6E5] hover:text-[#B26A00]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  activeTab === 'vip'
                    ? 'bg-[#F7A21B] text-white'
                    : 'bg-[#F1F3F7] text-[#6B6B6B]'
                }`}
              >
                <Crown className="w-4 h-4" />
              </div>
              <span>Gói VIP &amp; Quyền lợi</span>
            </button>

            <div className="pt-2 mt-1 border-t border-[#F1F3F7]">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-sm font-bold text-[#C8284F] hover:bg-[#FFF0F3] transition-all text-left cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-[#FFF0F3] text-[#C8284F] flex items-center justify-center shrink-0">
                  {isLoggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                </div>
                <span>Đăng xuất</span>
              </button>
            </div>
          </aside>

          {/* CỘT PHẢI (8.5 cols): Tab content */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* TAB 1: TIẾN ĐỘ HỌC TẬP */}
            {activeTab === 'progress' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-[#1E1E1E]">
                    Tiến độ <span className="text-[#1A8CFF]">học tập</span>
                  </h2>
                  <span className="text-sm text-[#6B6B6B] font-medium">
                    {topics.length} chủ đề
                  </span>
                </div>

                {topics.map((t, idx) => {
                  const canAccess = t.is_free || isVip

                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between gap-4 p-5 rounded-[20px] bg-white border border-[#ECEEF3] hover:border-[#1A8CFF] hover:shadow-sm transition-all flex-wrap"
                    >
                      <div className="flex items-center gap-4 min-w-[200px] flex-1">
                        <span className="w-10 h-10 rounded-xl bg-[#EAF4FF] text-[#1A8CFF] flex items-center justify-center font-bold text-sm shrink-0">
                          {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-base font-bold text-[#1E1E1E]">
                            {t.title}
                          </span>
                          <span className="text-xs text-[#6B6B6B]">
                            {t.is_free ? 'Chủ đề miễn phí' : 'Yêu cầu gói VIP'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {canAccess ? (
                          <Link
                            href={`/topics/${t.id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#EAF4FF] hover:bg-[#1A8CFF] text-[#1A8CFF] hover:text-white text-xs font-bold transition-all"
                          >
                            <span>Học bài</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <Link
                            href="/pricing"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFF3E0] hover:bg-[#F7931E] text-[#C96A00] hover:text-white text-xs font-bold transition-all"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Mở khóa</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* TAB 2: THÔNG TIN CÁ NHÂN */}
            {activeTab === 'profile' && (
              <div className="flex flex-col gap-6">
                <h2 className="text-xl font-bold text-[#1E1E1E]">
                  Thông tin <span className="text-[#17A673]">cá nhân</span>
                </h2>

                <div className="p-6 sm:p-8 rounded-[24px] bg-white border border-[#ECEEF3] shadow-sm space-y-5">
                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wide">
                      Địa chỉ Email
                    </label>
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F7FAFF] border border-[#E6ECF5] text-sm text-[#1E1E1E] font-medium">
                      <Mail className="w-4 h-4 text-[#8A8F99]" />
                      <span>{profile?.email}</span>
                    </div>
                  </div>

                  {/* Vai trò */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wide">
                      Vai trò trên hệ thống
                    </label>
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F7FAFF] border border-[#E6ECF5] text-sm text-[#1E1E1E] font-medium">
                      <ShieldCheck className="w-4 h-4 text-[#17A673]" />
                      <span>{roleLabel}</span>
                    </div>
                  </div>

                  {/* Ngày tham gia */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wide">
                      Ngày tạo tài khoản
                    </label>
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F7FAFF] border border-[#E6ECF5] text-sm text-[#1E1E1E] font-medium">
                      <Calendar className="w-4 h-4 text-[#8A8F99]" />
                      <span>{joinDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: GÓI VIP & QUYỀN LỢI */}
            {activeTab === 'vip' && (
              <div className="flex flex-col gap-6">
                <h2 className="text-xl font-bold text-[#1E1E1E]">
                  Gói học &amp; <span className="text-[#F7A21B]">Quyền lợi VIP</span>
                </h2>

                {/* Status Card */}
                <div
                  className={`p-6 sm:p-8 rounded-[24px] border ${
                    isVip
                      ? 'bg-gradient-to-br from-[#FFF9EE] to-[#FFF3DF] border-[#FBE3B5]'
                      : 'bg-white border-[#ECEEF3]'
                  } shadow-sm space-y-4`}
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          isVip ? 'bg-[#FFF1C9] text-[#9A5B00]' : 'bg-[#F1F3F7] text-[#6B6B6B]'
                        }`}
                      >
                        <Crown className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wide">
                          Trạng thái gói
                        </span>
                        <h3 className="text-xl font-extrabold text-[#1E1E1E]">
                          {planName}
                        </h3>
                      </div>
                    </div>

                    {!isVip ? (
                      <Link
                        href="/pricing"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#0050B3] to-[#1A8CFF] text-white font-bold text-sm shadow-md transition hover:scale-105 active:scale-95"
                      >
                        <span>Nâng cấp ngay</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#E3F7EE] text-[#0C8558] text-xs font-bold">
                        <Check className="w-4 h-4" /> Đang hoạt động
                      </span>
                    )}
                  </div>

                  {isVip && !isLifetime && expiryDateFormatted && (
                    <p className="text-sm text-[#4A4A4A] pt-2 border-t border-[#F1E4DC]">
                      Thời hạn sử dụng đến ngày:{' '}
                      <strong className="text-[#1A8CFF]">{expiryDateFormatted}</strong>
                    </p>
                  )}

                  {isVip && isLifetime && (
                    <p className="text-sm text-[#0C8558] font-semibold pt-2 border-t border-[#F1E4DC]">
                      Tài khoản có hiệu lực vĩnh viễn, không cần gia hạn.
                    </p>
                  )}
                </div>

                {/* VIP Features Checklist */}
                <div className="p-6 sm:p-8 rounded-[24px] bg-white border border-[#ECEEF3] shadow-sm space-y-4">
                  <h4 className="font-bold text-base text-[#1E1E1E]">
                    Đặc quyền của tài khoản VIP HANDY:
                  </h4>
                  <ul className="space-y-3">
                    {[
                      'Mở khóa toàn bộ kho chủ đề bài giảng thủ ngữ chất lượng cao',
                      'Luyện tập không giới hạn với game lật thẻ Flashcard thông minh',
                      'Làm bài kiểm tra Video Quiz và lưu trữ tiến độ học tập',
                      'Học trên mọi thiết bị: Máy tính, máy tính bảng và điện thoại di động',
                      'Cập nhật các chủ đề và từ vựng mới hoàn toàn miễn phí',
                    ].map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-[#4A4A4A]">
                        <span className="flex-none mt-0.5 w-5 h-5 rounded-full bg-[#E3F7EE] text-[#0C8558] flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {!isVip && (
                    <div className="pt-4">
                      <Link
                        href="/pricing"
                        className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-gradient-to-r from-[#0050B3] to-[#1A8CFF] text-white font-bold text-sm shadow-md transition hover:scale-[1.01] active:scale-95"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Xem bảng giá và các gói VIP</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
