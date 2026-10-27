'use client'

import React, { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import {
  PieChart as PieChartIcon,
  Search,
  Share2,
  Users2,
  Megaphone,
  CheckCircle,
  TrendingUp,
} from 'lucide-react'

interface ChannelData {
  name: string
  key: string
  percentage: number
  users: number
  cac: string
  color: string
  icon: React.ReactNode
  description: string
  quality: string
}

export default function TrafficChannelsChart() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const channels: ChannelData[] = [
    {
      name: 'SEO (Tìm kiếm tự nhiên)',
      key: 'seo',
      percentage: 40,
      users: 4000,
      cac: '0 ₫ (Bền vững)',
      color: '#1E4FA8', // Handy Blue
      icon: <Search className="w-3.5 h-3.5 text-white" />,
      description: 'Từ khóa "học ngôn ngữ ký hiệu", "từ điển ký hiệu"',
      quality: 'Rất cao (High Intent)',
    },
    {
      name: 'Social (TikTok, FB, Reels)',
      key: 'social',
      percentage: 35,
      users: 3500,
      cac: '25.000 ₫',
      color: '#F97316', // Handy Orange
      icon: <Share2 className="w-3.5 h-3.5 text-white" />,
      description: 'Video ngắn viral giáo dục trẻ khiếm thính',
      quality: 'Lan tỏa mạnh (Viral)',
    },
    {
      name: 'Cộng đồng & Referral',
      key: 'referral',
      percentage: 15,
      users: 1500,
      cac: '15.000 ₫',
      color: '#10B981', // Mint Green
      icon: <Users2 className="w-3.5 h-3.5 text-white" />,
      description: 'Hội phụ huynh trẻ khiếm thính & giáo viên',
      quality: 'Độ tin cậy tuyệt đối',
    },
    {
      name: 'Quảng cáo trả phí (Paid Ads)',
      key: 'ads',
      percentage: 10,
      users: 1000,
      cac: '95.000 ₫',
      color: '#8B5CF6', // Purple
      icon: <Megaphone className="w-3.5 h-3.5 text-white" />,
      description: 'Meta & Google Ads nhắm đối tượng phụ huynh 25-40 tuổi',
      quality: 'Chủ động tăng tốc',
    },
  ]

  const totalUsers = 10000

  // Custom Tooltip cho Donut Chart
  const CustomPieTooltip = ({
    active,
    payload,
  }: {
    active?: boolean
    payload?: any[]
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChannelData
      return (
        <div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl border border-gray-800 text-xs min-w-[200px]">
          <div className="flex items-center gap-2 pb-1.5 mb-1.5 border-b border-gray-800">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-bold text-gray-200">{data.name}</span>
          </div>
          <div className="space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-gray-400">Tỷ trọng:</span>
              <span className="font-bold text-amber-400">{data.percentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Lưu lượng:</span>
              <span className="font-bold text-white">
                {data.users.toLocaleString('vi-VN')} lượt
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Chi phí CAC:</span>
              <span className="font-bold text-emerald-400">{data.cac}</span>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316]">
              <PieChartIcon className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              Biểu Đồ Nguồn Khách Hàng (Traffic Channels)
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Cơ cấu nguồn truy cập và chi phí thu hút khách hàng (CAC) theo từng kênh
          </p>
        </div>

        <span className="text-xs font-bold text-[#1E4FA8] bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md self-start sm:self-auto">
          75% Kênh Không Trả Phí (Organic)
        </span>
      </div>

      {/* Main Content: Donut Chart + Details List */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Cột trái: Donut Chart với số tổng ở trung tâm */}
        <div className="md:col-span-5 relative h-64 sm:h-72 flex items-center justify-center">
          {!mounted ? (
            <div className="text-xs text-gray-400">Đang tải biểu đồ kênh...</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channels}
                    dataKey="percentage"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={98}
                    paddingAngle={3}
                  >
                    {channels.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Text ở tâm của Donut Chart */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl sm:text-2xl font-black text-gray-900 font-mono tracking-tight">
                  10.000
                </span>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Tổng Traffic
                </span>
              </div>
            </>
          )}
        </div>

        {/* Cột phải: Danh sách chi tiết 4 kênh */}
        <div className="md:col-span-7 space-y-2.5">
          {channels.map((item) => (
            <div
              key={item.key}
              className="p-2.5 sm:p-3 rounded-lg border border-gray-150 hover:border-gray-300 hover:bg-gray-50/80 transition flex items-center justify-between gap-3 text-xs"
            >
              {/* Channel Info */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 shadow-2xs"
                  style={{ backgroundColor: item.color }}
                >
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 truncate">
                      {item.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 truncate">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="text-right shrink-0">
                <div className="flex items-baseline justify-end gap-1.5">
                  <span
                    className="font-extrabold text-sm font-mono"
                    style={{ color: item.color }}
                  >
                    {item.percentage}%
                  </span>
                  <span className="text-gray-400 text-[11px] font-mono">
                    ({item.users.toLocaleString('vi-VN')})
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-gray-500 block mt-0.5">
                  CAC: <strong className="text-gray-700">{item.cac}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Ghi chú chiến lược cho Slide */}
      <div className="mt-4 pt-3 border-t border-gray-150 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1 text-[#1E4FA8] font-semibold">
          <TrendingUp className="w-3.5 h-3.5 text-[#1E4FA8]" />
          <span>Tỷ lệ LTV/CAC tối ưu nhất ở kênh SEO & Social (CAC ~ 20.000 ₫)</span>
        </span>
        <span className="text-[11px] text-gray-400 hidden sm:inline font-mono">
          Nguồn: Google Analytics & TikTok Ads Q3
        </span>
      </div>
    </div>
  )
}
