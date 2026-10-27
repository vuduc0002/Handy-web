'use client'

import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { UserPlus, TrendingUp, Loader2, Users } from 'lucide-react'

export interface UserDayData {
  dateKey: string
  displayDate: string
  shortDate: string
  count: number
}

interface UserAcquisitionChartProps {
  profiles: Array<{ created_at: string }>
  loading?: boolean
}

export default function UserAcquisitionChart({
  profiles,
  loading = false,
}: UserAcquisitionChartProps) {
  // Gom nhóm tài khoản mới tạo theo từng ngày trong 7 ngày gần nhất
  const chartData: UserDayData[] = useMemo(() => {
    const days: UserDayData[] = []
    const now = new Date()
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

    // 7 ngày gần nhất từ 6 ngày trước đến hôm nay
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const dateKey = `${year}-${month}-${day}`
      const dayOfWeek = dayNames[d.getDay()]
      const shortDate = `${day}/${month}`
      const displayDate = i === 0 ? `Hôm nay (${shortDate})` : `${dayOfWeek} (${shortDate})`

      days.push({
        dateKey,
        displayDate,
        shortDate,
        count: 0,
      })
    }

    const dayMap = new Map<string, number>()
    days.forEach((item, index) => {
      dayMap.set(item.dateKey, index)
    })

    // Duyệt qua profiles và gom nhóm theo ngày tạo
    profiles.forEach((p) => {
      if (!p.created_at) return
      const d = new Date(p.created_at)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const dateKey = `${year}-${month}-${day}`

      const idx = dayMap.get(dateKey)
      if (idx !== undefined) {
        days[idx].count += 1
      }
    })

    return days
  }, [profiles])

  // Tổng số user mới trong 7 ngày
  const totalNewUsers7Days = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.count, 0)
  }, [chartData])

  // Custom Tooltip phong cách Admin Handy
  const CustomBarTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: any[]
    label?: string
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as UserDayData
      return (
        <div className="bg-gray-900 text-white px-3.5 py-2.5 rounded-lg shadow-xl text-xs border border-gray-800 space-y-1">
          <p className="text-gray-400 font-semibold border-b border-gray-800 pb-1">
            {item.displayDate}
          </p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-300">Tài khoản mới:</span>
            <span className="font-mono font-bold text-[#7FAAFF] text-sm">
              +{item.count} user
            </span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header Thẻ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1E4FA8]">
              <UserPlus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-gray-900">
              Tăng trưởng người dùng mới
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Số tài khoản đăng ký mới theo từng ngày trong 7 ngày qua từ bảng profiles
          </p>
        </div>

        {/* Badge thống kê nhanh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[#1E4FA8] text-xs font-semibold">
            <Users className="w-3.5 h-3.5" />
            <span>+{totalNewUsers7Days} user (7 ngày)</span>
          </span>
        </div>
      </div>

      {/* Vùng vẽ biểu đồ Bar Chart */}
      <div className="h-64 sm:h-72 w-full my-2">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mb-2 text-gray-600" />
            <span className="text-xs">Đang tải biểu đồ tăng trưởng...</span>
          </div>
        ) : profiles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center px-4">
            <Users className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-xs font-semibold text-gray-600">Chưa có người dùng nào</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Dữ liệu sẽ xuất hiện khi có học viên đăng ký tài khoản
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis
                dataKey="shortDate"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 600 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6B7280', fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar
                dataKey="count"
                fill="#1E4FA8"
                radius={[6, 6, 0, 0]}
                barSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer ý nghĩa kinh doanh */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
        <span className="flex items-center gap-1 text-gray-600">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sức hút tự nhiên của nền tảng theo thời gian</span>
        </span>
        <span className="font-semibold text-gray-700">
          Cập nhật theo bảng profiles
        </span>
      </div>
    </div>
  )
}
