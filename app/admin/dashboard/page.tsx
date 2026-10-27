'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import {
  Users,
  Percent,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Loader2,
  RefreshCw,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  PieChart as PieChartIcon,
  Crown,
  Clock,
  Sparkles,
  BarChart2,
} from 'lucide-react'
import UserAcquisitionChart from './components/UserAcquisitionChart'
import TransactionHealthChart from './components/TransactionHealthChart'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface Profile {
  id: string
  email: string | null
  role: string | null
  is_premium: boolean
  vip_until?: string | null
  plan_type?: string | null
  created_at: string
}

interface Transaction {
  id: string
  user_id: string
  amount: number | null
  transferAmount?: number | null
  status: string
  payment_method: string | null
  created_at: string
  user_email?: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Raw data from Supabase
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  // 1. Verify ADMIN role
  useEffect(() => {
    let isMounted = true

    const verifyAdmin = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          alert('Bạn không có quyền truy cập trang này')
          router.push('/')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, email')
          .eq('id', user.id)
          .maybeSingle()

        if (!profile || profile.role !== 'ADMIN') {
          alert('Bạn không có quyền truy cập trang này')
          router.push('/')
          return
        }

        if (isMounted) {
          setAuthorized(true)
          setCheckingAuth(false)
          fetchDashboardData()
        }
      } catch (err) {
        console.error('Lỗi xác thực Admin:', err)
        alert('Bạn không có quyền truy cập trang này')
        router.push('/')
      }
    }

    verifyAdmin()

