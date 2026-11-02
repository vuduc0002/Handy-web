'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import {
  Crown,
  Check,
  Loader2,
  Sparkles,
  PartyPopper,
  Copy,
  AlertTriangle,
  QrCode,
  CreditCard,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'

interface Plan {
  id: string // '3m' | '6m' | '1y' | 'lifetime'
  label: string
  badge: string
  duration: string
  price: number // in VND
  priceDisplay: string
  amountDisplay: string
  code: string
  savings?: string
  highlight?: boolean
  features: string[]
}

const PLANS: Plan[] = [
  {
    id: '3m',
    label: 'Gói 3 tháng',
    badge: 'GÓI 3 THÁNG',
    duration: '3 tháng',
    price: 199000,
    priceDisplay: '199.000đ',
    amountDisplay: '199.000 VNĐ',
    code: 'HD3M',
    features: [
      'Mở khóa toàn bộ chủ đề',
      'Luyện tập không giới hạn',
      'Truy cập video HD',
    ],
  },
  {
    id: '6m',
    label: 'Gói 6 tháng',
    badge: 'GÓI 6 THÁNG',
    duration: '6 tháng',
    price: 349000,
    priceDisplay: '349.000đ',
    amountDisplay: '349.000 VNĐ',
    code: 'HD6M',
    savings: 'Tiết kiệm 49.000đ',
    features: [
      'Mở khóa toàn bộ chủ đề',
      'Luyện tập không giới hạn',
      'Truy cập video HD',
      'Ưu tiên hỗ trợ',
    ],
  },
  {
    id: '1y',
    label: 'Gói 1 năm',
    badge: 'GÓI 1 NĂM',
    duration: '1 năm',
    price: 599000,
    priceDisplay: '599.000đ',
    amountDisplay: '599.000 VNĐ',
    code: 'HD1Y',
    savings: 'Tiết kiệm 79.000đ',
    highlight: true,
    features: [
      'Mở khóa toàn bộ chủ đề',
      'Luyện tập không giới hạn',
      'Truy cập video HD',
      'Ưu tiên hỗ trợ',
      'Nội dung mới sớm nhất',
    ],
  },
  {
    id: 'lifetime',
    label: 'Gói vĩnh viễn',
    badge: 'GÓI VĨNH VIỄN',
    duration: 'Trọn đời',
    price: 999000,
    priceDisplay: '999.000đ',
    amountDisplay: '999.000 VNĐ',
    code: 'HDLIFETIME',
    savings: 'Không cần gia hạn',
    features: [
      'Mở khóa toàn bộ chủ đề',
      'Luyện tập không giới hạn',
      'Truy cập video HD',
      'Ưu tiên hỗ trợ',
      'Nội dung mới sớm nhất',
      'Cập nhật vĩnh viễn',
    ],
  },
]

