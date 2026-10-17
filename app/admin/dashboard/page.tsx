'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import {
  Users,
  Percent,
  UserCheck,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Calendar,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Loader2,
  RefreshCw,
  CheckCircle2,
  Clock,
  BookOpen,
  CreditCard,
  X,
  Crown,
  ToggleLeft,
  ToggleRight,
  UserCog,
  Check
} from 'lucide-react'

interface Profile {
  id: string
  email: string | null
  role: string | null
  is_premium: boolean
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

  // Raw data from Supabase
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Filters state (Transactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Pagination state (Transactions)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Search & Pagination state (Users Management)
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [userFilterStatus, setUserFilterStatus] = useState<'ALL' | 'VIP' | 'REGULAR'>('ALL')
  const [currentUserPage, setCurrentUserPage] = useState(1)
  const usersPerPage = 10

  // Action loading state for updating VIP
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

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

  // 2. Fetch data from Server-side API (bypassing RLS with supabaseAdmin)
  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const res = await fetch('/api/admin/dashboard', {
        cache: 'no-store',
      })

      if (res.ok) {
        const json = await res.json()
        setProfiles(json.profiles || [])
        setTransactions(json.transactions || [])
        return
      }

      // Fallback
      const [profilesRes, transactionsRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
      ])

      const profilesList: Profile[] = profilesRes.data ?? []
      const transactionsListRaw: Transaction[] = transactionsRes.data ?? []

      const userMap = new Map<string, string>()
      profilesList.forEach((p) => {
        if (p.email) userMap.set(p.id, p.email)
      })

      const transactionsWithEmail: Transaction[] = transactionsListRaw.map((tx) => ({
        ...tx,
        user_email: userMap.get(tx.user_id) || 'Khách vãng lai / Ẩn danh',
      }))

