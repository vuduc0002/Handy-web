'use client'

import React from 'react'
import {
  TrendingDown,
  TrendingUp,
  Target,
  Crown,
  Filter,
  UserCheck,
  ArrowDownRight,
  ArrowUpRight,
  HelpCircle,
} from 'lucide-react'

export interface KpiMetric {
  id: string
  title: string
  shortName: string
  value: string
  subValue: string
  changePercent: string
  isPositive: boolean // Trong SaaS: CAC giảm là tốt (positive), Churn giảm là tốt (positive)
  changeText: string
  benchmarkText: string
  badgeText: string
  badgeColor: string
  icon: React.ReactNode
  iconBg: string
  accentColor: string
}

export default function MarketingKpiCards() {
  const kpis: KpiMetric[] = [
    {
      id: 'cac',
      title: 'Chi phí thu hút 1 khách',
      shortName: 'CAC',
      value: '45.000 ₫',
      subValue: 'Customer Acquisition Cost',
      changePercent: '-12.5%',
      isPositive: true, // Chi phí giảm là tốt
      changeText: 'so với tháng trước',
      benchmarkText: 'Mục tiêu đề ra: < 50.000 ₫',
      badgeText: 'Tối ưu Organic',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <Target className="w-5 h-5 text-[#1E4FA8]" />,
      iconBg: 'bg-blue-50 border-blue-100',
      accentColor: 'border-l-4 border-l-[#1E4FA8]',
    },
    {
      id: 'ltv',
      title: 'Giá trị trọn đời khách',
      shortName: 'LTV',
      value: '499.000 ₫',
      subValue: 'Customer Lifetime Value',
      changePercent: '+18.4%',
      isPositive: true,
      changeText: 'so với quý trước',
      benchmarkText: 'Tỷ lệ LTV/CAC: 11.1x (Chuẩn > 3x)',
      badgeText: 'Doanh thu bền vững',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <Crown className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-50 border-amber-100',
      accentColor: 'border-l-4 border-l-amber-500',
    },
    {
      id: 'cr',
      title: 'Tỷ lệ chuyển đổi tổng',
      shortName: 'CR',
      value: '8.5%',
      subValue: 'Overall Conversion Rate',
      changePercent: '+2.1%',
      isPositive: true,
      changeText: 'so với mục tiêu',
      benchmarkText: 'Visitor → Học viên trả phí VIP',
      badgeText: 'Vượt Benchmark (3-5%)',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      icon: <Filter className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50 border-emerald-100',
      accentColor: 'border-l-4 border-l-emerald-500',
    },
    {
      id: 'churn',
      title: 'Tỷ lệ rời bỏ dịch vụ',
      shortName: 'Churn Rate',
      value: '4.2%',
      subValue: 'Monthly User Churn Rate',
      changePercent: '-0.8%',
      isPositive: true, // Rời bỏ giảm là tốt
      changeText: 'duy trì mức thấp',
      benchmarkText: 'Tỷ lệ giữ chân học viên: 95.8%',
      badgeText: 'Gắn kết học tập cao',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: <UserCheck className="w-5 h-5 text-purple-600" />,
      iconBg: 'bg-purple-50 border-purple-100',
      accentColor: 'border-l-4 border-l-purple-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((item) => (
        <div
          key={item.id}
          className={`bg-white rounded-xl border border-gray-200/90 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${item.accentColor}`}
        >
          {/* Card Top: Icon, Label & Short Name */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${item.iconBg}`}
                >
                  {item.icon}
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    {item.shortName}
                  </span>
                  <h3 className="text-xs font-semibold text-gray-700 leading-tight">
                    {item.title}
                  </h3>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
              >
                {item.badgeText}
              </span>
            </div>

            {/* Card Body: Big Value */}
            <div className="mt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-mono">
                  {item.value}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                {item.subValue}
              </p>
            </div>
          </div>

          {/* Card Bottom: Trend & Benchmark */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 font-semibold">
                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[11px] font-bold ${
                    item.isPositive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {item.isPositive ? (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  )}
                  {item.changePercent}
                </span>
                <span className="text-gray-500 text-[11px] font-normal">
                  {item.changeText}
                </span>
              </div>
            </div>

            <p className="text-[11px] font-semibold text-gray-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <span>{item.benchmarkText}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
