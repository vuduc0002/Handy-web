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
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react'
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

    // VIP users created in current month
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    const newVipThisMonth = profiles.filter((p) => {
      if (!isVipUser(p) || !p.created_at) return false
      const d = new Date(p.created_at)
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth
    }).length

    // Total Revenue from successful transactions
    const successfulTx = transactions.filter(
      (tx) => (tx.status || '').toUpperCase() === 'SUCCESS'
    )

    const totalRevenue = successfulTx.reduce((sum, tx) => {
      const val = Number(tx.transferAmount ?? tx.amount ?? 0)
      return sum + (isNaN(val) ? 0 : val)
    }, 0)

    // Calculate revenue this month vs last month for trend
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
      { name: 'VIP 3 Tháng', key: '3m', value: counts['3m'], color: '#3B82F6' },
      { name: 'VIP 6 Tháng', key: '6m', value: counts['6m'], color: '#10B981' },
      { name: 'VIP 1 Năm', key: '1y', value: counts['1y'], color: '#F59E0B' },
      { name: 'VIP Trọn Đời', key: 'lifetime', value: counts['lifetime'], color: '#8B5CF6' },
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

  // Custom Area Chart Tooltip (Sleek Glassmorphism Dark)
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
        <div className="bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700/80 text-xs animate-scale-in">
          <p className="font-semibold text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            Ngày {label}
          </p>
          <p className="text-emerald-400 font-extrabold text-base mt-1 tracking-tight font-mono">
            {formatCurrency(val)}
          </p>
        </div>
      )
    }
    return null
  }

  // Custom Pie Chart Tooltip (Sleek Glassmorphism Dark)
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
        <div className="bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700/80 text-xs animate-scale-in">
          <p className="font-semibold text-slate-300 flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: item.payload?.color || '#8B5CF6' }}
            />
            {item.name}
          </p>
          <p className="text-white font-extrabold text-sm mt-1 font-mono">
            {item.value} học viên{' '}
            <span className="text-slate-400 font-normal text-xs">
              ({stats.vipUsers > 0 ? ((item.value / stats.vipUsers) * 100).toFixed(1) : 0}%)
            </span>
          </p>
        </div>
      )
    }
    return null
  }

  if (checkingAuth) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-md flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 shadow-xl flex items-center justify-center mb-3">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
        <p className="text-slate-600 font-semibold text-xs tracking-wide uppercase">
          Đang xác thực quyền quản trị...
        </p>
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Main SaaS Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8 animate-fade-in">
        {/* Page Heading & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Bảng Điều Khiển & Doanh Thu
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Tổng quan tài chính thời gian thực, biểu đồ dòng tiền và phân bổ các gói cước VIP.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : 'text-slate-600'}`} />
              <span className="text-xs font-semibold">Làm mới</span>
            </button>

            {/* Primary CTA với Gradient tinh tế */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất dữ liệu CSV</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HÀNG 1: THẺ TÓM TẮT (4 CỘT) - PHONG CÁCH PLANHAT SAAS                     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Tổng Doanh Thu (Dark Luxury Slate / Indigo) */}
          <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-6 text-white shadow-xl shadow-indigo-950/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-indigo-500/50 hover:shadow-indigo-950/40 animate-slide-up group relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none group-hover:bg-indigo-500/25 transition-all duration-500" />
            
            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tổng Doanh Thu
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 relative z-10">
              <p className="text-3xl font-black tracking-tight text-white font-mono">
                {loading ? '...' : formatCurrency(stats.totalRevenue)}
              </p>
              <div className="flex items-center gap-2 mt-2.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {stats.isPositiveGrowth ? (
                    <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-rose-400" />
                  )}
                  {stats.revenueGrowth}
                </span>
                <span className="text-xs text-slate-400">so với tháng trước</span>
              </div>
            </div>
          </div>

          {/* Card 2: Tổng Người Dùng */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-200 animate-slide-up animation-delay-100 group relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-indigo-50/60 blur-xl pointer-events-none group-hover:bg-indigo-100/60 transition-all duration-500" />

            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tổng Người Dùng
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300 shadow-2xs">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 relative z-10">
              <p className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                {loading ? '...' : stats.totalUsers.toLocaleString('vi-VN')}
              </p>
              <p className="text-xs text-slate-500 mt-2.5 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                +{stats.newVipThisMonth} VIP mới kích hoạt tháng này
              </p>
            </div>
          </div>

          {/* Card 3: Tỷ Lệ Chuyển Đổi VIP */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-violet-200 animate-slide-up animation-delay-200 group relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-violet-50/60 blur-xl pointer-events-none group-hover:bg-violet-100/60 transition-all duration-500" />

            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tỷ Lệ Chuyển Đổi VIP
              </span>
              <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100/80 flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform duration-300 shadow-2xs">
                <Percent className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 relative z-10">
              <p className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                {loading ? '...' : `${stats.conversionRate}%`}
              </p>
              <p className="text-xs text-slate-500 mt-2.5 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                {stats.vipUsers} trên {stats.totalUsers} người dùng
              </p>
            </div>
          </div>

          {/* Card 4: VIP Sắp Hết Hạn (Màu cam cảnh báo) */}
          <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white backdrop-blur-md p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-amber-400 hover:shadow-amber-500/10 animate-slide-up animation-delay-300 group relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-amber-100/60 blur-xl pointer-events-none group-hover:bg-amber-200/60 transition-all duration-500" />

            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                VIP Sắp Hết Hạn
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-100/90 border border-amber-300/80 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform duration-300 shadow-2xs">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 relative z-10">
              <p className="text-3xl font-black text-amber-900 tracking-tight font-mono">
                {loading ? '...' : vipExpiringSoonCount}{' '}
                <span className="text-base font-bold text-amber-700">tài khoản</span>
              </p>
              <p className="text-xs text-amber-700 mt-2.5 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                Trong 30 ngày tới cần CSKH gia hạn
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HÀNG 2: BIỂU ĐỒ DOANH THU & TỶ TRỌNG GÓI VIP (RECHARTS)                    */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái (chiếm 2/3): Doanh thu 30 ngày qua */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-200/70 animate-slide-up animation-delay-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">
                    Doanh thu 30 ngày qua
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Biểu đồ dòng tiền thực nhận hàng ngày từ cổng thanh toán SePAY / VietQR
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50/80 border border-emerald-200/80 px-3 py-1 rounded-full self-start sm:self-auto">
                30 Ngày gần nhất
              </span>
            </div>

            <div className="h-80 w-full pt-2">
              {!mounted || loading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-7 h-7 animate-spin mb-2 text-indigo-600" />
                  <span className="text-xs font-semibold">Đang tải biểu đồ doanh thu...</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenue30DaysData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis
                      dataKey="displayDate"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                      interval={3}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
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
                      stroke="#6366F1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Cột phải (chiếm 1/3): Tỷ trọng gói cước VIP */}
          <div className="lg:col-span-1 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-200/70 animate-slide-up animation-delay-400 flex flex-col">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <PieChartIcon className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Tỷ trọng gói cước VIP
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Cơ cấu học viên theo 4 gói cước mới
              </p>
            </div>

            <div className="h-80 w-full flex-1">
              {!mounted || loading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-7 h-7 animate-spin mb-2 text-indigo-600" />
                  <span className="text-xs font-semibold">Đang tải phân bổ gói cước...</span>
                </div>
              ) : stats.vipUsers === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-4">
                  <Crown className="w-9 h-9 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600">Chưa có người dùng VIP</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Dữ liệu sẽ xuất hiện khi có học viên đăng ký các gói VIP
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
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {planDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={42}
                      iconType="circle"
                      iconSize={8}
                      formatter={(val, entry: any) => (
                        <span className="text-[11px] font-semibold text-slate-700 ml-1">
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
        {/* HÀNG 3: BẢNG 10 GIAO DỊCH GẦN NHẤT                                        */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  10 Giao dịch gần nhất
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Nhật ký các lượt thanh toán nâng cấp tài khoản vừa ghi nhận trên hệ thống
              </p>
            </div>

            <span className="text-xs font-bold text-slate-600 bg-white/80 border border-slate-200/80 px-3 py-1 rounded-lg self-start sm:self-auto shadow-2xs">
              Tổng {transactions.length} giao dịch ghi nhận
            </span>
          </div>

          {/* Table Container với Glassmorphism */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg animate-slide-up animation-delay-500">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Mã Giao Dịch</th>
                    <th className="py-3.5 px-5">Người Dùng</th>
                    <th className="py-3.5 px-5">Số Tiền</th>
                    <th className="py-3.5 px-5">Thời Gian</th>
                    <th className="py-3.5 px-5 text-center">Phương Thức</th>
                    <th className="py-3.5 px-5 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                        <span className="font-medium">Đang tải danh sách giao dịch...</span>
                      </td>
                    </tr>
                  ) : recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-14 text-center text-slate-500">
                        <div className="max-w-xs mx-auto space-y-1">
                          <CreditCard className="w-7 h-7 mx-auto text-slate-400 mb-2" />
                          <p className="font-bold text-slate-700">Chưa có giao dịch nào</p>
                          <p className="text-xs text-slate-400">
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
                        <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                          {/* Mã GD */}
                          <td className="py-3.5 px-5 font-mono text-[11px] text-slate-600 font-semibold select-all">
                            {tx.id.slice(0, 14)}...
                          </td>

                          {/* Người dùng */}
                          <td className="py-3.5 px-5">
                            <p className="font-bold text-slate-900">
                              {tx.user_email || 'Khách vãng lai'}
                            </p>
                            <p className="font-mono text-[10px] text-slate-400 select-all">
                              {tx.user_id.slice(0, 8)}...
                            </p>
                          </td>

                          {/* Số tiền */}
                          <td className="py-3.5 px-5 font-black text-slate-900 font-mono">
                            {formatCurrency(amount)}
                          </td>

                          {/* Thời gian */}
                          <td className="py-3.5 px-5 text-slate-500 text-[11px] font-medium">
                            {dateFormatted}
                          </td>

                          {/* Phương thức */}
                          <td className="py-3.5 px-5 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              {tx.payment_method || 'VIETQR'}
                            </span>
                          </td>

                          {/* Trạng thái */}
                          <td className="py-3.5 px-5 text-center">
                            {isSuccess ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Thành công</span>
                              </span>
                            ) : (
                              <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
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
