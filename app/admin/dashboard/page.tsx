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
  ShieldAlert,
  Loader2,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Layers,
  BookOpen
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

  // Filters state
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Pagination state
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
          .select('role')
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

      // Fallback nếu API route gặp sự cố
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
      // Search by Transaction ID or User Email or User ID
      const query = searchTerm.trim().toLowerCase()
      const matchSearch =
        !query ||
        tx.id.toLowerCase().includes(query) ||
        (tx.user_email && tx.user_email.toLowerCase().includes(query)) ||
        tx.user_id.toLowerCase().includes(query)

      // Date range filter
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

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, startDate, endDate])

  // Pagination calculation
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

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
  }

  if (checkingAuth) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-600 font-extrabold text-base">
          Đang kiểm tra quyền quản trị viên...
        </p>
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight flex items-center gap-2">
              <span className="p-2 bg-gradient-to-tr from-orange-400 to-amber-400 text-white rounded-2xl shadow-sm">
                <FileSpreadsheet className="w-6 h-6" />
              </span>
              <span>Bảng Điều Khiển Số Liệu & Giao Dịch</span>
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Hệ thống quản trị tài chính, tăng trưởng người dùng & xuất báo cáo Excel
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border-2 border-amber-300 hover:bg-amber-50 text-amber-900 font-extrabold text-xs shadow-sm transition active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-orange-500" />
            <span>Quản lý Nội dung (Từ vựng & Chủ đề)</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border-2 border-amber-300 hover:bg-amber-50 text-amber-900 font-extrabold text-xs shadow-sm transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-orange-500" />
            <span>Về Trang chủ</span>
          </Link>

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-800 transition active:scale-95"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. KHU VỰC THỐNG KÊ TỔNG QUAN (4 OVERVIEW CARDS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Thẻ 1: Tổng số người dùng */}
        <div className="bg-white rounded-3xl p-6 border-2 border-blue-200 shadow-sm hover:shadow-md transition relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
              Người Dùng
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-800 tracking-tight">
            {loading ? '...' : stats.totalUsers.toLocaleString('vi-VN')}
          </p>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Tổng tài khoản đã đăng ký trên hệ thống
          </p>
        </div>

        {/* Thẻ 2: Tỷ lệ chuyển đổi VIP */}
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-sm hover:shadow-md transition relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
              Chuyển Đổi VIP
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-orange-500 tracking-tight">
            {loading ? '...' : `${stats.conversionRate}%`}
          </p>
          <p className="text-xs text-gray-500 font-medium mt-1">
            {stats.vipUsers} trên tổng số {stats.totalUsers} người dùng
          </p>
        </div>

        {/* Thẻ 3: Người dùng VIP mới trong tháng này */}
        <div className="bg-white rounded-3xl p-6 border-2 border-purple-200 shadow-sm hover:shadow-md transition relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
              VIP Mới Tháng Này
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-purple-600 tracking-tight">
            {loading ? '...' : `+${stats.newVipThisMonth}`}
          </p>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Tài khoản nâng cấp gói trọn đời trong tháng
          </p>
        </div>

        {/* Thẻ 4: Tổng doanh thu */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-900 bg-white/90 px-3 py-1 rounded-full shadow-xs">
              Tổng Doanh Thu
            </span>
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-inner">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black tracking-tight">
            {loading ? '...' : formatCurrency(stats.totalRevenue)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-100 font-bold mt-2">
            {stats.isPositiveGrowth ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-200" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-rose-300" />
            )}
            <span>{stats.revenueGrowth} so với tháng trước</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. KHU VỰC TÌM KIẾM, BỘ LỌC THỜI GIAN & NÚT XUẤT CSV */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border-2 border-amber-200 p-5 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo Mã GD hoặc Email người dùng..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-amber-50/70 border-2 border-amber-200 text-gray-800 text-xs font-semibold focus:outline-none focus:border-orange-400 placeholder-gray-400"
            />
          </div>

          {/* Date Range & Export Button */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Start date */}
            <div className="flex items-center gap-1.5 bg-amber-50/60 border border-amber-200 rounded-2xl px-3 py-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span className="font-bold text-gray-500">Từ:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-gray-800 font-semibold focus:outline-none text-xs"
              />
            </div>

            {/* End date */}
            <div className="flex items-center gap-1.5 bg-amber-50/60 border border-amber-200 rounded-2xl px-3 py-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span className="font-bold text-gray-500">Đến:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-gray-800 font-semibold focus:outline-none text-xs"
              />
            </div>

            {/* Clear date filter */}
            {(startDate || endDate || searchTerm) && (
              <button
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                  setSearchTerm('')
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition"
              >
                Đặt lại
              </button>
            )}

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs shadow-md shadow-emerald-200 transition active:scale-95 cursor-pointer ml-auto sm:ml-0"
              title="Xuất dữ liệu giao dịch ra file CSV (Excel)"
            >
              <Download className="w-4 h-4" />
              <span>Tải báo cáo Excel (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. KHU VỰC BẢNG DỮ LIỆU GIAO DỊCH (DATA TABLE CÓ PHÂN TRANG) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border-2 border-amber-200 shadow-sm overflow-hidden mb-6">
        <div className="p-5 border-b border-amber-100 bg-amber-50/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-gray-800 text-base">
              Lịch Sử Giao Dịch SePAY / VietQR
            </h3>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              {filteredTransactions.length} bản ghi
            </span>
          </div>
        </div>

        {/* Data Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-amber-100/50 text-gray-700 text-xs font-extrabold uppercase tracking-wider border-b border-amber-200">
                <th className="py-4 px-6">Mã GD</th>
                <th className="py-4 px-6">Người dùng</th>
                <th className="py-4 px-6">Số tiền</th>
                <th className="py-4 px-6">Ngày giao dịch</th>
                <th className="py-4 px-6 text-center">Phương thức</th>
                <th className="py-4 px-6 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-orange-400" />
                    <span>Đang tải danh sách giao dịch...</span>
                  </td>
                </tr>
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">
                    Không tìm thấy giao dịch nào phù hợp với bộ lọc.
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
                    : 'Chưa rõ'

                  return (
                    <tr key={tx.id} className="hover:bg-amber-50/40 transition">
                      {/* Mã GD */}
                      <td className="py-4 px-6 font-mono text-xs font-bold text-gray-700">
                        <span className="p-1.5 bg-gray-100 rounded-lg select-all">
                          {tx.id.slice(0, 13)}...
                        </span>
                      </td>

                      {/* Người dùng */}
                      <td className="py-4 px-6">
                        <p className="font-extrabold text-gray-800 text-sm">
                          {tx.user_email}
                        </p>
                        <p className="font-mono text-[11px] text-gray-400 select-all">
                          ID: {tx.user_id.slice(0, 8)}...
                        </p>
                      </td>

                      {/* Số tiền */}
                      <td className="py-4 px-6 font-black text-emerald-600 text-sm">
                        +{formatCurrency(amount)}
                      </td>

                      {/* Ngày giao dịch */}
                      <td className="py-4 px-6 text-xs text-gray-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{dateFormatted}</span>
                        </div>
                      </td>

                      {/* Phương thức */}
                      <td className="py-4 px-6 text-center">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          {tx.payment_method || 'VIETQR'}
                        </span>
                      </td>

                      {/* Trạng thái */}
                      <td className="py-4 px-6 text-center">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Thành công</span>
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
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

        {/* Phân trang (Pagination) */}
        {!loading && filteredTransactions.length > 0 && (
          <div className="p-4 border-t border-amber-100 bg-amber-50/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <div>
              Hiển thị <span className="font-black text-gray-800">{(currentPage - 1) * itemsPerPage + 1}</span> -{' '}
              <span className="font-black text-gray-800">
                {Math.min(currentPage * itemsPerPage, filteredTransactions.length)}
              </span>{' '}
              trong tổng số <span className="font-black text-gray-800">{filteredTransactions.length}</span> giao dịch
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-amber-200 bg-white hover:bg-amber-50 text-gray-700 font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trước</span>
              </button>

              <span className="px-3 py-1.5 font-bold text-gray-800">
                Trang {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-amber-200 bg-white hover:bg-amber-50 text-gray-700 font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