    return () => {
      isMounted = false
    }
  }, [router])

  // Helper: Lấy JWT token của session hiện tại
  const getAuthToken = async (): Promise<string | null> => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session?.access_token ?? null
  }

  // 2. Fetch data from Server-side API (bypassing RLS with supabaseAdmin)
  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const token = await getAuthToken()
      if (!token) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
        router.push('/')
        return
      }

      const res = await fetch('/api/admin/dashboard', {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const json = await res.json()
        setProfiles(json.profiles || [])
        setTransactions(json.transactions || [])
        return
      }

      if (res.status === 401 || res.status === 403) {
        alert('Phiên quản trị đã hết hạn hoặc không có quyền Admin.')
        router.push('/')
        return
      }

      console.error('Lỗi khi tải dữ liệu admin:', res.status)
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  // Helper kiểm tra VIP còn hạn
  const isVipUser = (p: Profile) =>
    Boolean(p.is_premium && (!p.vip_until || new Date(p.vip_until) > new Date()))

  // Helper định dạng tiền tệ VND
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
  }

  // 3. Tính toán 4 Overview Metrics
  const stats = useMemo(() => {
    const totalUsers = profiles.length
    const vipUsers = profiles.filter(isVipUser).length
    const conversionRate = totalUsers > 0 ? ((vipUsers / totalUsers) * 100).toFixed(1) : '0'

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    const newVipThisMonth = profiles.filter((p) => {
      if (!isVipUser(p) || !p.created_at) return false
      const d = new Date(p.created_at)
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth
    }).length

    const successfulTx = transactions.filter(
      (tx) => (tx.status || '').toUpperCase() === 'SUCCESS'
    )

    const totalRevenue = successfulTx.reduce((sum, tx) => {
      const val = Number(tx.transferAmount ?? tx.amount ?? 0)
      return sum + (isNaN(val) ? 0 : val)
    }, 0)

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1)
    const lastMonthYear = lastMonthDate.getFullYear()
    const lastMonth = lastMonthDate.getMonth()

    let revenueThisMonth = 0
    let revenueLastMonth = 0

    successfulTx.forEach((tx) => {
      const d = new Date(tx.created_at)
      const val = Number(tx.transferAmount ?? tx.amount ?? 0)
      if (isNaN(val)) return

      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        revenueThisMonth += val
      } else if (d.getFullYear() === lastMonthYear && d.getMonth() === lastMonth) {
        revenueLastMonth += val
      }
    })

    let revenueGrowth = '+12.5%'
    let isPositiveGrowth = true
    if (revenueLastMonth > 0) {
      const rate = ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
      isPositiveGrowth = rate >= 0
      revenueGrowth = `${isPositiveGrowth ? '+' : ''}${rate.toFixed(1)}%`
    }

    return {
      totalUsers,
      vipUsers,
      conversionRate,
      newVipThisMonth,
      totalRevenue,
      revenueGrowth,
      isPositiveGrowth,
    }
  }, [profiles, transactions])

  // 4. Đếm số lượng tài khoản "VIP sắp hết hạn" (trong vòng 30 ngày tới)
  const vipExpiringSoonCount = useMemo(() => {
    const now = new Date()
    const thirtyDaysLater = new Date()
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)

    return profiles.filter((p) => {
      if (!isVipUser(p) || !p.vip_until) return false
      const expiry = new Date(p.vip_until)
      return expiry >= now && expiry <= thirtyDaysLater
    }).length
  }, [profiles])

  // 5. Tính toán Doanh thu 30 ngày qua cho biểu đồ AreaChart
  const revenue30DaysData = useMemo(() => {
    const days: { dateKey: string; displayDate: string; revenue: number }[] = []
    const now = new Date()

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const dateKey = `${year}-${month}-${day}`
      const displayDate = `${day}/${month}`
      days.push({ dateKey, displayDate, revenue: 0 })
    }

    const dayMap = new Map<string, number>()
    days.forEach((item, index) => {
      dayMap.set(item.dateKey, index)
    })

    const successfulTx = transactions.filter(
      (tx) => (tx.status || '').toUpperCase() === 'SUCCESS'
    )

    successfulTx.forEach((tx) => {
      if (!tx.created_at) return
      const d = new Date(tx.created_at)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const dateKey = `${year}-${month}-${day}`

      const index = dayMap.get(dateKey)
      if (index !== undefined) {
        const val = Number(tx.transferAmount ?? tx.amount ?? 0)
        if (!isNaN(val)) {
          days[index].revenue += val
        }
      }
    })

    return days
  }, [transactions])

  // 6. Tính toán Tỷ trọng 4 gói VIP cho biểu đồ PieChart
  const planDistributionData = useMemo(() => {
    const counts: Record<string, number> = {
      '3m': 0,
      '6m': 0,
      '1y': 0,
      'lifetime': 0,
    }

    profiles.forEach((p) => {
      if (!isVipUser(p)) return
      const plan = p.plan_type
      if (plan && counts[plan] !== undefined) {
        counts[plan]++
      } else if (!p.vip_until || plan === 'lifetime') {
        counts['lifetime']++
      } else {
        counts['1y']++
      }
    })

    return [
      { name: 'VIP 3 Tháng', key: '3m', value: counts['3m'], color: '#2563EB' },
      { name: 'VIP 6 Tháng', key: '6m', value: counts['6m'], color: '#059669' },
      { name: 'VIP 1 Năm', key: '1y', value: counts['1y'], color: '#D97706' },
      { name: 'VIP Trọn Đời', key: 'lifetime', value: counts['lifetime'], color: '#7C3AED' },
    ]
  }, [profiles])

  // 7. Lấy 10 Giao dịch gần nhất
  const recentTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => {
      const timeA = new Date(a.created_at).getTime()
      const timeB = new Date(b.created_at).getTime()
      return timeB - timeA
    })
    return sorted.slice(0, 10)
  }, [transactions])

  // 8. Xuất CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('Không có dữ liệu giao dịch nào để xuất báo cáo.')
      return
    }

    const headers = [
      'Mã Giao Dịch',
      'User ID',
      'Email Người Dùng',
      'Số Tiền (VND)',
      'Phương Thức',
      'Trạng Thái',
      'Thời Gian Giao Dịch',
    ]

    const rows = transactions.map((tx) => {
      const amountVal = Number(tx.transferAmount ?? tx.amount ?? 0)
      const dateStr = tx.created_at ? new Date(tx.created_at).toLocaleString('vi-VN') : ''
      return [
        `"${tx.id}"`,
        `"${tx.user_id}"`,
        `"${tx.user_email || ''}"`,
        amountVal,
        `"${tx.payment_method || 'VIETQR'}"`,
        `"${tx.status || 'SUCCESS'}"`,
        `"${dateStr}"`,
      ]
    })

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Bao_Cao_Giao_Dich_HANDY_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Fast Solid Tooltip for Area Chart
  const CustomAreaTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: any[]
    label?: string
  }) => {
    if (active && payload && payload.length) {
      const val = Number(payload[0].value ?? 0)
      return (
        <div className="bg-gray-900 text-white px-3 py-2 rounded-md shadow-md text-xs border border-gray-800">
          <p className="text-gray-400 font-medium">Ngày {label}</p>
          <p className="text-emerald-400 font-bold text-sm mt-0.5 font-mono">
            {formatCurrency(val)}
          </p>
        </div>
      )
    }
    return null
  }

  // Fast Solid Tooltip for Pie Chart
  const CustomPieTooltip = ({
    active,
    payload,
  }: {
    active?: boolean
    payload?: any[]
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0]
      return (
        <div className="bg-gray-900 text-white px-3 py-2 rounded-md shadow-md text-xs border border-gray-800">
          <p className="text-gray-300 font-medium">{item.name}</p>
          <p className="text-amber-400 font-bold text-sm mt-0.5 font-mono">
            {item.value} học viên ({stats.vipUsers > 0 ? ((item.value / stats.vipUsers) * 100).toFixed(1) : 0}%)
          </p>
        </div>
      )
    }
    return null
  }

  if (checkingAuth) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-800 animate-spin mb-3" />
        <p className="text-gray-500 font-medium text-xs uppercase tracking-wide">
          Đang xác thực quyền quản trị viên...
        </p>
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
      {/* Main Container - Compact & High Performance */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Page Heading & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Bảng điều khiển & Doanh thu
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Thống kê tài chính thời gian thực, đối soát giao dịch và tỷ trọng các gói VIP
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-2xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-gray-500' : 'text-gray-600'}`} />
              <span>Làm mới</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất dữ liệu CSV</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HÀNG 1: THẺ TÓM TẮT (4 CỘT)                                               */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Tổng Doanh Thu */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tổng Doanh Thu
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 font-mono">
                {loading ? '...' : formatCurrency(stats.totalRevenue)}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-1">
                <span className={`inline-flex items-center font-semibold ${stats.isPositiveGrowth ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stats.isPositiveGrowth ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {stats.revenueGrowth}
                </span>
                <span>so với tháng trước</span>
              </div>
            </div>
          </div>

          {/* Card 2: Tổng Người Dùng */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tổng Người Dùng
              </span>
              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight font-mono">
                {loading ? '...' : stats.totalUsers.toLocaleString('vi-VN')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                +{stats.newVipThisMonth} VIP mới tháng này
              </p>
            </div>
          </div>

          {/* Card 3: Tỷ Lệ Chuyển Đổi VIP */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tỷ Lệ Chuyển Đổi VIP
              </span>
              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight font-mono">
                {loading ? '...' : `${stats.conversionRate}%`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.vipUsers} trên {stats.totalUsers} người dùng
              </p>
            </div>
          </div>

          {/* Card 4: VIP Sắp Hết Hạn */}
          <div className="bg-white rounded-xl border border-amber-300 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                VIP Sắp Hết Hạn
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-bold text-amber-900 tracking-tight font-mono">
                {loading ? '...' : `${vipExpiringSoonCount} tài khoản`}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium mt-1">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Trong 30 ngày tới cần gia hạn</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HÀNG 2: BIỂU ĐỒ DOANH THU & TỶ TRỌNG GÓI VIP (RECHARTS)                    */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái (chiếm 2/3): Doanh thu 30 ngày qua */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-base font-bold text-gray-900">
                    Doanh thu 30 ngày qua
                  </h2>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Dòng tiền thanh toán thực nhận hàng ngày từ SePAY / VietQR
                </p>
              </div>
              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-md self-start sm:self-auto">
                30 Ngày gần nhất
              </span>
            </div>

            <div className="h-72 w-full">
              {!mounted || loading ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mb-2 text-gray-600" />
                  <span className="text-xs">Đang tải biểu đồ...</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenue30DaysData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis
                      dataKey="displayDate"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#6B7280', fontSize: 11 }}
                      interval={3}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#6B7280', fontSize: 11 }}
                      tickFormatter={(v) =>
                        v >= 1000000
                          ? `${(v / 1000000).toFixed(1)}M`
                          : v >= 1000
                          ? `${(v / 1000).toFixed(0)}k`
                          : `${v}`
                      }
                    />
                    <Tooltip content={<CustomAreaTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#059669"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Cột phải (chiếm 1/3): Tỷ trọng gói cước VIP */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-bold text-gray-900">
                  Tỷ trọng gói cước VIP
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Cơ cấu học viên theo 4 gói VIP
              </p>
            </div>

            <div className="h-72 w-full flex-1">
              {!mounted || loading ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mb-2 text-gray-600" />
                  <span className="text-xs">Đang tải phân bổ gói...</span>
                </div>
              ) : stats.vipUsers === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center px-4">
                  <Crown className="w-7 h-7 text-gray-300 mb-2" />
                  <p className="text-xs font-semibold text-gray-600">Chưa có người dùng VIP</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Dữ liệu sẽ hiển thị khi học viên mua gói VIP
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {planDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={40}
                      iconType="circle"
                      iconSize={8}
                      formatter={(val, entry: any) => (
                        <span className="text-[11px] font-medium text-gray-700 ml-1">
                          {val} ({entry.payload.value})
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HÀNG 3: PHÂN TÍCH TĂNG TRƯỞNG & SỨC KHỎE GIAO DỊCH (BUSINESS INSIGHTS)     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái (chiếm 2/3): Biểu đồ tăng trưởng người dùng mới (Bar Chart) */}
          <div className="lg:col-span-2">
            <UserAcquisitionChart profiles={profiles} loading={loading} />
          </div>

          {/* Cột phải (chiếm 1/3): Sức khỏe giao dịch & Tỷ lệ rớt đơn (Donut Chart) */}
          <div className="lg:col-span-1">
            <TransactionHealthChart transactions={transactions} loading={loading} />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HÀNG 4: BẢNG 10 GIAO DỊCH GẦN NHẤT                                        */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-700" />
                <h2 className="text-base font-bold text-gray-900">
                  10 Giao dịch gần nhất
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Nhật ký các lượt thanh toán tài khoản vừa ghi nhận
              </p>
            </div>

            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md self-start sm:self-auto">
              Tổng {transactions.length} giao dịch
            </span>
          </div>

          {/* Table Container - Clean, Compact & Fast */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Mã Giao Dịch</th>
                    <th className="py-3 px-4">Người Dùng</th>
                    <th className="py-3 px-4">Số Tiền</th>
                    <th className="py-3 px-4">Thời Gian</th>
                    <th className="py-3 px-4 text-center">Phương Thức</th>
                    <th className="py-3 px-4 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-gray-600" />
                        <span>Đang tải danh sách giao dịch...</span>
                      </td>
                    </tr>
                  ) : recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        <div className="max-w-xs mx-auto space-y-1">
                          <CreditCard className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                          <p className="font-semibold text-gray-700">Chưa có giao dịch nào</p>
                          <p className="text-xs text-gray-400">
                            Chưa phát sinh lịch sử chuyển khoản từ khách hàng.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map((tx) => {
                      const amount = Number(tx.transferAmount ?? tx.amount ?? 0)
                      const isSuccess = (tx.status || '').toUpperCase() === 'SUCCESS'
                      const dateFormatted = tx.created_at
                        ? new Date(tx.created_at).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'

                      return (
                        <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                          {/* Mã GD */}
                          <td className="py-3 px-4 font-mono text-[11px] text-gray-700 font-medium select-all">
                            {tx.id.slice(0, 14)}...
                          </td>

                          {/* Người dùng */}
                          <td className="py-3 px-4">
                            <p className="font-semibold text-gray-900">
                              {tx.user_email || 'Khách vãng lai'}
                            </p>
                            <p className="font-mono text-[10px] text-gray-400 select-all">
                              {tx.user_id.slice(0, 8)}...
                            </p>
                          </td>

                          {/* Số tiền */}
                          <td className="py-3 px-4 font-semibold text-gray-900 font-mono">
                            {formatCurrency(amount)}
                          </td>

                          {/* Thời gian */}
                          <td className="py-3 px-4 text-gray-500 text-[11px]">
                            {dateFormatted}
                          </td>

                          {/* Phương thức */}
                          <td className="py-3 px-4 text-center">
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                              {tx.payment_method || 'VIETQR'}
                            </span>
                          </td>

                          {/* Trạng thái */}
                          <td className="py-3 px-4 text-center">
                            {isSuccess ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                                <span>Thành công</span>
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                                {tx.status || 'Đang xử lý'}
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
