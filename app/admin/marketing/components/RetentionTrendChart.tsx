'use client'

import React, { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  UserCheck,
  UserPlus,
  Repeat,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react'

interface MonthlyRetentionData {
  month: string
  newUsers: number
  returningUsers: number
  totalActive: number
  retentionRate: number
}

export default function RetentionTrendChart() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const data: MonthlyRetentionData[] = [
    {
      month: 'Tháng 5',
      newUsers: 850,
      returningUsers: 420,
      totalActive: 1270,
      retentionRate: 49.4,
    },
    {
      month: 'Tháng 6',
      newUsers: 1200,
      returningUsers: 750,
      totalActive: 1950,
      retentionRate: 54.2,
    },
    {
      month: 'Tháng 7',
      newUsers: 1550,
      returningUsers: 1180,
      totalActive: 2730,
      retentionRate: 59.8,
    },
    {
      month: 'Tháng 8',
      newUsers: 1950,
      returningUsers: 1650,
      totalActive: 3600,
      retentionRate: 63.5,
    },
    {
      month: 'Tháng 9',
      newUsers: 2280,
      returningUsers: 2150,
      totalActive: 4430,
      retentionRate: 67.2,
    },
    {
      month: 'Tháng 10',
      newUsers: 2500,
      returningUsers: 2720,
      totalActive: 5220,
      retentionRate: 71.5,
    },
  ]

  // Custom Tooltip cho Line Chart
  const CustomLineTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: any[]
    label?: string
  }) => {
    if (active && payload && payload.length) {
      const monthData = payload[0].payload as MonthlyRetentionData
      return (
        <div className="bg-gray-900 text-white p-3.5 rounded-xl shadow-xl border border-gray-800 text-xs min-w-[220px]">
          <p className="font-bold text-[#7FAAFF] border-b border-gray-800 pb-1.5 mb-2">
            Báo cáo {label}
          </p>
          <div className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-[#7FAAFF]">
              <span className="flex items-center gap-1.5 font-sans">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E4FA8]" />
                Khách hàng mới:
              </span>
              <span className="font-bold text-sm">
                {monthData.newUsers.toLocaleString('vi-VN')}
              </span>
            </div>
            <div className="flex items-center justify-between text-emerald-400">
              <span className="flex items-center gap-1.5 font-sans">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                Khách quay lại:
              </span>
              <span className="font-bold text-sm">
                {monthData.returningUsers.toLocaleString('vi-VN')}
              </span>
            </div>
            <div className="pt-1.5 border-t border-gray-800 flex justify-between text-gray-300 font-sans">
              <span>Tổng người học tích cực:</span>
              <span className="font-mono font-bold text-white">
                {monthData.totalActive.toLocaleString('vi-VN')}
              </span>
            </div>
            <div className="flex justify-between text-amber-300 font-sans">
              <span>Tỷ lệ giữ chân (Retention):</span>
              <span className="font-mono font-bold">
                {monthData.retentionRate}%
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#10B981]">
              <Repeat className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              Biểu Đồ Tăng Trưởng & Giữ Chân (Retention Trend)
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            So sánh tốc độ thu hút khách hàng mới và tỷ lệ người học quay lại trong 6 tháng qua
          </p>
        </div>

        {/* Crossover Metric Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span className="text-emerald-800 font-medium">Retention T10:</span>
          <span className="font-mono font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded shadow-2xs">
            71.5% (Returning &gt; New)
          </span>
        </div>
      </div>

      {/* Line Chart */}
      <div className="h-72 sm:h-80 w-full mb-4">
        {!mounted ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-400">
            Đang tải biểu đồ xu hướng...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 15, right: 25, left: -5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickFormatter={(val) => `${val.toLocaleString('vi-VN')}`}
              />
              <Tooltip content={<CustomLineTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(val) => (
                  <span className="text-xs font-semibold text-gray-700 ml-1">
                    {val}
                  </span>
                )}
              />

              {/* Đường Khách hàng mới (Handy Blue) */}
              <Line
                name="Khách hàng mới"
                type="monotone"
                dataKey="newUsers"
                stroke="#1E4FA8"
                strokeWidth={3}
                dot={{ r: 4, fill: '#1E4FA8', strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: 6, fill: '#1E4FA8' }}
              />

              {/* Đường Khách hàng quay lại (Handy Mint Green) */}
              <Line
                name="Khách hàng quay lại"
                type="monotone"
                dataKey="returningUsers"
                stroke="#10B981"
                strokeWidth={3}
                strokeDasharray="0"
                dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: 6, fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 3 Thẻ thống kê tóm lược nhanh (Slide Insights) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-150">
        <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Tăng trưởng khách mới
            </span>
            <span className="text-base font-extrabold text-[#1E4FA8] font-mono">
              +194% (6 tháng)
            </span>
          </div>
          <UserPlus className="w-5 h-5 text-[#1E4FA8] opacity-80" />
        </div>

        <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Tăng trưởng giữ chân
            </span>
            <span className="text-base font-extrabold text-emerald-700 font-mono">
              +547% (6 tháng)
            </span>
          </div>
          <UserCheck className="w-5 h-5 text-emerald-600 opacity-80" />
        </div>

        <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Hiệu ứng mạng lưới (Moat)
            </span>
            <span className="text-base font-extrabold text-amber-700 font-mono">
              Product-Market Fit
            </span>
          </div>
          <ShieldCheck className="w-5 h-5 text-amber-600 opacity-80" />
        </div>
      </div>
    </div>
  )
}
