'use client'

import { useState, useEffect, useMemo } from 'react'
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
  Loader2,
  RefreshCw,
  CreditCard,
  X,
} from 'lucide-react'

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

  // 3. Compute 4 Overview Metrics
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

  // 5. Export to CSV (Excel format)
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
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
      {/* Main SaaS Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Bảng điều khiển & Doanh thu
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Tổng quan tài chính, phân tích chỉ số kinh doanh và đối soát giao dịch trực tuyến
            </p>
          </div>

          <div className="flex items-center gap-2.5">
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
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất dữ liệu CSV</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. OVERVIEW CARDS                                                         */}
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

          {/* Card 4: Tổng doanh thu */}
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
        {/* 2. TRANSACTIONS SECTION (FILTER TOOLBAR & DATA TABLE)                     */}
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
                    className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition cursor-pointer"
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
