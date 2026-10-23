'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import {
  Crown,
  Check,
  Loader2,
  ArrowLeft,
  Sparkles,
  PartyPopper,
  Copy,
  AlertTriangle,
  QrCode,
} from 'lucide-react'

interface Plan {
  id: string          // '3m' | '6m' | '1y' | 'lifetime'
  label: string
  duration: string
  price: number       // in VND
  priceDisplay: string
  savings?: string
  highlight?: boolean
  features: string[]
}

const PLANS: Plan[] = [
  {
    id: '3m',
    label: 'Gói 3 Tháng',
    duration: '3 tháng',
    price: 199000,
    priceDisplay: '199.000đ',
    features: [
      'Mở khóa toàn bộ chủ đề',
      'Luyện tập không giới hạn',
      'Truy cập video HD',
    ],
  },
  {
    id: '6m',
    label: 'Gói 6 Tháng',
    duration: '6 tháng',
    price: 349000,
    priceDisplay: '349.000đ',
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
    label: 'Gói 1 Năm',
    duration: '1 năm',
    price: 599000,
    priceDisplay: '599.000đ',
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
    label: 'Gói Vĩnh Viễn',
    duration: 'Trọn đời',
    price: 999000,
    priceDisplay: '999.000đ',
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

export default function CheckoutPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlanId, setSelectedPlanId] = useState<string>('1y')
  const [showQr, setShowQr] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [pollCount, setPollCount] = useState(0)

  // Thông tin ngân hàng từ biến môi trường
  const bankName = process.env.NEXT_PUBLIC_BANK_NAME || 'TPBank'
  const bankAccount = process.env.NEXT_PUBLIC_BANK_ACCOUNT || '0369455756'
  const bankOwner = process.env.NEXT_PUBLIC_BANK_OWNER || 'NGUYEN VU DUC'

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
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
        const { data: { user: authUser } } = await supabase.auth.getUser()
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
    return () => { isMounted = false }
  }, [router, checkIsVipValid])

  // Polling: sau khi hiển thị QR, poll mỗi 5 giây tối đa 60 giây (12 lần)
  useEffect(() => {
    if (!showQr || isSuccess || !user) return
    if (pollCount >= 12) return  // đã poll đủ 60 giây

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
        setPollCount(prev => prev + 1)
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [showQr, isSuccess, user, pollCount, checkIsVipValid])

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
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-600 font-bold">Đang tải trang thanh toán VIP...</p>
      </div>
    )
  }

  // Giao diện khi đã là VIP
  if (isSuccess) {
    const isLifetime = !profile?.vip_until
    const expiryStr = profile?.vip_until
      ? new Date(profile.vip_until).toLocaleDateString('vi-VN', {
          day: '2-digit', month: '2-digit', year: 'numeric'
        })
      : null
    const planLabel = PLANS.find(p => p.id === profile?.plan_type)?.label || 'VIP'

    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border-2 border-emerald-300 p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-emerald-400 via-teal-400 to-green-500 absolute top-0 left-0 right-0" />

          <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <PartyPopper className="w-10 h-10" />
          </div>

          <span className="inline-block text-xs font-black text-emerald-800 bg-emerald-100 px-4 py-1.5 rounded-full uppercase tracking-wider mb-3">
            Đã kích hoạt thành công
          </span>

          <h1 className="text-3xl font-black text-gray-800 mb-3">
            🎉 Bạn đã là Thành viên VIP!
          </h1>

          <div className="flex flex-col items-center gap-1 mb-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
              <Crown className="w-4 h-4" /> {planLabel}
            </span>
            {!isLifetime && expiryStr && (
              <span className="text-xs text-gray-500 font-bold mt-1">
                Có hiệu lực đến: <span className="text-orange-600">{expiryStr}</span>
              </span>
            )}
            {isLifetime && (
              <span className="text-xs text-gray-500 font-bold mt-1">Hiệu lực trọn đời</span>
            )}
          </div>

          <p className="text-gray-600 text-sm mb-8 leading-relaxed mt-4">
            Cảm ơn bạn đã nâng cấp gói VIP HANDY. Giờ đây bạn có thể học không giới hạn toàn bộ các bài giảng thủ ngữ trên hệ thống!
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-base shadow-lg shadow-amber-200 transition active:scale-95 w-full sm:w-auto"
          >
            <Sparkles className="w-5 h-5" />
            Khám phá các bài học ngay
          </Link>
        </div>
      </div>
    )
  }

  const selectedPlan = PLANS.find(p => p.id === selectedPlanId) ?? PLANS[2]
  const planCodeMap: Record<string, string> = {
    '3m': 'HD3M',
    '6m': 'HD6M',
    '1y': 'HD1Y',
    'lifetime': 'HDLIFETIME',
  }
  const planCode = planCodeMap[selectedPlan.id] || `HD${selectedPlan.id.toUpperCase()}`
  const transferContent = `${planCode} ${user?.id || ''}`.trim()
  const qrUrl = `https://qr.sepay.vn/img?acc=${bankAccount}&bank=${bankName}&amount=${selectedPlan.price}&des=${encodeURIComponent(transferContent)}`

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      {/* Nút quay lại */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-orange-500 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại trang chủ
      </Link>

      {/* Tiêu đề */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-xs font-extrabold mb-3">
          <Crown className="w-4 h-4 text-orange-500 fill-orange-400" />
          NÂNG CẤP TÀI KHOẢN VIP
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-800">Chọn Gói Học Phù Hợp</h1>
        <p className="text-gray-500 text-sm mt-2">Mở khóa toàn bộ bài giảng thủ ngữ chất lượng cao</p>
      </div>

      {/* === BƯỚC 1: Chọn gói === */}
      {!showQr && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id
              return (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`
                    relative flex flex-col text-left p-5 rounded-3xl border-2 transition-all duration-200
                    cursor-pointer active:scale-95
                    ${isSelected
                      ? 'border-orange-400 bg-orange-50 shadow-xl shadow-orange-100'
                      : 'border-amber-200 bg-white hover:border-amber-400 hover:shadow-md'
                    }
                    ${plan.highlight && !isSelected ? 'ring-2 ring-amber-300 ring-offset-1' : ''}
                  `}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black bg-gradient-to-r from-orange-400 to-amber-400 text-white px-3 py-0.5 rounded-full whitespace-nowrap shadow">
                      Phổ biến nhất
                    </span>
                  )}

                  <div className="mb-3">
                    <span className="text-sm font-black text-gray-800">{plan.label}</span>
                    {plan.savings && (
                      <span className="block text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full w-fit mt-1">
                        {plan.savings}
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-2xl font-black text-orange-600">{plan.priceDisplay}</span>
                    <span className="text-xs text-gray-500 font-medium ml-1">/ {plan.duration}</span>
                  </div>

                  <ul className="space-y-1.5 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-1.5 text-xs text-gray-700 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {isSelected && (
                    <div className="mt-4 pt-3 border-t border-orange-200 flex items-center gap-1.5 text-xs font-black text-orange-600">
                      <Check className="w-4 h-4" /> Đang chọn
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Nút tiến hành thanh toán */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowQr(true)}
              className="flex items-center gap-2.5 px-10 py-4 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-base shadow-lg shadow-amber-200 transition active:scale-95 cursor-pointer"
            >
              <QrCode className="w-5 h-5" />
              Tiến hành thanh toán — {selectedPlan.priceDisplay}
            </button>
          </div>
        </div>
      )}

      {/* === BƯỚC 2: Hiển thị QR và thông tin chuyển khoản === */}
      {showQr && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI: Mã QR */}
          <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-amber-300 p-6 md:p-8 shadow-xl text-center flex flex-col items-center">
            <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-3.5 py-1.5 rounded-full text-xs font-extrabold mb-4">
              <QrCode className="w-4 h-4" />
              Quét mã VietQR chuyển khoản
            </div>

            {/* Khung ảnh QR */}
            <div className="relative w-64 h-64 bg-amber-50 rounded-2xl p-2 border-2 border-amber-200 shadow-inner flex items-center justify-center overflow-hidden mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="Mã VietQR thanh toán SePAY"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            <p className="text-xs text-gray-500 max-w-xs mb-4">
              Mở App ngân hàng bất kỳ (Vietcombank, MB, Techcombank, TPBank, MoMo...) và quét mã QR trên để chuyển khoản tự động.
            </p>

            {/* Trạng thái chờ kích hoạt */}
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 text-orange-700 rounded-2xl text-xs font-bold w-full">
              <Loader2 className="w-4 h-4 animate-spin text-orange-500 shrink-0" />
              <span>Hệ thống tự động kích hoạt sau khi nhận tiền</span>
            </div>

            {/* Nút chọn lại gói */}
            <button
              onClick={() => { setShowQr(false); setPollCount(0) }}
              className="mt-4 text-xs font-bold text-gray-500 hover:text-orange-500 transition underline cursor-pointer"
            >
              ← Chọn lại gói khác
            </button>
          </div>

          {/* CỘT PHẢI: Chi tiết chuyển khoản */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card gói đã chọn */}
            <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black mb-3">
                    <Crown className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                    {selectedPlan.label.toUpperCase()}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black mb-1">
                    Nâng Cấp VIP HANDY
                  </h2>
                  <p className="text-amber-100 text-xs md:text-sm">
                    Mở khóa toàn bộ từ vựng &amp; chủ đề thủ ngữ cao cấp
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl md:text-3xl font-black">{selectedPlan.priceDisplay}</span>
                  <span className="block text-xs text-amber-200 font-medium">{selectedPlan.duration}</span>
                </div>
              </div>
            </div>

            {/* Thông tin chuyển khoản */}
            <div className="bg-white rounded-3xl border-2 border-amber-200 p-6 md:p-7 shadow-sm space-y-4">
              <h3 className="font-extrabold text-gray-800 text-base flex items-center gap-2">
                <span>💳</span> Thông tin chuyển khoản
              </h3>

              {/* Ngân hàng */}
              <div className="flex items-center justify-between p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
                <div>
                  <span className="text-xs text-gray-500 font-bold block">Ngân hàng</span>
                  <span className="text-sm font-black text-gray-800">{bankName}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(bankName, 'bank')}
                  className="p-2 rounded-xl hover:bg-amber-100 text-amber-800 transition active:scale-95 cursor-pointer"
                  title="Sao chép"
                >
                  {copiedField === 'bank' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Số tài khoản */}
              <div className="flex items-center justify-between p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
                <div>
                  <span className="text-xs text-gray-500 font-bold block">Số tài khoản</span>
                  <span className="text-base font-black text-orange-600 tracking-wider">{bankAccount}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(bankAccount, 'acc')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-extrabold text-amber-800 hover:bg-amber-100 transition active:scale-95 cursor-pointer"
                >
                  {copiedField === 'acc' ? (
                    <><Check className="w-3.5 h-3.5 text-emerald-600" /> Đã chép</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Sao chép</>
                  )}
                </button>
              </div>

              {/* Chủ tài khoản */}
              <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
                <span className="text-xs text-gray-500 font-bold block">Chủ tài khoản</span>
                <span className="text-sm font-black text-gray-800 uppercase">{bankOwner}</span>
              </div>

              {/* Số tiền */}
              <div className="flex items-center justify-between p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
                <div>
                  <span className="text-xs text-gray-500 font-bold block">Số tiền</span>
                  <span className="text-base font-black text-gray-800">{selectedPlan.price.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedPlan.price.toString(), 'amount')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-extrabold text-amber-800 hover:bg-amber-100 transition active:scale-95 cursor-pointer"
                >
                  {copiedField === 'amount' ? (
                    <><Check className="w-3.5 h-3.5 text-emerald-600" /> Đã chép</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Sao chép</>
                  )}
                </button>
              </div>

              {/* NỘI DUNG CHUYỂN KHOẢN (RẤT QUAN TRỌNG) */}
              <div className="p-4 bg-orange-50 rounded-2xl border-2 border-orange-300 relative">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-black text-orange-900 uppercase tracking-wide">
                    Nội dung chuyển khoản (Bắt buộc chính xác):
                  </span>
                  <button
                    onClick={() => copyToClipboard(transferContent, 'content')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold transition shadow-sm active:scale-95 shrink-0 cursor-pointer"
                  >
                    {copiedField === 'content' ? (
                      <><Check className="w-3.5 h-3.5" /> Đã chép mã</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Sao chép mã</>
                    )}
                  </button>
                </div>

                <div className="font-mono font-black text-base md:text-lg text-orange-600 bg-white px-3 py-2 rounded-xl border border-orange-200 select-all break-all mt-1">
                  {transferContent}
                </div>

                <p className="text-xs text-orange-800 mt-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  Vui lòng giữ nguyên nội dung trên để hệ thống tự động kích hoạt VIP trong 10-30 giây.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
