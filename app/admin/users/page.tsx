'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  CheckCircle2,
  Clock,
  X,
  Crown,
  UserCog,
  Check,
  ShieldCheck,
  Calendar,
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

export default function AdminUsersPage() {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  // Profiles data
  const [profiles, setProfiles] = useState<Profile[]>([])

  // Search & Filter state
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [userFilterStatus, setUserFilterStatus] = useState<'ALL' | 'VIP' | 'REGULAR'>('ALL')
  const [currentUserPage, setCurrentUserPage] = useState(1)
  const usersPerPage = 10

  // Modal VIP Management state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [modalIsPremium, setModalIsPremium] = useState(false)
  const [modalPlanType, setModalPlanType] = useState<string>('1y')
  const [modalVipUntil, setModalVipUntil] = useState<string>('')
  const [isSavingVip, setIsSavingVip] = useState(false)

  // Toast notification
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
          fetchUsers()
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

  // 2. Fetch profiles from Server-side Admin API
  const fetchUsers = async () => {
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
        return
      }

      if (res.status === 401 || res.status === 403) {
        alert('Phiên quản trị đã hết hạn hoặc không có quyền Admin.')
        router.push('/')
        return
      }

      console.error('Lỗi khi tải danh sách người dùng:', res.status)
    } catch (err) {
      console.error('Lỗi khi tải danh sách người dùng:', err)
    } finally {
      setLoading(false)
    }
  }

  // Helper kiểm tra VIP còn hạn
  const isVipUser = (p: Profile) =>
    Boolean(p.is_premium && (!p.vip_until || new Date(p.vip_until) > new Date()))

  // 3. Filter & Search Users
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const query = userSearchTerm.trim().toLowerCase()
      const matchSearch =
        !query ||
        p.id.toLowerCase().includes(query) ||
        (p.email && p.email.toLowerCase().includes(query))

      let matchStatus = true
      if (userFilterStatus === 'VIP') matchStatus = isVipUser(p)
      if (userFilterStatus === 'REGULAR') matchStatus = !isVipUser(p)

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

  // Summary counts
  const vipCount = useMemo(() => profiles.filter(isVipUser).length, [profiles])
  const regularCount = useMemo(() => profiles.length - vipCount, [profiles, vipCount])

  // 4. Quản lý Modal Cấp Quyền VIP
  const PLAN_LABELS: Record<string, string> = {
    '3m': '3 Tháng',
    '6m': '6 Tháng',
    '1y': '1 Năm',
    'lifetime': 'Vĩnh viễn',
    'custom': 'Tùy chỉnh',
  }

  const formatIsoToDateInput = (isoString?: string | null): string => {
    if (!isoString) return ''
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return ''
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const calculateExpiryDate = (plan: string): string => {
    const d = new Date()
    if (plan === '3m') {
      d.setMonth(d.getMonth() + 3)
    } else if (plan === '6m') {
      d.setMonth(d.getMonth() + 6)
    } else if (plan === '1y') {
      d.setFullYear(d.getFullYear() + 1)
    } else {
      return ''
    }
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getTodayDisplay = (): string => {
    const d = new Date()
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const openVipModal = (user: Profile) => {
    setSelectedUser(user)
    const isVip = isVipUser(user)
    setModalIsPremium(isVip)

    if (isVip) {
      if (user.plan_type === 'lifetime' || (!user.vip_until && !user.plan_type)) {
        setModalPlanType('lifetime')
        setModalVipUntil('')
      } else if (user.plan_type && ['3m', '6m', '1y'].includes(user.plan_type)) {
        setModalPlanType(user.plan_type)
        setModalVipUntil(formatIsoToDateInput(user.vip_until))
      } else {
        setModalPlanType('custom')
        setModalVipUntil(formatIsoToDateInput(user.vip_until))
      }
    } else {
      setModalPlanType('1y')
      setModalVipUntil(calculateExpiryDate('1y'))
    }
    setIsModalOpen(true)
  }

  const closeVipModal = () => {
    if (isSavingVip) return
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  const handlePlanChange = (newPlan: string) => {
    setModalPlanType(newPlan)
    if (newPlan === 'lifetime') {
      setModalVipUntil('')
    } else if (newPlan === 'custom') {
      if (!modalVipUntil) {
        setModalVipUntil(calculateExpiryDate('1y'))
      }
    } else {
      setModalVipUntil(calculateExpiryDate(newPlan))
    }
  }

  const handleDateChange = (newDate: string) => {
    setModalVipUntil(newDate)
    setModalPlanType('custom')
  }

  const handleToggleModalStatus = () => {
    const nextStatus = !modalIsPremium
    setModalIsPremium(nextStatus)
    if (nextStatus) {
      if (!modalPlanType || modalPlanType === 'custom') {
        if (!modalVipUntil) {
          setModalPlanType('1y')
          setModalVipUntil(calculateExpiryDate('1y'))
        }
      }
    }
  }

  const handleSaveVip = async () => {
    if (!selectedUser) return
    setIsSavingVip(true)

    try {
      const token = await getAuthToken()
      if (!token) {
        showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'error')
        setIsSavingVip(false)
        return
      }

      let payload: {
        userId: string
        is_premium: boolean
        plan_type: string | null
        vip_until: string | null
      }

      if (!modalIsPremium) {
        payload = {
          userId: selectedUser.id,
          is_premium: false,
          plan_type: null,
          vip_until: null,
        }
      } else {
        if (modalPlanType === 'lifetime') {
          payload = {
            userId: selectedUser.id,
            is_premium: true,
            plan_type: 'lifetime',
            vip_until: null,
          }
        } else {
          if (!modalVipUntil) {
            showToast('Vui lòng chọn ngày hết hạn cho gói VIP', 'error')
            setIsSavingVip(false)
            return
          }
          const [year, month, day] = modalVipUntil.split('-').map(Number)
          const expiryDate = new Date(year, month - 1, day, 23, 59, 59, 999)

          payload = {
            userId: selectedUser.id,
            is_premium: true,
            plan_type: modalPlanType,
            vip_until: expiryDate.toISOString(),
          }
        }
      }

      const res = await fetch('/api/admin/dashboard', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi khi cập nhật trạng thái VIP')
      }

      // Cập nhật state trực tiếp
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === selectedUser.id
            ? {
                ...p,
                is_premium: payload.is_premium,
                plan_type: payload.plan_type,
                vip_until: payload.vip_until,
              }
            : p
        )
      )

      showToast(
        `Đã ${payload.is_premium ? 'cập nhật quyền VIP' : 'hủy quyền VIP'} cho tài khoản: ${selectedUser.email || selectedUser.id.slice(0, 8)}`,
        'success'
      )
      setIsModalOpen(false)
      setSelectedUser(null)
    } catch (err: unknown) {
      console.error('Lỗi khi lưu VIP:', err)
      showToast(err instanceof Error ? err.message : 'Lỗi cập nhật', 'error')
    } finally {
      setIsSavingVip(false)
    }
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
      {/* Toast thông báo nổi */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold animate-scale-in ${
            toastMessage.type === 'success'
              ? 'bg-slate-900 text-white border-slate-800'
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

      {/* Main SaaS Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8 animate-fade-in">
        {/* Page Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block animate-pulse" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Quản Lý Người Dùng & Cấp VIP
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Tra cứu thông tin tài khoản, cấp quyền VIP nhanh chóng và quản lý thời hạn truy cập.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : 'text-slate-600'}`} />
              <span className="text-xs font-semibold">Làm mới</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-200 flex items-center justify-between group">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tổng Người Dùng
              </p>
              <p className="text-3xl font-black text-slate-900 mt-2 font-mono">
                {loading ? '...' : profiles.length.toLocaleString('vi-VN')}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300 shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-amber-200 flex items-center justify-between group">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tài Khoản VIP
              </p>
              <p className="text-3xl font-black text-amber-600 mt-2 font-mono">
                {loading ? '...' : vipCount.toLocaleString('vi-VN')}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform duration-300 shadow-2xs">
              <Crown className="w-5 h-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-slate-300 flex items-center justify-between group">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tài Khoản Thường
              </p>
              <p className="text-3xl font-black text-slate-700 mt-2 font-mono">
                {loading ? '...' : regularCount.toLocaleString('vi-VN')}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform duration-300 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              placeholder="Tìm user theo Email hoặc User ID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-slate-400 font-medium"
            />
            {userSearchTerm && (
              <button
                onClick={() => setUserSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Lọc theo:</span>
            <select
              value={userFilterStatus}
              onChange={(e) => setUserFilterStatus(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value="ALL">Tất cả tài khoản</option>
              <option value="VIP">Chỉ tài khoản VIP</option>
              <option value="REGULAR">Chỉ tài khoản Thường</option>
            </select>
          </div>
        </div>

        {/* Users Data Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl animate-slide-up">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Tài Khoản (Email & ID)</th>
                  <th className="py-3.5 px-4">Ngày Đăng Ký</th>
                  <th className="py-3.5 px-4 text-center">Vai Trò</th>
                  <th className="py-3.5 px-4 text-center">Trạng Thái VIP</th>
                  <th className="py-3.5 px-4 text-center">Gói Cước</th>
                  <th className="py-3.5 px-4 text-center">Ngày Hết Hạn</th>
                  <th className="py-3.5 px-5 text-right">Quản Lý VIP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                      <span className="font-medium">Đang tải danh sách người dùng...</span>
                    </td>
                  </tr>
                ) : paginatedProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Không tìm thấy người dùng nào phù hợp với từ khóa.
                    </td>
                  </tr>
                ) : (
                  paginatedProfiles.map((user) => {
                    const isVip = isVipUser(user)
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
                      <tr key={user.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                        {/* Email & ID */}
                        <td className="py-3.5 px-5">
                          <p className="font-bold text-slate-900">
                            {user.email || 'Chưa cập nhật email'}
                          </p>
                          <p className="font-mono text-[10px] text-slate-400 select-all">
                            ID: {user.id}
                          </p>
                        </td>

                        {/* Ngày đăng ký */}
                        <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap font-medium">
                          {joinDate}
                        </td>

                        {/* Vai trò */}
                        <td className="py-3.5 px-4 text-center">
                          {user.role === 'ADMIN' ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              ADMIN
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              USER
                            </span>
                          )}
                        </td>

                        {/* Trạng thái VIP */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {isVip ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Đang hoạt động</span>
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                              {user.is_premium ? 'Đã hết hạn' : 'Chưa kích hoạt'}
                            </span>
                          )}
                        </td>

                        {/* Gói Cước */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {isVip ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                              <Crown className="w-3 h-3 text-amber-600" />
                              <span>{PLAN_LABELS[user.plan_type || ''] || user.plan_type || (user.vip_until ? 'Tùy chỉnh' : 'Vĩnh viễn')}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">—</span>
                          )}
                        </td>

                        {/* Ngày Hết Hạn */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap text-[11px]">
                          {isVip ? (
                            user.vip_until ? (
                              <span className="font-semibold text-slate-800 font-mono">
                                {new Date(user.vip_until).toLocaleDateString('vi-VN')}
                              </span>
                            ) : (
                              <span className="font-bold text-amber-700">
                                Vô thời hạn
                              </span>
                            )
                          ) : user.vip_until ? (
                            <span className="text-rose-500 line-through text-[11px] font-mono">
                              {new Date(user.vip_until).toLocaleDateString('vi-VN')}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">—</span>
                          )}
                        </td>

                        {/* Hành Động Quản Lý VIP */}
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <button
                            onClick={() => openVipModal(user)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border ${
                              isVip
                                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 hover:border-amber-400'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400'
                            }`}
                            title="Nhấp để tùy chỉnh trạng thái gói và thời hạn VIP"
                          >
                            <Crown className={`w-3.5 h-3.5 ${isVip ? 'text-amber-600' : 'text-slate-400'}`} />
                            <span>{isVip ? 'Chỉnh sửa VIP' : 'Cấp quyền VIP'}</span>
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
            <div className="px-5 py-3.5 border-t border-slate-200/80 bg-white/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
              <div>
                Đang xem <span className="font-bold text-slate-900">{(currentUserPage - 1) * usersPerPage + 1}</span> -{' '}
                <span className="font-bold text-slate-900">
                  {Math.min(currentUserPage * usersPerPage, filteredProfiles.length)}
                </span>{' '}
                trên <span className="font-bold text-slate-900">{filteredProfiles.length}</span> người dùng
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentUserPage((p) => Math.max(1, p - 1))}
                  disabled={currentUserPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Trước</span>
                </button>

                <span className="px-2.5 py-1 text-slate-700 font-semibold font-mono">
                  {currentUserPage} / {totalUserPages}
                </span>

                <button
                  onClick={() => setCurrentUserPage((p) => Math.min(totalUserPages, p + 1))}
                  disabled={currentUserPage === totalUserPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>Sau</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Cấp & Quản lý Quyền VIP */}
        {isModalOpen && selectedUser && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
            onClick={closeVipModal}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/70 via-white to-orange-50/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs">
                    <Crown className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Cấp & Quản lý Quyền VIP
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      Tùy chỉnh trạng thái gói cước và thời hạn truy cập
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeVipModal}
                  disabled={isSavingVip}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition disabled:opacity-40 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 text-xs">
                {/* 1. User Info Card */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Tài khoản đang thao tác
                    </span>
                    {selectedUser.role === 'ADMIN' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        ADMIN
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700">
                        USER
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {selectedUser.email || 'Chưa cập nhật email'}
                    </p>
                    <p className="font-mono text-[11px] text-slate-500 mt-0.5 select-all">
                      User ID: {selectedUser.id}
                    </p>
                  </div>
                </div>

                {/* 2. Toggle Status VIP */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <label className="text-xs font-bold text-slate-900 block">
                      Trạng thái VIP
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {modalIsPremium
                        ? 'Đang hoạt động (Kích hoạt quyền VIP)'
                        : 'Khóa / Hủy quyền VIP của tài khoản này'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleModalStatus}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      modalIsPremium ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        modalIsPremium ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* If VIP is enabled, show Plan & Date inputs. If disabled, disable/hide them. */}
                {modalIsPremium ? (
                  <div className="space-y-4 pt-1 animate-fade-in">
                    {/* Dropdown Chọn Gói */}
                    <div>
                      <label className="text-xs font-bold text-slate-900 block mb-1.5">
                        Chọn Gói Cước (plan_type)
                      </label>
                      <select
                        value={modalPlanType}
                        onChange={(e) => handlePlanChange(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-2xs"
                      >
                        <option value="3m">3 Tháng (3m)</option>
                        <option value="6m">6 Tháng (6m)</option>
                        <option value="1y">1 Năm (1y)</option>
                        <option value="lifetime">Vĩnh viễn (lifetime)</option>
                        <option value="custom">Tùy chỉnh (custom)</option>
                      </select>
                    </div>

                    {/* Ngày Bắt Đầu (Readonly) */}
                    <div>
                      <label className="text-xs font-bold text-slate-900 block mb-1.5">
                        Ngày Bắt Đầu
                      </label>
                      <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-xs flex items-center justify-between">
                        <span>Hôm nay ({getTodayDisplay()})</span>
                        <span className="text-[10px] text-slate-400 font-normal">Tự động kích hoạt</span>
                      </div>
                    </div>

                    {/* Ngày Hết Hạn (vip_until) */}
                    <div>
                      <label className="text-xs font-bold text-slate-900 block mb-1.5">
                        Ngày Hết Hạn (vip_until)
                      </label>
                      {modalPlanType === 'lifetime' ? (
                        <div className="px-3.5 py-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-800 text-xs flex items-center gap-2">
                          <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Gói <strong>Vĩnh viễn</strong> không có thời hạn kết thúc (vô thời hạn).</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <input
                            type="date"
                            value={modalVipUntil}
                            min={new Date().toISOString().slice(0, 10)}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs font-mono"
                          />
                          <p className="text-[11px] text-slate-400 font-medium">
                            * Khi tự chỉnh sửa ngày trực tiếp, gói cước sẽ tự động chuyển sang <strong>Tùy chỉnh</strong>.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-500 text-xs font-medium">
                    Trạng thái VIP đang tắt (Khóa). Khi bấm Lưu, tài khoản sẽ được chuyển thành tài khoản thường và xóa toàn bộ thời hạn VIP.
                  </div>
                )}
              </div>

              {/* Modal Footer với Luxury Primary CTA Button */}
              <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={closeVipModal}
                  disabled={isSavingVip}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  onClick={handleSaveVip}
                  disabled={isSavingVip}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingVip ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Lưu thay đổi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
