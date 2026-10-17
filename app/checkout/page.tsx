'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import {
  Crown,
  CheckCircle2,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  PartyPopper
} from 'lucide-react'

const VIP_AMOUNT = 199000

export default function CheckoutPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // Thông tin ngân hàng từ biến môi trường
  const bankName = process.env.NEXT_PUBLIC_BANK_NAME || 'TPBank'
  const bankAccount = process.env.NEXT_PUBLIC_BANK_ACCOUNT || '0369455756'
  const bankOwner = process.env.NEXT_PUBLIC_BANK_OWNER || 'NGUYEN VU DUC'

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2500)
  }

  // Lấy thông tin user hiện tại
  useEffect(() => {
    let isMounted = true

    const checkAuthAndProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.replace('/login')
          return
        }

        if (isMounted) setUser(user)

        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, email, is_premium, role')
          .eq('id', user.id)
          .maybeSingle()

        if (isMounted) {
          setProfile(profileData)
          if (profileData?.is_premium) {
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
  }, [router])

  // Lắng nghe thay đổi trạng thái VIP theo thời gian thực (Polling hoặc Realtime)
  useEffect(() => {
    if (!user || isSuccess) return

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .maybeSingle()

      if (data?.is_premium) {
        setIsSuccess(true)
        clearInterval(interval)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [user, isSuccess])

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-600 font-bold">Đang tải trang thanh toán VIP...</p>
      </div>
    )
  }

  // Nội dung chuyển khoản chuẩn SePAY webhook format: HANDY_[USER_ID]
  const transferContent = `HANDY_${user?.id || ''}`

  // Tạo URL ảnh VietQR tự động qua SePAY QR Service
  const qrUrl = `https://qr.sepay.vn/img?acc=${bankAccount}&bank=${bankName}&amount=${VIP_AMOUNT}&des=${transferContent}`

  // Giao diện khi đã nâng cấp VIP thành công
  if (isSuccess) {
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

          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CỘT TRÁI: Mã QR chuyển khoản ngân hàng VietQR */}
        <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-amber-300 p-6 md:p-8 shadow-xl text-center flex flex-col items-center">
          <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-3.5 py-1.5 rounded-full text-xs font-extrabold mb-4">
            <QrCode className="w-4 h-4" />
            Quét mã VietQR chuyển khoản
          </div>

          {/* Khung ảnh QR */}
          <div className="relative w-64 h-64 bg-amber-50 rounded-2xl p-2 border-2 border-amber-200 shadow-inner flex items-center justify-center overflow-hidden mb-4">
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
        </div>

        {/* CỘT PHẢI: Thông tin chi tiết & Gói dịch vụ */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card Quyền lợi VIP */}
          <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black mb-3">
                  <Crown className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                  GÓI HỌC TRỌN ĐỜI
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-1">
                  Nâng Cấp VIP HANDY
                </h2>
                <p className="text-amber-100 text-xs md:text-sm">
                  Mở khóa toàn bộ từ vựng & chủ đề thủ ngữ cao cấp
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl md:text-3xl font-black">199.000đ</span>
                <span className="block text-xs text-amber-200 font-medium">Thanh toán 1 lần</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-6 pt-5 border-t border-white/20 text-xs font-bold text-amber-50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-yellow-300 shrink-0" />
                <span>Xem không giới hạn mọi chủ đề</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-yellow-300 shrink-0" />
                <span>Cập nhật bài học mới miễn phí</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-yellow-300 shrink-0" />
                <span>Tự động kích hoạt ngay lập tức</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-yellow-300 shrink-0" />
                <span>Hỗ trợ xuyên suốt quá trình học</span>
              </div>
            </div>
          </div>

          {/* Chi tiết chuyển khoản thủ công (Nếu không quét mã QR) */}
          <div className="bg-white rounded-3xl border-2 border-amber-200 p-6 md:p-7 shadow-sm space-y-4">
            <h3 className="font-extrabold text-gray-800 text-base flex items-center gap-2">
              <span>💳</span> Hoặc chuyển khoản thủ công
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
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Đã chép
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Sao chép
                  </>
                )}
              </button>
            </div>

            {/* Chủ tài khoản */}
            <div className="flex items-center justify-between p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
              <div>
                <span className="text-xs text-gray-500 font-bold block">Chủ tài khoản</span>
                <span className="text-sm font-black text-gray-800 uppercase">{bankOwner}</span>
              </div>
            </div>

            {/* Số tiền */}
            <div className="flex items-center justify-between p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
              <div>
                <span className="text-xs text-gray-500 font-bold block">Số tiền</span>
                <span className="text-base font-black text-gray-800">199.000 VNĐ</span>
              </div>
              <button
                onClick={() => copyToClipboard('199000', 'amount')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-extrabold text-amber-800 hover:bg-amber-100 transition active:scale-95 cursor-pointer"
              >
                {copiedField === 'amount' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Đã chép
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Sao chép
                  </>
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
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Đã chép mã
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Sao chép mã
                    </>
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
    </div>
  )
}
