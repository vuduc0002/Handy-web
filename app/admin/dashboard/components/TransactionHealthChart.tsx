'use client'

import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  RefreshCcw,
} from 'lucide-react'

interface TransactionItem {
  id: string
  status: string
  amount?: number | null
}

interface TransactionHealthChartProps {
  transactions: TransactionItem[]
  loading?: boolean
}

export default function TransactionHealthChart({
  transactions,
  loading = false,
}: TransactionHealthChartProps) {
  // Phân tích trạng thái đơn hàng & tính tỷ lệ rớt đơn
  const { chartData, dropOffRate, totalCount, pendingCount, successCount, cancelledCount } =
    useMemo(() => {
      let success = 0
      let pending = 0
      let cancelled = 0

      transactions.forEach((tx) => {
        const s = (tx.status || '').toUpperCase().trim()
        if (s === 'SUCCESS' || s === 'PAID' || s === 'COMPLETED') {
          success++
        } else if (s === 'CANCELLED' || s === 'CANCELED' || s === 'FAILED' || s === 'EXPIRED') {
          cancelled++
        } else {
          // Mặc định hoặc trạng thái PENDING, WAITING
          pending++
        }
      })

      const total = transactions.length
      const dropOff = pending + cancelled
      const rate = total > 0 ? ((dropOff / total) * 100).toFixed(1) : '0'

      const data = [
        {
          name: 'Thành công (Success)',
          key: 'success',
          value: success,
          color: '#059669', // Xanh lá
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
        },
        {
          name: 'Chờ thanh toán (Pending)',
          key: 'pending',
          value: pending,
          color: '#D97706', // Vàng / Cam
          icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
        },
        {
          name: 'Đã hủy / Lỗi (Cancelled)',
          key: 'cancelled',
          value: cancelled,
          color: '#DC2626', // Đỏ
          icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
        },
      ]

      return {
        chartData: data,
        dropOffRate: rate,
        totalCount: total,
        pendingCount: pending,
        successCount: success,
        cancelledCount: cancelled,
      }
    }, [transactions])

  // Custom Tooltip cho Donut Chart
  const CustomPieTooltip = ({
    active,
    payload,
  }: {
    active?: boolean
    payload?: any[]
  }) => {
    if (active && payload && payload.length) {
      const entry = payload[0]
      const percent =
        totalCount > 0 ? ((entry.value / totalCount) * 100).toFixed(1) : '0'
      return (
        <div className="bg-gray-900 text-white px-3.5 py-2 rounded-lg shadow-xl text-xs border border-gray-800 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.payload.color }}
            />
            <span>{entry.name}</span>
          </div>
          <div className="flex justify-between gap-4 font-mono text-gray-300">
            <span>Số đơn:</span>
            <span className="font-bold text-white">{entry.value} đơn</span>
          </div>
          <div className="flex justify-between gap-4 font-mono text-gray-300">
            <span>Tỷ trọng:</span>
            <span className="font-bold text-amber-400">{percent}%</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header Thẻ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-gray-900">
              Sức khỏe giao dịch & Rớt đơn
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Tỷ lệ đơn thanh toán thành công và rớt đơn từ bảng transactions
          </p>
        </div>

        {/* Text nổi bật: Tỷ lệ rớt đơn */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 self-start sm:self-auto text-xs font-semibold">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Tỷ lệ rớt đơn:</span>
          <span className="font-mono font-extrabold text-amber-700 bg-white px-1.5 py-0.5 rounded shadow-2xs">
            {dropOffRate}%
          </span>
        </div>
      </div>

      {/* Vùng vẽ Donut Chart */}
      <div className="h-64 sm:h-72 w-full relative flex items-center justify-center my-1">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mb-2 text-gray-600" />
            <span className="text-xs">Đang tải sức khỏe giao dịch...</span>
          </div>
        ) : totalCount === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center px-4">
            <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-xs font-semibold text-gray-600">Chưa có giao dịch nào</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Dữ liệu sẽ hiển thị khi có học viên tạo đơn thanh toán
            </p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={3}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={44}
                  iconType="circle"
                  iconSize={8}
                  formatter={(val, entry: any) => {
                    const count = entry?.payload?.value || 0
                    const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
                    return (
                      <span className="text-[11px] font-medium text-gray-700 ml-1">
                        {val} ({count} - {pct}%)
                      </span>
                    )
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Số liệu Text ở tâm Donut */}
            <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl sm:text-2xl font-black text-gray-900 font-mono tracking-tight">
                {dropOffRate}%
              </span>
              <span className="text-[9px] uppercase font-bold text-amber-700 tracking-wider">
                Rớt đơn
              </span>
            </div>
          </>
        )}
      </div>

      {/* Footer ý nghĩa kinh doanh */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
        <span className="flex items-center gap-1 text-gray-600">
          <RefreshCcw className="w-3.5 h-3.5 text-amber-600" />
          <span>{pendingCount} khách chưa quét mã chuyển khoản</span>
        </span>
        <span className="font-semibold text-emerald-700">
          Phục vụ Marketing Retargeting
        </span>
      </div>
    </div>
  )
}
