'use client'

import React, { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts'
import {
  Filter,
  ArrowDown,
  AlertTriangle,
  CheckCircle2,
  Users,
  UserPlus,
  BookOpen,
  Crown,
  TrendingDown,
  Sparkles,
} from 'lucide-react'

interface FunnelStep {
  step: string
  name: string
  shortName: string
  users: number
  conversionFromPrev: number | null // % chuyển đổi từ bước trước
  dropOffRate: number | null // % rớt lại
  dropOffUsers: number | null // Số lượng rớt lại
  overallConversion: number // % so với bước đầu 10,000
  color: string
  icon: React.ReactNode
  optimizationAction: string
}

export default function ConversionFunnelChart() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const funnelData: FunnelStep[] = [
    {
      step: 'Bước 1',
      name: 'Truy cập Landing Page',
      shortName: 'Truy cập',
      users: 10000,
      conversionFromPrev: null,
      dropOffRate: 75.0, // 75% rớt lại trước khi sang Đăng ký
      dropOffUsers: 7500,
      overallConversion: 100,
      color: '#1E4FA8', // Handy Brand Blue
      icon: <Users className="w-4 h-4 text-white" />,
      optimizationAction: 'Tăng tốc tải trang < 1.5s, Hero Banner rõ giá trị cốt lõi',
    },
    {
      step: 'Bước 2',
      name: 'Đăng ký tài khoản',
      shortName: 'Đăng ký',
      users: 2500,
      conversionFromPrev: 25.0,
      dropOffRate: 60.0, // 60% rớt lại trước khi vào Học thử
      dropOffUsers: 1500,
      overallConversion: 25.0,
      color: '#2563EB', // Blue 600
      icon: <UserPlus className="w-4 h-4 text-white" />,
      optimizationAction: 'Đơn giản hóa form đăng ký, hỗ trợ 1-Click Google Login',
    },
    {
      step: 'Bước 3',
      name: 'Học thử từ vựng (Trial)',
      shortName: 'Học thử',
      users: 1000,
      conversionFromPrev: 40.0,
      dropOffRate: 80.0, // 80% rớt lại trước khi Mua VIP
      dropOffUsers: 800,
      overallConversion: 10.0,
      color: '#F97316', // Handy Orange
      icon: <BookOpen className="w-4 h-4 text-white" />,
      optimizationAction: 'Flashcard tương tác trực quan, mở khóa bài 1 miễn phí',
    },
    {
      step: 'Bước 4',
      name: 'Mua gói VIP EdTech',
      shortName: 'Mua VIP',
      users: 200,
      conversionFromPrev: 20.0,
      dropOffRate: null,
      dropOffUsers: null,
      overallConversion: 2.0,
      color: '#10B981', // Handy Mint Green
      icon: <Crown className="w-4 h-4 text-white" />,
      optimizationAction: 'Thanh toán VietQR SePAY tự động duyệt trong 3 giây',
    },
  ]

  // Custom Tooltip cho Bar Chart
  const CustomFunnelTooltip = ({
    active,
    payload,
  }: {
    active?: boolean
    payload?: any[]
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as FunnelStep
      return (
        <div className="bg-gray-900 text-white p-3.5 rounded-xl shadow-xl border border-gray-800 text-xs min-w-[220px]">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-2">
            <span className="font-bold text-[#7FAAFF]">{data.step}: {data.name}</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-400">Số lượng:</span>
              <span className="font-mono font-bold text-white text-sm">
                {data.users.toLocaleString('vi-VN')} người
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">% So với đầu phễu:</span>
              <span className="font-mono font-bold text-emerald-400">
                {data.overallConversion}%
              </span>
            </div>
            {data.conversionFromPrev !== null && (
              <div className="flex justify-between">
                <span className="text-gray-400">CR từ bước trước:</span>
                <span className="font-mono font-semibold text-blue-300">
                  {data.conversionFromPrev}%
                </span>
              </div>
            )}
            {data.dropOffRate !== null && (
              <div className="flex justify-between text-rose-300 pt-1 border-t border-gray-800">
                <span>Rớt lại (Drop-off):</span>
                <span className="font-mono font-bold">
                  {data.dropOffRate}% (-{data.dropOffUsers?.toLocaleString('vi-VN')})
                </span>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      {/* Header Phễu Chuyển Đổi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1E4FA8]">
              <Filter className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              Biểu Đồ Phễu Chuyển Đổi (Conversion Funnel)
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Theo dõi hành trình người dùng 4 chặng từ Khách vãng lai đến Học viên VIP trả phí
          </p>
        </div>

        {/* Tổng quan Tỷ lệ chuyển đổi toàn phễu */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-gray-600 font-medium">End-to-End CR:</span>
          <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
            2.0% (200 / 10,000)
          </span>
        </div>
      </div>

      {/* Main Grid: Bar Chart + Drop-off Steps Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Cột trái (chiếm 7 phần): Biểu đồ thanh ngang Recharts */}
        <div className="lg:col-span-7 h-72 sm:h-80 w-full">
          {!mounted ? (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              Đang tải biểu đồ phễu...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={funnelData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis
                  type="number"
                  domain={[0, 10000]}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(val) => `${val.toLocaleString('vi-VN')}`}
                />
                <YAxis
                  dataKey="shortName"
                  type="category"
                  tick={{ fontSize: 12, fill: '#1E293B', fontWeight: 600 }}
                  width={75}
                />
                <Tooltip content={<CustomFunnelTooltip />} />
                <Bar dataKey="users" radius={[0, 8, 8, 0]} barSize={28}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Cột phải (chiếm 5 phần): Chi tiết từng tầng phễu & % Rớt lại (Drop-off) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Chi tiết từng giai đoạn</span>
            <span>% Rớt lại (Drop-off)</span>
          </div>

          {funnelData.map((item, idx) => {
            const isLast = idx === funnelData.length - 1
            return (
              <div key={item.step} className="relative">
                <div className="p-3 rounded-lg border border-gray-150 bg-gray-50/70 hover:bg-gray-50 transition flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 shadow-2xs"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 truncate">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-gray-500 font-medium">
                        {item.users.toLocaleString('vi-VN')} lượt ({item.overallConversion}%)
                      </span>
                    </div>
                  </div>

                  {/* Giá trị số lượng hoặc Tỷ lệ rớt */}
                  <div className="text-right shrink-0">
                    {item.dropOffRate !== null ? (
                      <div className="inline-flex flex-col items-end">
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold">
                          <TrendingDown className="w-3 h-3" />
                          -{item.dropOffRate}%
                        </span>
                        <span className="text-[10px] text-gray-400 mt-0.5">
                          Mất {item.dropOffUsers?.toLocaleString('vi-VN')} người
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Chuyển đổi VIP
                      </span>
                    )}
                  </div>
                </div>

                {/* Mũi tên chuyển tiếp giữa các tầng */}
                {!isLast && (
                  <div className="flex items-center justify-center my-0.5 text-gray-300">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer Ghi chú chiến lược tối ưu phễu cho Slide */}
      <div className="mt-5 pt-3.5 border-t border-gray-150 bg-blue-50/50 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 rounded-b-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-[#1E4FA8] font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Điểm rớt lớn nhất: <strong>Học thử → Mua VIP (80%)</strong>.</span>
        </div>
        <span className="text-gray-600 text-[11px]">
          Khuyến nghị MKT: Kích hoạt Flash Sale 24h & chính sách học thử VIP 3 ngày.
        </span>
      </div>
    </div>
  )
}
