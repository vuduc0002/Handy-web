'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import SupportLayout from '@/components/support/SupportLayout'
import { supabase } from '@/lib/supabaseClient'
import { toast } from '@/lib/toast'

const TOPICS = [
  'Tài khoản',
  'Nội dung học',
  'Thanh toán',
  'Flashcard & sách',
  'Khác',
]

export default function SupportPage() {
  const [topic, setTopic] = useState('Tài khoản')
  const [form, setForm] = useState({
    name: '',
    contact: '',
    message: '',
  })
  const [errors, setErrors] = useState<{
    name?: string
    contact?: string
    message?: string
  }>({})
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs: typeof errors = {}
    if (!form.name.trim()) {
      errs.name = 'Vui lòng nhập họ và tên.'
    }
    const c = form.contact.trim()
    if (!c) {
      errs.contact = 'Vui lòng nhập email hoặc số điện thoại.'
    } else {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)
      const isPhone = /^0\d{9,10}$/.test(c.replace(/\s/g, ''))
      if (!isEmail && !isPhone) {
        errs.contact = 'Email hoặc số điện thoại chưa đúng định dạng.'
      }
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      errs.message = 'Vui lòng mô tả vấn đề (ít nhất 10 ký tự).'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const { error } = await supabase.from('support_requests').insert([
        {
          full_name: form.name.trim(),
          contact_info: form.contact.trim(),
          category: topic,
          content: form.message.trim(),
          status: 'pending',
        },
      ])

      if (error) {
        console.error('Lỗi khi gửi yêu cầu hỗ trợ:', error)
        toast.error('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại!')
        return
      }

      toast.success('Gửi yêu cầu hỗ trợ thành công!')
      setSent(true)
      setForm({ name: '', contact: '', message: '' })
      setErrors({})
    } catch (err) {
      console.error('Lỗi khi gửi form hỗ trợ:', err)
      toast.error('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại!')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSent(false)
    setForm({ name: '', contact: '', message: '' })
    setErrors({})
    setTopic('Tài khoản')
  }

  return (
    <SupportLayout currentTab="support">
      <div className="flex flex-col gap-7 max-w-[780px]">
        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Email */}
          <div className="flex flex-col gap-2.5 p-5 rounded-[18px] bg-[#F4F9FF] border border-[#E0EFFF]">
            <span className="w-10 h-10 rounded-xl bg-[#1A8CFF] text-white flex items-center justify-center shrink-0 shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 6L2 7" />
              </svg>
            </span>
            <span className="text-[15px] font-bold text-[#1E1E1E]">Email hỗ trợ</span>
            <a
              href="mailto:support@handy.vn"
              className="text-[14px] text-[#4F86C6] hover:text-[#0B6FE0] transition-colors break-words font-medium"
            >
              support@handy.vn
            </a>
          </div>

          {/* Fanpage */}
          <div className="flex flex-col gap-2.5 p-5 rounded-[18px] bg-[#FFF5F7] border border-[#FFE0E7]">
            <span className="w-10 h-10 rounded-xl bg-[#F0436A] text-white flex items-center justify-center shrink-0 shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-1.6 19.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 12 2z" />
              </svg>
            </span>
            <span className="text-[15px] font-bold text-[#1E1E1E]">Fanpage cộng đồng</span>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-[#F0436A] hover:underline font-medium"
            >
              fb.com/handy.vietnam
            </a>
          </div>

          {/* Response time */}
          <div className="flex flex-col gap-2.5 p-5 rounded-[18px] bg-[#F3FAF7] border border-[#D5EFE3]">
            <span className="w-10 h-10 rounded-xl bg-[#17A673] text-white flex items-center justify-center shrink-0 shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </span>
            <span className="text-[15px] font-bold text-[#1E1E1E]">Thời gian phản hồi</span>
            <span className="text-[14px] text-[#4A4A4A]">
              8:00 - 22:00 (Hàng ngày)
            </span>
          </div>
        </div>

        {/* Form or Sent Banner */}
        {sent ? (
          <div className="flex flex-col items-center gap-3 p-10 px-6 rounded-3xl bg-[#F3FAF7] border border-[#D5EFE3] text-center">
            <div className="w-[72px] h-[72px] rounded-[22px] bg-gradient-to-br from-[#6FDDB0] to-[#17A673] text-white flex items-center justify-center shadow-md rotate-[-4deg]">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 5 5L20 7" />
              </svg>
            </div>
            <h2 className="text-[22px] font-bold text-[#1E1E1E] mt-2">
              Đã gửi yêu cầu hỗ trợ!
            </h2>
            <p className="text-[15px] leading-relaxed text-[#4A4A4A] max-w-[420px]">
              Cảm ơn bạn đã liên hệ. Đội ngũ chuyên môn HANDY sẽ kiểm tra thông tin và phản hồi qua email hoặc số điện thoại bạn đã cung cấp sớm nhất.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-2 px-6 py-2.5 rounded-full border-[1.5px] border-[#17A673] bg-white text-[#17A673] hover:bg-[#17A673] hover:text-white font-semibold text-sm transition-all"
            >
              Gửi yêu cầu khác
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5 p-6 sm:p-8 rounded-3xl border border-[#ECEEF3] bg-white shadow-[0_14px_36px_rgba(20,30,60,0.05)]"
          >
            <h2 className="text-[22px] font-bold text-[#1E1E1E]">
              Gửi yêu cầu <span className="text-[#1A8CFF]">hỗ trợ</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[14px] font-semibold text-[#1E1E1E]">
                  Họ và tên
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value })
                    if (errors.name) setErrors({ ...errors, name: undefined })
                  }}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className={`text-[15px] text-[#1E1E1E] p-3 px-4 rounded-xl border-[1.5px] bg-white outline-none transition focus:border-[#1A8CFF] focus:ring-4 focus:ring-[#1A8CFF]/10 ${
                    errors.name ? 'border-[#F0436A]' : 'border-[#E3E7EE]'
                  }`}
                />
                {errors.name && (
                  <span className="text-xs text-[#F0436A] font-medium">
                    {errors.name}
                  </span>
                )}
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[14px] font-semibold text-[#1E1E1E]">
                  Email hoặc số điện thoại
                </span>
                <input
                  type="text"
                  value={form.contact}
                  onChange={(e) => {
                    setForm({ ...form, contact: e.target.value })
                    if (errors.contact) setErrors({ ...errors, contact: undefined })
                  }}
                  placeholder="vidu@gmail.com hoặc 0912..."
                  className={`text-[15px] text-[#1E1E1E] p-3 px-4 rounded-xl border-[1.5px] bg-white outline-none transition focus:border-[#1A8CFF] focus:ring-4 focus:ring-[#1A8CFF]/10 ${
                    errors.contact ? 'border-[#F0436A]' : 'border-[#E3E7EE]'
                  }`}
                />
                {errors.contact && (
                  <span className="text-xs text-[#F0436A] font-medium">
                    {errors.contact}
                  </span>
                )}
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[14px] font-semibold text-[#1E1E1E]">
                Bạn cần hỗ trợ về chủ đề gì?
              </span>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((tp) => {
                  const selected = topic === tp
                  return (
                    <button
                      key={tp}
                      type="button"
                      onClick={() => setTopic(tp)}
                      className={`px-4 py-2 rounded-full border-[1.5px] text-sm font-semibold transition-all ${
                        selected
                          ? 'border-[#1A8CFF] bg-[#1A8CFF] text-white shadow-sm'
                          : 'border-[#E3E7EE] bg-white text-[#1E1E1E] hover:border-[#1A8CFF]/60 hover:text-[#1A8CFF]'
                      }`}
                    >
                      {tp}
                    </button>
                  )
                })}
              </div>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[14px] font-semibold text-[#1E1E1E]">
                Nội dung chi tiết
              </span>
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => {
                  setForm({ ...form, message: e.target.value })
                  if (errors.message) setErrors({ ...errors, message: undefined })
                }}
                placeholder="Mô tả cụ thể vấn đề hoặc câu hỏi bạn cần giải đáp..."
                className={`text-[15px] leading-relaxed text-[#1E1E1E] p-3.5 px-4 rounded-xl border-[1.5px] bg-white outline-none resize-y transition focus:border-[#1A8CFF] focus:ring-4 focus:ring-[#1A8CFF]/10 ${
                  errors.message ? 'border-[#F0436A]' : 'border-[#E3E7EE]'
                }`}
              />
              {errors.message && (
                <span className="text-xs text-[#F0436A] font-medium">
                  {errors.message}
                </span>
              )}
            </label>

            <button
              type="submit"
              disabled={loading}
              className="self-start flex items-center gap-2 px-7 py-3 rounded-full text-white text-[15px] font-semibold bg-[#1A8CFF] hover:bg-[#0B6FE0] transition-colors shadow-md disabled:opacity-60"
            >
              <span>{loading ? 'Đang gửi...' : 'Gửi yêu cầu'}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </form>
        )}

        {/* Hint to FAQ */}
        <p className="text-[14.5px] leading-relaxed text-[#4A4A4A] mt-1">
          Bạn cũng có thể xem nhanh mục{' '}
          <Link href="/#faq" className="text-[#1A8CFF] font-semibold hover:underline">
            Câu hỏi thường gặp
          </Link>{' '}
          để tìm câu trả lời ngay lập tức.
        </p>
      </div>
    </SupportLayout>
  )
}