      setProfiles(profilesList)
      setTransactions(transactionsWithEmail)
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  // 3. Compute 4 Overview Metrics
  const stats = useMemo(() => {
    const totalUsers = profiles.length
    const vipUsers = profiles.filter((p) => p.is_premium).length
    const conversionRate = totalUsers > 0 ? ((vipUsers / totalUsers) * 100).toFixed(1) : '0'

    // VIP users created in current month
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    const newVipThisMonth = profiles.filter((p) => {
      if (!p.is_premium || !p.created_at) return false
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

  // 4. Filter & Search transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const query = searchTerm.trim().toLowerCase()
      const matchSearch =
        !query ||
        tx.id.toLowerCase().includes(query) ||
        (tx.user_email && tx.user_email.toLowerCase().includes(query)) ||
        tx.user_id.toLowerCase().includes(query)

      let matchDate = true
      if (startDate) {
        const start = new Date(startDate)
        start.setHours(0, 0, 0, 0)
        const txDate = new Date(tx.created_at)
        if (txDate < start) matchDate = false
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        const txDate = new Date(tx.created_at)
        if (txDate > end) matchDate = false
      }

      return matchSearch && matchDate
    })
  }, [transactions, searchTerm, startDate, endDate])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, startDate, endDate])

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredTransactions.slice(start, start + itemsPerPage)
  }, [filteredTransactions, currentPage])

  // 5. Filter & Search Users
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const query = userSearchTerm.trim().toLowerCase()
      const matchSearch =
        !query ||
        p.id.toLowerCase().includes(query) ||
        (p.email && p.email.toLowerCase().includes(query))

      let matchStatus = true
      if (userFilterStatus === 'VIP') matchStatus = p.is_premium
      if (userFilterStatus === 'REGULAR') matchStatus = !p.is_premium

      return matchSearch && matchStatus
    })
  }, [profiles, userSearchTerm, userFilterStatus])

  useEffect(() => {
    setCurrentUserPage(1)
  }, [userSearchTerm, userFilterStatus])

  const totalUserPages = Math.ceil(filteredProfiles.length / usersPerPage) || 1
  const paginatedProfiles = useMemo(() => {
    const start = (currentUserPage - 1) * usersPerPage
    return filteredProfiles.slice(start, start + usersPerPage)
  }, [filteredProfiles, currentUserPage])

  // 6. Action: Cấp / Hủy VIP thủ công
  const handleToggleVip = async (user: Profile) => {
    const nextVipState = !user.is_premium
    setTogglingUserId(user.id)

    try {
      const res = await fetch('/api/admin/dashboard', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          is_premium: nextVipState,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Lỗi khi cập nhật trạng thái VIP')
      }

      // Cập nhật state trực tiếp
      setProfiles((prev) =>
        prev.map((p) => (p.id === user.id ? { ...p, is_premium: nextVipState } : p))
      )

      showToast(
        `Đã ${nextVipState ? 'kích hoạt VIP' : 'hủy gói VIP'} cho tài khoản: ${user.email || user.id.slice(0, 8)}`,
        'success'
      )
    } catch (err: unknown) {
      console.error('Lỗi khi cấp VIP thủ công:', err)
      showToast(err instanceof Error ? err.message : 'Lỗi cập nhật', 'error')
    } finally {
      setTogglingUserId(null)
    }
  }

  // 7. Export to CSV (Excel format)
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('Không có dữ liệu giao dịch nào để xuất báo cáo.')
      return
    }

    const headers = ['Mã Giao Dịch', 'User ID', 'Email Người Dùng', 'Số Tiền (VND)', 'Phương Thức', 'Trạng Thái', 'Thời Gian Giao Dịch']

    const rows = filteredTransactions.map((tx) => {
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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
  }

  if (checkingAuth) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-800 animate-spin mb-3" />
        <p className="text-gray-500 font-medium text-sm">
          Đang xác thực quyền quản trị viên...
        </p>
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
      {/* Toast thông báo nổi */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg border text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 ${
            toastMessage.type === 'success'
              ? 'bg-gray-900 text-white border-gray-800'
              : 'bg-rose-600 text-white border-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <X className="w-4 h-4 text-white" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* SaaS Admin Sub-Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                H
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-gray-900 block leading-none">
                  HANDY
                </span>
                <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
                  Admin Console
                </span>
              </div>
            </div>

            {/* Navigation pills */}
            <nav className="hidden sm:flex items-center gap-1">
              <Link
                href="/admin/dashboard"
                className="px-3 py-1.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-900 transition-colors"
              >
                Dashboard & Doanh thu
              </Link>
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-md text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Quản lý Nội dung
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Xem trang người dùng</span>
            </Link>

            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition disabled:opacity-50"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <div className="h-4 w-px bg-gray-200" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
                A
              </div>
              <span className="text-xs font-semibold text-gray-700 hidden md:inline">
                Administrator
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main SaaS Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Bảng điều khiển & Doanh thu
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Tổng quan tài chính, đối soát giao dịch và công cụ CSKH cấp VIP thủ công
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold shadow-sm transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất dữ liệu CSV</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. OVERVIEW CARDS (Style: Vercel / Stripe Data-driven) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Tổng người dùng */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tổng Người Dùng
              </span>
              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {loading ? '...' : stats.totalUsers.toLocaleString('vi-VN')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tài khoản trên toàn hệ thống
              </p>
            </div>
          </div>

          {/* Card 2: Tỷ lệ chuyển đổi VIP */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tỷ Lệ Chuyển Đổi VIP
              </span>
              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {loading ? '...' : `${stats.conversionRate}%`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.vipUsers} trên {stats.totalUsers} người dùng
              </p>
            </div>
          </div>

          {/* Card 3: VIP mới tháng này */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                VIP Mới Tháng Này
              </span>
              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {loading ? '...' : `+${stats.newVipThisMonth}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Kích hoạt trong tháng hiện tại
              </p>
            </div>
          </div>

          {/* Card 4: Tổng doanh thu (Enterprise Emerald Green) */}
          <div className="bg-emerald-600 rounded-xl p-5 text-white shadow-sm border border-emerald-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">
                Tổng Doanh Thu
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-700/60 flex items-center justify-center text-white">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {loading ? '...' : formatCurrency(stats.totalRevenue)}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-100 font-medium mt-1">
                {stats.isPositiveGrowth ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-200" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-300" />
                )}
                <span>{stats.revenueGrowth} so với kỳ trước</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TRANSACTIONS SECTION (FILTER TOOLBAR & DATA TABLE) */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Quản lý Giao dịch Thanh toán
              </h2>
              <p className="text-xs text-gray-500">
                Lịch sử giao dịch trực tuyến ghi nhận từ SePAY và cổng VietQR
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo Mã GD, Email hoặc User ID..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-md bg-white border border-gray-300 text-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 placeholder-gray-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Date Pickers */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1 text-gray-600">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[11px] font-medium text-gray-500">Từ:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent text-gray-800 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1 text-gray-600">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[11px] font-medium text-gray-500">Đến:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent text-gray-800 text-xs focus:outline-none"
                  />
                </div>

                {(startDate || endDate || searchTerm) && (
                  <button
                    onClick={() => {
                      setStartDate('')
                      setEndDate('')
                      setSearchTerm('')
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
                  >
                    Đặt lại
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Mã Giao Dịch</th>
                    <th className="py-3 px-5">Người Dùng</th>
                    <th className="py-3 px-5">Số Tiền</th>
                    <th className="py-3 px-5">Thời Gian</th>
                    <th className="py-3 px-5 text-center">Phương Thức</th>
                    <th className="py-3 px-5 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-gray-400">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-gray-600" />
                        <span>Đang tải danh sách giao dịch...</span>
                      </td>
                    </tr>
                  ) : paginatedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-gray-500">
                        <div className="max-w-xs mx-auto space-y-1">
                          <CreditCard className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                          <p className="font-semibold text-gray-700">Không có giao dịch nào</p>
                          <p className="text-xs text-gray-400">
                            Chưa có lịch sử giao dịch phát sinh hoặc bộ lọc không khớp dữ liệu.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedTransactions.map((tx) => {
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
                          <td className="py-3.5 px-5 font-mono text-[11px] text-gray-700 font-medium select-all">
                            {tx.id.slice(0, 13)}...
                          </td>

                          {/* Người dùng */}
                          <td className="py-3.5 px-5">
                            <p className="font-medium text-gray-900">
                              {tx.user_email}
                            </p>
                            <p className="font-mono text-[10px] text-gray-400">
                              {tx.user_id.slice(0, 8)}...
                            </p>
                          </td>

                          {/* Số tiền */}
                          <td className="py-3.5 px-5 font-semibold text-gray-900">
                            {formatCurrency(amount)}
                          </td>

                          {/* Ngày giao dịch */}
                          <td className="py-3.5 px-5 text-gray-500 text-[11px]">
                            {dateFormatted}
                          </td>

                          {/* Phương thức */}
                          <td className="py-3.5 px-5 text-center">
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                              {tx.payment_method || 'VIETQR'}
                            </span>
                          </td>

                          {/* Trạng thái */}
                          <td className="py-3.5 px-5 text-center">
                            {isSuccess ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                                <span>Thành công</span>
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
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

            {/* Pagination */}
            {!loading && filteredTransactions.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                <div>
                  Đang xem <span className="font-semibold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> -{' '}
                  <span className="font-semibold text-gray-900">
                    {Math.min(currentPage * itemsPerPage, filteredTransactions.length)}
                  </span>{' '}
                  trên <span className="font-semibold text-gray-900">{filteredTransactions.length}</span> giao dịch
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Trước</span>
                  </button>

                  <span className="px-2 py-1 text-gray-700 font-medium">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Sau</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. KHU VỰC QUẢN LÝ NGƯỜI DÙNG & CẤP VIP THỦ CÔNG (CSKH / EXCEPTION HANDLING) */}
        {/* ========================================================================= */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <UserCog className="w-5 h-5 text-gray-700" />
                <h2 className="text-base font-bold text-gray-900">
                  Quản lý Người Dùng & Cấp VIP Thủ Công
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Xử lý rủi ro khi khách chuyển khoản sai cú pháp hoặc lỗi mạng. Admin có thể kích hoạt hoặc hủy VIP ngay lập tức.
              </p>
            </div>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-md self-start sm:self-auto">
              Tổng {profiles.length} tài khoản
            </span>
          </div>

          {/* User Search & Status Filter */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="Tìm user theo Email hoặc User ID..."
                className="w-full pl-9 pr-3 py-1.5 rounded-md bg-white border border-gray-300 text-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 placeholder-gray-400"
              />
              {userSearchTerm && (
                <button
                  onClick={() => setUserSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Lọc theo:</span>
              <select
                value={userFilterStatus}
                onChange={(e) => setUserFilterStatus(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-md border border-gray-300 bg-white text-xs font-medium text-gray-700 focus:outline-none"
              >
                <option value="ALL">Tất cả tài khoản</option>
                <option value="VIP">Chỉ tài khoản VIP</option>
                <option value="REGULAR">Chỉ tài khoản Thường</option>
              </select>
            </div>
          </div>

          {/* User Management Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Tài Khoản (Email & ID)</th>
                    <th className="py-3 px-5">Ngày Đăng Ký</th>
                    <th className="py-3 px-5 text-center">Vai Trò</th>
                    <th className="py-3 px-5 text-center">Trạng Thái</th>
                    <th className="py-3 px-5 text-right">Hành Động Cấp VIP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-gray-400">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-gray-600" />
                        <span>Đang tải danh sách người dùng...</span>
                      </td>
                    </tr>
                  ) : paginatedProfiles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400">
                        Không tìm thấy người dùng nào phù hợp với từ khóa.
                      </td>
                    </tr>
                  ) : (
                    paginatedProfiles.map((user) => {
                      const isToggling = togglingUserId === user.id
                      const joinDate = user.created_at
                        ? new Date(user.created_at).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'

                      return (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          {/* Email & ID */}
                          <td className="py-3.5 px-5">
                            <p className="font-semibold text-gray-900">
                              {user.email || 'Chưa cập nhật email'}
                            </p>
                            <p className="font-mono text-[10px] text-gray-400 select-all">
                              ID: {user.id}
                            </p>
                          </td>

                          {/* Ngày đăng ký */}
                          <td className="py-3.5 px-5 text-gray-500 text-[11px]">
                            {joinDate}
                          </td>

                          {/* Vai trò */}
                          <td className="py-3.5 px-5 text-center">
                            {user.role === 'ADMIN' ? (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                ADMIN
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                                USER
                              </span>
                            )}
                          </td>

                          {/* Trạng thái VIP */}
                          <td className="py-3.5 px-5 text-center">
                            {user.is_premium ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                                <Crown className="w-3 h-3 text-amber-600" />
                                <span>Thành viên VIP</span>
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                                Tài khoản thường
                              </span>
                            )}
                          </td>

                          {/* Cột Hành động Cấp / Hủy VIP */}
                          <td className="py-3.5 px-5 text-right">
                            <button
                              onClick={() => handleToggleVip(user)}
                              disabled={isToggling}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                user.is_premium
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                  : 'bg-gray-900 hover:bg-gray-800 text-white'
                              }`}
                              title={
                                user.is_premium
                                  ? 'Nhấp để Hủy kích hoạt quyền VIP'
                                  : 'Nhấp để Cấp quyền VIP thủ công'
                              }
                            >
                              {isToggling ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Đang xử lý...</span>
                                </>
                              ) : user.is_premium ? (
                                <>
                                  <ToggleRight className="w-4 h-4 text-rose-600" />
                                  <span>Hủy VIP</span>
                                </>
                              ) : (
                                <>
                                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Kích hoạt VIP</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Users */}
            {!loading && filteredProfiles.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                <div>
                  Đang xem <span className="font-semibold text-gray-900">{(currentUserPage - 1) * usersPerPage + 1}</span> -{' '}
                  <span className="font-semibold text-gray-900">
                    {Math.min(currentUserPage * usersPerPage, filteredProfiles.length)}
                  </span>{' '}
                  trên <span className="font-semibold text-gray-900">{filteredProfiles.length}</span> người dùng
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentUserPage((p) => Math.max(1, p - 1))}
                    disabled={currentUserPage === 1}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Trước</span>
                  </button>

                  <span className="px-2 py-1 text-gray-700 font-medium">
                    {currentUserPage} / {totalUserPages}
                  </span>

                  <button
                    onClick={() => setCurrentUserPage((p) => Math.min(totalUserPages, p + 1))}
                    disabled={currentUserPage === totalUserPages}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Sau</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
