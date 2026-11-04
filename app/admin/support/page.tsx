'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { SupportRequest, SupportStatus } from '@/lib/types'
import {
  Headphones,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  MessageSquare,
  X,
  ExternalLink,
  Calendar,
  User,
  Tag,
  ArrowUpDown,
} from 'lucide-react'

const STATUS_CONFIG: Record<
  SupportStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  pending: {
    label: 'Chờ xử lý',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  in_progress: {
    label: 'Đang xử lý',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  resolved: {
    label: 'Đã giải quyết',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  'Tài khoản': 'bg-purple-50 text-purple-700 border-purple-200',
  'Nội dung học': 'bg-sky-50 text-sky-700 border-sky-200',
  'Thanh toán': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Flashcard & sách': 'bg-orange-50 text-orange-700 border-orange-200',
  'Khác': 'bg-gray-100 text-gray-700 border-gray-200',
}

export default function AdminSupportPage() {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  // Data state
  const [requests, setRequests] = useState<SupportRequest[]>([])

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | SupportStatus>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Actions state
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null)

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{
    text: string
    type: 'success' | 'error'
  } | null>(null)

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Fetch support requests
  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Gọi trực tiếp bằng Supabase client (với session/RLS)
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        setRequests((data as SupportRequest[]) || [])
        return
      }

      // 2. Dự phòng: Gọi qua Server API endpoint nếu client RLS không trả về dữ liệu (hỗ trợ giả lập session)
      const res = await fetch('/api/admin/support', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        if (json.data) {
          setRequests(json.data as SupportRequest[])
          return
        }
      }

      if (data) {
        setRequests(data as SupportRequest[])
      }
    } catch (err) {
      console.error('Lỗi khi fetch support requests:', err)
      showToast('Lỗi hệ thống khi tải dữ liệu', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  // 1. Verify ADMIN role
  useEffect(() => {
    let isMounted = true

    const verifyAdmin = async () => {
      try {
        // Cho phép chế độ giả lập session admin khi có ?mockAdmin=true hoặc localStorage
        const isMock =
          typeof window !== 'undefined' &&
          (window.location.search.includes('mockAdmin=true') ||
            localStorage.getItem('admin_session') === 'true')

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user && !isMock) {
          alert('Bạn không có quyền truy cập trang này')
          router.push('/')
          return
        }

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle()

          if (!profile || profile.role !== 'ADMIN') {
            if (!isMock) {
              alert('Bạn không có quyền truy cập trang này')
              router.push('/')
              return
            }
          }
        }

        if (isMounted) {
          setAuthorized(true)
          fetchRequests()
        }
      } catch (err) {
        console.error('Lỗi kiểm tra quyền admin:', err)
        router.push('/')
      } finally {
        if (isMounted) setCheckingAuth(false)
      }
    }

    verifyAdmin()

    return () => {
      isMounted = false
    }
  }, [router, fetchRequests])

  // Update request status
  const handleUpdateStatus = async (id: string, newStatus: SupportStatus) => {
    setUpdatingId(id)
    try {
      const now = new Date().toISOString()

      // 1. Thử gọi trực tiếp Supabase client
      let updateSuccess = false
      const { error } = await supabase
        .from('support_requests')
        .update({ status: newStatus, updated_at: now })
        .eq('id', id)

      if (!error) {
        updateSuccess = true
      } else {
        // 2. Dự phòng: Gọi qua Server API endpoint nếu client bị RLS chặn
        const res = await fetch('/api/admin/support', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: newStatus }),
        })
        if (res.ok) {
          updateSuccess = true
        }
      }

      if (!updateSuccess) {
        showToast('Không thể cập nhật trạng thái', 'error')
        return
      }

      // Cập nhật state local
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: newStatus, updated_at: now } : r
        )
      )

      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest({
          ...selectedRequest,
          status: newStatus,
          updated_at: now,
        })
      }

      const statusName = STATUS_CONFIG[newStatus]?.label || newStatus
      showToast(`Đã chuyển trạng thái sang "${statusName}"`, 'success')
    } catch (err) {
      console.error('Lỗi update status:', err)
      showToast('Có lỗi xảy ra khi cập nhật', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  // Filtered and searched data
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      // Filter status
      if (statusFilter !== 'ALL' && r.status !== statusFilter) {
        return false
      }
      // Filter category
      if (categoryFilter !== 'ALL' && r.category !== categoryFilter) {
        return false
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim()
        const matchName = r.full_name?.toLowerCase().includes(q)
        const matchContact = r.contact_info?.toLowerCase().includes(q)
        const matchContent = r.content?.toLowerCase().includes(q)
        const matchCategory = r.category?.toLowerCase().includes(q)
        if (!matchName && !matchContact && !matchContent && !matchCategory) {
          return false
        }
      }
      return true
    })
  }, [requests, statusFilter, categoryFilter, searchTerm])

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage) || 1
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredRequests.slice(start, start + itemsPerPage)
  }, [filteredRequests, currentPage, itemsPerPage])

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, categoryFilter, searchTerm])

  // Count stats
  const stats = useMemo(() => {
    const total = requests.length
    const pending = requests.filter((r) => r.status === 'pending').length
    const inProgress = requests.filter((r) => r.status === 'in_progress').length
    const resolved = requests.filter((r) => r.status === 'resolved').length
    return { total, pending, inProgress, resolved }
  }, [requests])

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>()
    requests.forEach((r) => {
      if (r.category) set.add(r.category)
    })
    return Array.from(set)
  }, [requests])

  if (checkingAuth) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-800 animate-spin mb-3" />
        <p className="text-gray-500 font-semibold text-xs tracking-wide uppercase">
          Đang xác thực quyền quản trị...
        </p>
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg border text-xs font-semibold transition-all ${
            toastMessage.type === 'success'
              ? 'bg-gray-900 text-white border-gray-800'
              : 'bg-rose-600 text-white border-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-white" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <Headphones className="w-6 h-6 text-gray-900" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Quản Lý Yêu Cầu Hỗ Trợ
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
              Tiếp nhận, xử lý phản hồi và chăm sóc khách hàng gửi yêu cầu từ website.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchRequests}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-300 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Làm mới danh sách"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-gray-700' : 'text-gray-500'}`}
              />
              <span className="text-xs font-semibold">Làm mới</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Total */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-medium">Tổng yêu cầu</span>
              <MessageSquare className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2 font-mono">
              {stats.total}
            </p>
          </div>

          {/* Pending */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs hover:border-amber-300 transition-colors">
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-xs font-medium">Chờ xử lý</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-900 mt-2 font-mono">
              {stats.pending}
            </p>
          </div>

          {/* In Progress */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 shadow-xs hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between text-blue-800">
              <span className="text-xs font-medium">Đang xử lý</span>
              <AlertCircle className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-2 font-mono">
              {stats.inProgress}
            </p>
          </div>

          {/* Resolved */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-xs font-medium">Đã giải quyết</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-900 mt-2 font-mono">
              {stats.resolved}
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên người gửi, email, số điện thoại hoặc nội dung..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-white transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as 'ALL' | SupportStatus)
                }
                className="py-2 px-3 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium focus:outline-none focus:border-gray-900 cursor-pointer"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý ({stats.pending})</option>
                <option value="in_progress">Đang xử lý ({stats.inProgress})</option>
                <option value="resolved">Đã giải quyết ({stats.resolved})</option>
              </select>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="py-2 px-3 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium focus:outline-none focus:border-gray-900 cursor-pointer"
              >
                <option value="ALL">Tất cả chủ đề</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Support Requests Table */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Thời Gian</th>
                  <th className="py-3 px-4">Người Gửi</th>
                  <th className="py-3 px-4">Thông Tin Liên Hệ</th>
                  <th className="py-3 px-4">Chủ Đề</th>
                  <th className="py-3 px-4">Nội Dung</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-700" />
                      <span className="font-medium">Đang tải danh sách yêu cầu hỗ trợ...</span>
                    </td>
                  </tr>
                ) : paginatedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center text-gray-400">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="font-medium">Không tìm thấy yêu cầu hỗ trợ nào.</p>
                      {(searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL') && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchTerm('')
                            setStatusFilter('ALL')
                            setCategoryFilter('ALL')
                          }}
                          className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Xóa bộ lọc
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((req) => {
                    const statusConf = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending
                    const categoryClass =
                      CATEGORY_COLORS[req.category] || 'bg-gray-100 text-gray-700 border-gray-200'
                    const dateFormatted = req.created_at
                      ? new Date(req.created_at).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'
                    const isEmail = req.contact_info?.includes('@')
                    const isUpdating = updatingId === req.id

                    return (
                      <tr
                        key={req.id}
                        className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                        onClick={() => setSelectedRequest(req)}
                      >
                        {/* Thời gian */}
                        <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap font-medium text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>{dateFormatted}</span>
                          </div>
                        </td>

                        {/* Người gửi */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {req.full_name ? req.full_name.charAt(0) : 'U'}
                            </div>
                            <span className="font-bold text-gray-900">
                              {req.full_name || 'Khách vãng lai'}
                            </span>
                          </div>
                        </td>

                        {/* Liên hệ */}
                        <td
                          className="py-3.5 px-4 font-mono text-gray-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-1.5">
                            {isEmail ? (
                              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            ) : (
                              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            )}
                            <a
                              href={isEmail ? `mailto:${req.contact_info}` : `tel:${req.contact_info}`}
                              className="text-blue-600 hover:underline select-all"
                            >
                              {req.contact_info}
                            </a>
                          </div>
                        </td>

                        {/* Chủ đề */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${categoryClass}`}
                          >
                            {req.category || 'Khác'}
                          </span>
                        </td>

                        {/* Nội dung */}
                        <td className="py-3.5 px-4 max-w-[280px]">
                          <p className="text-gray-700 line-clamp-2 leading-relaxed">
                            {req.content}
                          </p>
                        </td>

                        {/* Trạng thái */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                            <span>{statusConf.label}</span>
                          </span>
                        </td>

                        {/* Hành động */}
                        <td
                          className="py-3.5 px-4 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="inline-flex items-center justify-end gap-1.5">
                            {/* Nút đổi sang Resolved nhanh */}
                            {req.status !== 'resolved' ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(req.id, 'resolved')}
                                disabled={isUpdating}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer disabled:opacity-50"
                                title="Đánh dấu đã giải quyết"
                              >
                                {isUpdating ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                                <span>Giải quyết</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(req.id, 'pending')}
                                disabled={isUpdating}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50"
                                title="Mở lại yêu cầu (Chờ xử lý)"
                              >
                                {isUpdating ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Clock className="w-3 h-3" />
                                )}
                                <span>Mở lại</span>
                              </button>
                            )}

                            {/* Nút Xem chi tiết */}
                            <button
                              type="button"
                              onClick={() => setSelectedRequest(req)}
                              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                              title="Xem chi tiết nội dung"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredRequests.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-gray-50/80 border-t border-gray-200 text-xs text-gray-600">
              <div>
                Hiển thị{' '}
                <span className="font-semibold text-gray-900">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{' '}
                -{' '}
                <span className="font-semibold text-gray-900">
                  {Math.min(currentPage * itemsPerPage, filteredRequests.length)}
                </span>{' '}
                trong tổng số{' '}
                <span className="font-semibold text-gray-900">
                  {filteredRequests.length}
                </span>{' '}
                yêu cầu
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-md hover:bg-white border border-transparent hover:border-gray-200 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="px-2 font-medium">
                  Trang {currentPage} / {totalPages}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-md hover:bg-white border border-transparent hover:border-gray-200 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Trang sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-gray-200">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      CATEGORY_COLORS[selectedRequest.category] ||
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {selectedRequest.category || 'Khác'}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      STATUS_CONFIG[selectedRequest.status]?.bg
                    } ${STATUS_CONFIG[selectedRequest.status]?.text} ${
                      STATUS_CONFIG[selectedRequest.status]?.border
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        STATUS_CONFIG[selectedRequest.status]?.dot
                      }`}
                    />
                    {STATUS_CONFIG[selectedRequest.status]?.label}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mt-1">
                  Yêu cầu từ: {selectedRequest.full_name}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Meta Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-50 text-xs">
              <div>
                <span className="text-gray-500 font-medium block">Thông tin liên hệ:</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-gray-900 font-mono select-all">
                    {selectedRequest.contact_info}
                  </span>
                  <a
                    href={
                      selectedRequest.contact_info?.includes('@')
                        ? `mailto:${selectedRequest.contact_info}`
                        : `tel:${selectedRequest.contact_info}`
                    }
                    className="text-blue-600 hover:underline inline-flex items-center gap-1 text-[11px]"
                  >
                    <span>Mở liên hệ</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div>
                <span className="text-gray-500 font-medium block">Thời gian gửi:</span>
                <span className="font-semibold text-gray-900 block mt-1">
                  {selectedRequest.created_at
                    ? new Date(selectedRequest.created_at).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    : '—'}
                </span>
              </div>
            </div>

            {/* Full Message Body */}
            <div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                Nội dung yêu cầu chi tiết:
              </span>
              <div className="p-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto font-sans">
                {selectedRequest.content}
              </div>
            </div>

            {/* Change Status Buttons in Modal */}
            <div className="pt-2 border-t border-gray-200">
              <span className="text-xs font-semibold text-gray-600 block mb-2">
                Chuyển trạng thái yêu cầu:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {(['pending', 'in_progress', 'resolved'] as SupportStatus[]).map((st) => {
                  const conf = STATUS_CONFIG[st]
                  const isCurrent = selectedRequest.status === st
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedRequest.id, st)}
                      disabled={updatingId === selectedRequest.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        isCurrent
                          ? `${conf.bg} ${conf.text} ${conf.border} ring-2 ring-gray-900/10`
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                      <span>{conf.label}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 ml-1" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-xs transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