interface ProfileData {
  is_premium?: boolean | null
  vip_until?: string | null
  plan_type?: string | null
  email?: string | null
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlanId, setSelectedPlanId] = useState<string>('1y')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [pollCount, setPollCount] = useState(0)

  // Đọc gói từ query param hoặc chuyển hướng về /pricing nếu chưa chọn gói
  useEffect(() => {
    if (loading) return
    if (isSuccess) return

    const planParam = searchParams.get('plan')
    if (!planParam) {
      router.replace('/pricing')
      return
    }

    if (planParam === 'lt') {
      setSelectedPlanId('lifetime')
    } else if (PLANS.some((p) => p.id === planParam)) {
      setSelectedPlanId(planParam)
    }
  }, [searchParams, loading, isSuccess, router])

  // Thông tin ngân hàng từ biến môi trường
  const bankName = process.env.NEXT_PUBLIC_BANK_NAME || 'TPBank'
  const bankAccount = process.env.NEXT_PUBLIC_BANK_ACCOUNT || '0369455756'
  const bankOwner = process.env.NEXT_PUBLIC_BANK_OWNER || 'NGUYEN VU DUC'

  const copyToClipboard = (text: string, field: string) => {
    try {
      navigator.clipboard.writeText(text)
    } catch {
      // fallback
    }
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2500)
  }

  // Kiểm tra VIP hợp lệ (xét thời hạn)
  const checkIsVipValid = useCallback((p: ProfileData | null): boolean => {
    if (!p?.is_premium) return false
    if (!p.vip_until) return true // lifetime
    return new Date(p.vip_until) > new Date()
  }, [])

  // Lấy thông tin user và profile
  useEffect(() => {
    let isMounted = true
    const checkAuthAndProfile = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          router.replace('/login')
          return
        }
        if (isMounted) setUser({ id: authUser.id, email: authUser.email })

        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_premium, vip_until, plan_type, email')
          .eq('id', authUser.id)
          .maybeSingle()

        if (isMounted) {
          setProfile(profileData)
          if (checkIsVipValid(profileData)) {
            setIsSuccess(true)
          }
        }
      } catch (err) {
        console.error('Error fetching user for checkout:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    checkAuthAndProfile()
    return () => {
      isMounted = false
    }
  }, [router, checkIsVipValid])

  // Polling: sau khi vào trang thanh toán, poll mỗi 5 giây tối đa 60 giây (12 lần)
  useEffect(() => {
    if (isSuccess || !user) return
    if (pollCount >= 12) return // đã poll đủ 60 giây

    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('is_premium, vip_until, plan_type, email')
        .eq('id', user.id)
        .maybeSingle()

      if (checkIsVipValid(data)) {
        setProfile(data)
        setIsSuccess(true)
      } else {
        setPollCount((prev) => prev + 1)
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [isSuccess, user, pollCount, checkIsVipValid])

  // Realtime: Lắng nghe thay đổi profile tức thì khi SePAY kích hoạt
  useEffect(() => {
    if (!user || isSuccess) return

    const channel = supabase
      .channel(`checkout-profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as ProfileData
          if (checkIsVipValid(updated)) {
            setProfile(updated)
            setIsSuccess(true)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, isSuccess, checkIsVipValid])

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <Loader2 className="w-10 h-10 text-[#1A8CFF] animate-spin mb-4" />
        <p className="text-[#4A4A4A] font-bold">Đang tải trang thanh toán VIP...</p>
      </div>
    )
  }

  // Giao diện khi đã là VIP thành công
  if (isSuccess) {
    const isLifetime = !profile?.vip_until
    const expiryStr = profile?.vip_until
      ? new Date(profile.vip_until).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : null
    const planLabel =
      PLANS.find((p) => p.id === profile?.plan_type)?.label || 'VIP'

    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-xl w-full bg-white rounded-3xl border-2 border-[#17A673]/30 p-8 md:p-12 shadow-[0_20px_50px_rgba(23,166,115,0.12)] text-center relative overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-[#17A673] via-[#1A8CFF] to-[#F9C31F] absolute top-0 left-0 right-0" />

          <div className="w-20 h-20 rounded-3xl bg-[#E3F7EE] text-[#0C8558] flex items-center justify-center mx-auto mb-6 shadow-inner">
            <PartyPopper className="w-10 h-10" />
          </div>

          <span className="inline-block text-xs font-black text-[#0C8558] bg-[#E3F7EE] px-4 py-1.5 rounded-full uppercase tracking-wider mb-4">
            Đã kích hoạt thành công
          </span>

          <h1 className="text-3xl font-extrabold text-[#1E1E1E] mb-3">
            🎉 Bạn đã là Thành viên VIP!
          </h1>

          <div className="flex flex-col items-center gap-1.5 mb-4">
            <span className="inline-flex items-center gap-2 text-sm font-bold text-[#9A5B00] bg-[#FFF1C9] px-4 py-1.5 rounded-full">
              <Crown className="w-4 h-4 fill-[#F7A21B] text-[#F7A21B]" /> {planLabel}
            </span>
            {!isLifetime && expiryStr && (
              <span className="text-sm text-[#6B6B6B] font-semibold mt-1">
                Có hiệu lực đến:{' '}
                <span className="text-[#1A8CFF] font-bold">{expiryStr}</span>
              </span>
            )}
            {isLifetime && (
              <span className="text-sm text-[#0C8558] font-bold mt-1">
                Hiệu lực trọn đời
              </span>
            )}
          </div>

          <p className="text-[#4A4A4A] text-sm md:text-base mb-8 leading-relaxed">
            Cảm ơn bạn đã nâng cấp gói VIP HANDY. Giờ đây bạn có thể mở khóa toàn bộ bài giảng thủ ngữ chất lượng cao và luyện tập không giới hạn trên hệ thống!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#1A8CFF] to-[#0B6FE0] hover:from-[#0B6FE0] hover:to-[#0050B3] text-white font-bold text-base shadow-[0_12px_24px_rgba(26,140,255,0.3)] transition active:scale-95 w-full sm:w-auto"
            >
              <Sparkles className="w-5 h-5" />
              Khám phá bài học ngay
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId) ?? PLANS[2]
  const planCode = selectedPlan.code
  const transferContent = `${planCode} ${user?.id || ''}`.trim()
  const qrUrl = `https://qr.sepay.vn/img?acc=${bankAccount}&bank=${bankName}&amount=${selectedPlan.price}&des=${encodeURIComponent(transferContent)}`

  return (
    <div className="relative overflow-hidden bg-[radial-gradient(45%_70%_at_100%_0%,#E2F0FF_0%,rgba(226,240,255,0)_70%),radial-gradient(40%_60%_at_0%_100%,#FFF1C9_0%,rgba(255,241,201,0)_70%),#F7FAFF] min-h-screen py-8 md:py-12">
      <div className="relative max-w-6xl mx-auto px-6 flex flex-col gap-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 flex-wrap text-sm text-[#6B6B6B]"
        >
          <Link href="/" className="hover:text-[#1A8CFF] transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A0A0A0]" />
          <Link href="/pricing" className="hover:text-[#1A8CFF] transition-colors">
            Gói tài khoản VIP
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A0A0A0]" />
          <span className="text-[#1A8CFF] font-semibold">Thanh toán</span>
        </nav>

        {/* 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI: VietQR (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-white rounded-[26px] p-7 md:p-8 shadow-[0_20px_48px_rgba(20,30,60,0.08)] text-center flex flex-col items-center gap-5 border border-[#EBF1FA]">
            {/* Tag QR */}
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EAF4FF] text-[#0B6FE0] text-sm font-bold">
              <QrCode className="w-4 h-4" />
              Quét mã VietQR chuyển khoản
            </span>

            {/* QR Container */}
            <div className="w-full max-w-[270px] p-3.5 rounded-[22px] bg-white border-2 border-[#CFE3FB] shadow-[0_0_0_6px_#F4F9FF]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="Mã VietQR thanh toán SePAY"
                className="w-full h-auto aspect-square object-contain rounded-xl"
              />
            </div>

            <p className="text-sm leading-relaxed text-[#4A4A4A] max-w-xs">
              Mở App ngân hàng bất kỳ (Vietcombank, MB, Techcombank, TPBank, MoMo...) và quét mã QR trên để chuyển khoản tự động.
            </p>

            {/* Trạng thái kích hoạt tự động */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#FFF6E5] border border-[#FBE3B5] text-[#B26A00] text-xs sm:text-sm font-semibold">
              <Loader2 className="w-4 h-4 animate-spin text-[#F7A21B] shrink-0" />
              <span>Hệ thống tự động kích hoạt sau khi nhận tiền</span>
            </div>

            {/* Nút chọn lại gói */}
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4A4A4A] underline underline-offset-4 hover:text-[#1A8CFF] transition-colors pt-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Chọn lại gói khác
            </Link>
          </div>

          {/* CỘT PHẢI: Thông tin gói & Chuyển khoản (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Plan Summary Card Banner */}
            <div className="relative overflow-hidden flex items-start justify-between gap-5 flex-wrap p-7 md:p-8 rounded-[24px] bg-gradient-to-br from-[#2A97FF] to-[#1A6FE0] text-white shadow-[0_20px_44px_rgba(26,111,224,0.3)]">
              {/* Decorative circle & dot matrix */}
              <span
                aria-hidden="true"
                className="absolute -right-10 -bottom-14 w-44 h-44 rounded-full bg-[#FFD84D] opacity-80 pointer-events-none"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.14)_1.4px,transparent_1.6px)] [background-size:24px_24px] pointer-events-none"
              />

              <div className="relative flex flex-col gap-2 items-start min-w-0 flex-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white tracking-wide">
                  <Crown className="w-3.5 h-3.5 fill-[#FFD84D] text-[#FFD84D]" />
                  {selectedPlan.badge}
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  Nâng cấp VIP HANDY
                </h1>
                <p className="text-xs md:text-sm text-[#E3ECF8] font-medium">
                  Mở khóa toàn bộ từ vựng &amp; chủ đề thủ ngữ cao cấp
                </p>
              </div>

              <div className="relative flex flex-col items-end gap-0.5 shrink-0">
                <span className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  {selectedPlan.priceDisplay}
                </span>
                <span className="text-xs text-[#E3ECF8] font-medium">
                  / {selectedPlan.duration}
                </span>
              </div>
            </div>

            {/* Thông tin chuyển khoản chi tiết */}
            <div className="flex flex-col gap-4 p-6 sm:p-8 rounded-[24px] bg-white shadow-[0_20px_48px_rgba(20,30,60,0.08)] border border-[#EBF1FA]">
              <h2 className="flex items-center gap-2.5 text-lg font-bold text-[#1E1E1E] mb-1">
                <span className="w-8 h-8 rounded-xl bg-[#EAF4FF] text-[#1A8CFF] flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </span>
                <span>Thông tin chuyển khoản</span>
              </h2>

              {/* Ngân hàng */}
              <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-[#F7FAFF] border border-[#E6ECF5]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-[#6B6B6B] font-semibold">Ngân hàng</span>
                  <span className="text-base font-bold text-[#1E1E1E]">{bankName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bankName, 'bank')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#BFDDFF] bg-white hover:bg-[#F4F9FF] text-xs font-bold text-[#1A8CFF] transition-all cursor-pointer"
                >
                  {copiedField === 'bank' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#17A673]" />
                      <span className="text-[#17A673]">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>

              {/* Số tài khoản */}
              <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-[#F7FAFF] border border-[#E6ECF5]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-[#6B6B6B] font-semibold">Số tài khoản</span>
                  <span className="text-lg sm:text-xl font-black text-[#1A8CFF] tracking-wider font-mono">
                    {bankAccount}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bankAccount, 'acc')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#BFDDFF] bg-white hover:bg-[#F4F9FF] text-xs font-bold text-[#1A8CFF] transition-all cursor-pointer"
                >
                  {copiedField === 'acc' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#17A673]" />
                      <span className="text-[#17A673]">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>

              {/* Chủ tài khoản */}
              <div className="flex flex-col gap-0.5 p-4 rounded-2xl bg-[#F7FAFF] border border-[#E6ECF5]">
                <span className="text-xs text-[#6B6B6B] font-semibold">Chủ tài khoản</span>
                <span className="text-base font-bold text-[#1E1E1E] uppercase">
                  {bankOwner}
                </span>
              </div>

              {/* Số tiền */}
              <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-[#F7FAFF] border border-[#E6ECF5]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-[#6B6B6B] font-semibold">Số tiền</span>
                  <span className="text-base sm:text-lg font-bold text-[#1E1E1E]">
                    {selectedPlan.amountDisplay}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(selectedPlan.price.toString(), 'amount')
                  }
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#BFDDFF] bg-white hover:bg-[#F4F9FF] text-xs font-bold text-[#1A8CFF] transition-all cursor-pointer"
                >
                  {copiedField === 'amount' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#17A673]" />
                      <span className="text-[#17A673]">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>

              {/* NỘI DUNG CHUYỂN KHOẢN (BẮT BUỘC CHÍNH XÁC) */}
              <div className="flex flex-col gap-3 p-5 rounded-[18px] bg-[#FFF5F7] border-2 border-[#F9C4D1]">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-xs font-bold tracking-wider text-[#B0173C] uppercase">
                    Nội dung chuyển khoản (Bắt buộc chính xác):
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(transferContent, 'content')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#B0173C] to-[#F0436A] hover:opacity-95 text-white text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    {copiedField === 'content' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã chép mã</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép mã</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#F9C4D1] font-mono text-base sm:text-lg font-black text-[#C8284F] break-all select-all">
                  {transferContent}
                </div>

                <div className="flex items-start gap-2 text-xs sm:text-sm text-[#B0173C] leading-relaxed">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#F0436A]" />
                  <span>
                    Vui lòng giữ nguyên nội dung trên để hệ thống tự động kích hoạt VIP trong 10-30 giây.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
          <Loader2 className="w-10 h-10 text-[#1A8CFF] animate-spin mb-4" />
          <p className="text-[#4A4A4A] font-bold">Đang tải trang thanh toán VIP...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
