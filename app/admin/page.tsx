'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import {
  BookOpen,
  FolderPlus,
  Plus,
  Edit3,
  Trash2,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Layers,
  Video,
  Check,
  RefreshCw,
} from 'lucide-react'
import { getEmbedYoutubeUrl } from '@/lib/utils'

interface Topic {
  id: string
  title: string
  description: string | null
  is_free: boolean
  created_at: string
}

interface Vocabulary {
  id: string
  topic_id: string
  word: string
  meaning: string
  description: string | null
  video_url: string
  is_deleted: boolean
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'vocab' | 'topics'>('vocab')

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DELETED'>('ALL')

  // Form states - New Topic
  const [newTopic, setNewTopic] = useState({
    title: '',
    description: '',
    is_free: true,
  })

  // Form states - New Vocabulary
  const [newVocab, setNewVocab] = useState({
    topic_id: '',
    word: '',
    meaning: '',
    description: '',
    video_url: '',
  })

  // Edit Modal state
  const [editingVocab, setEditingVocab] = useState<Vocabulary | null>(null)

  // Notification feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Load tất cả topics và vocabularies
  const fetchData = async () => {
    try {
      setLoading(true)
      const [topicsRes, vocabsRes] = await Promise.all([
        supabase.from('topics').select('*').order('created_at', { ascending: true }),
        supabase.from('vocabularies').select('*').order('created_at', { ascending: false }),
      ])

      if (topicsRes.error) throw topicsRes.error
      if (vocabsRes.error) throw vocabsRes.error

      const topicList = topicsRes.data ?? []
      setTopics(topicList)
      setVocabularies(vocabsRes.data ?? [])

      // Set default topic_id cho form nếu chưa chọn
      if (topicList.length > 0 && !newVocab.topic_id) {
        setNewVocab((prev) => ({ ...prev, topic_id: topicList[0].id }))
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Bảo vệ route: Kiểm tra đăng nhập và role === 'ADMIN'
  useEffect(() => {
    let isMounted = true

    const verifyAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
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
          fetchData()
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

  // Map tên topic để hiển thị nhanh
  const topicMap = useMemo(() => {
    const map = new Map<string, string>()
    topics.forEach((t) => map.set(t.id, t.title))
    return map
  }, [topics])

  // Thêm Topic mới
  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTopic.title.trim()) {
      showToast('Vui lòng nhập tiêu đề chủ đề!', 'error')
      return
    }

    try {
      setActionLoading(true)
      const { data, error } = await supabase
        .from('topics')
        .insert({
          title: newTopic.title.trim(),
          description: newTopic.description.trim() || null,
          is_free: newTopic.is_free,
        })
        .select()
        .single()

      if (error) throw error

      setTopics((prev) => [...prev, data])
      setNewTopic({ title: '', description: '', is_free: true })
      showToast(`Đã thêm chủ đề "${data.title}" thành công!`, 'success')
    } catch (err: unknown) {
      showToast(
        err instanceof Error
          ? err.message
          : 'Không thể thêm chủ đề. Kiểm tra lại chính sách RLS trong Supabase!',
        'error'
      )
    } finally {
      setActionLoading(false)
    }
  }

  // Thêm Vocabulary mới
  const handleAddVocab = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVocab.topic_id) {
      showToast('Vui lòng chọn một chủ đề!', 'error')
      return
    }
    if (!newVocab.word.trim() || !newVocab.meaning.trim() || !newVocab.video_url.trim()) {
      showToast('Vui lòng nhập đầy đủ Từ vựng, Ý nghĩa và Link video!', 'error')
      return
    }

    try {
      setActionLoading(true)
      const formattedUrl = getEmbedYoutubeUrl(newVocab.video_url.trim())
      const { data, error } = await supabase
        .from('vocabularies')
        .insert({
          topic_id: newVocab.topic_id,
          word: newVocab.word.trim(),
          meaning: newVocab.meaning.trim(),
          description: newVocab.description.trim() || null,
          video_url: formattedUrl,
          is_deleted: false,
        })
        .select()
        .single()

      if (error) throw error

      setVocabularies((prev) => [data, ...prev])
      setNewVocab({
        topic_id: newVocab.topic_id,
        word: '',
        meaning: '',
        description: '',
        video_url: '',
      })
      showToast(`Đã thêm từ vựng "${data.word}" thành công!`, 'success')
    } catch (err: unknown) {
      showToast(
        err instanceof Error
          ? err.message
          : 'Không thể thêm từ vựng. Kiểm tra lại chính sách RLS trong Supabase!',
        'error'
      )
    } finally {
      setActionLoading(false)
    }
  }

  // Cập nhật từ vựng (Edit)
  const handleUpdateVocab = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingVocab) return

    try {
      setActionLoading(true)
      const formattedUrl = getEmbedYoutubeUrl(editingVocab.video_url.trim())
      const { error } = await supabase
        .from('vocabularies')
        .update({
          topic_id: editingVocab.topic_id,
          word: editingVocab.word.trim(),
          meaning: editingVocab.meaning.trim(),
          description: editingVocab.description?.trim() || null,
          video_url: formattedUrl,
        })
        .eq('id', editingVocab.id)

      if (error) throw error

      setVocabularies((prev) =>
        prev.map((v) => (v.id === editingVocab.id ? { ...editingVocab, video_url: formattedUrl } : v))
      )
      setEditingVocab(null)
      showToast(`Cập nhật từ "${editingVocab.word}" thành công!`, 'success')
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi cập nhật từ vựng.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Xóa mềm / Khôi phục từ vựng (Đổi trạng thái is_deleted)
  const handleToggleDelete = async (vocab: Vocabulary) => {
    const nextDeletedState = !vocab.is_deleted
    const actionName = nextDeletedState ? 'Xóa mềm' : 'Khôi phục'

    try {
      const { error } = await supabase
        .from('vocabularies')
        .update({ is_deleted: nextDeletedState })
        .eq('id', vocab.id)

      if (error) throw error

      setVocabularies((prev) =>
        prev.map((v) => (v.id === vocab.id ? { ...v, is_deleted: nextDeletedState } : v))
      )

      showToast(`${actionName} thành công từ "${vocab.word}"!`, 'success')
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : `Lỗi khi ${actionName.toLowerCase()} từ vựng.`, 'error')
    }
  }

  // Lọc danh sách từ vựng theo Search, Topic, Status
  const filteredVocabularies = useMemo(() => {
    return vocabularies.filter((v) => {
      // 1. Lọc theo từ khóa
      const matchQuery =
        v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.meaning.toLowerCase().includes(searchQuery.toLowerCase())

      // 2. Lọc theo chủ đề
      const matchTopic =
        selectedTopicFilter === 'ALL' || v.topic_id === selectedTopicFilter

      // 3. Lọc theo trạng thái xóa mềm
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && !v.is_deleted) ||
        (statusFilter === 'DELETED' && v.is_deleted)

      return matchQuery && matchTopic && matchStatus
    })
  }, [vocabularies, searchQuery, selectedTopicFilter, statusFilter])

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

  if (!authorized) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans antialiased text-gray-900">
      {/* Toast thông báo nổi phong cách SaaS */}
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

      {/* Page Heading & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Quản lý Nội dung & Bài học
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Quản trị danh mục chủ đề học tập và kho từ vựng ngôn ngữ ký hiệu
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-2xs transition active:scale-95 disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-gray-500' : 'text-gray-600'}`} />
            <span>Làm mới</span>
          </button>

          {/* Tab Selector */}
          <div className="inline-flex rounded-lg bg-gray-100 p-1 border border-gray-200">
            <button
              onClick={() => setActiveTab('vocab')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                activeTab === 'vocab'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Từ vựng ({vocabularies.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                activeTab === 'topics'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Chủ đề ({topics.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW METRICS CARDS (Style: Vercel / Stripe Data-driven)             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng chủ đề */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Tổng Chủ Đề
            </span>
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {loading ? '...' : topics.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Chủ đề học tập trên hệ thống
            </p>
          </div>
        </div>

        {/* Card 2: Tổng từ vựng */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Tổng Từ Vựng
            </span>
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {loading ? '...' : vocabularies.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Định dạng video và cử chỉ tay
            </p>
          </div>
        </div>

        {/* Card 3: Đang hiển thị */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Đang Hiển Thị
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600 tracking-tight">
              {loading ? '...' : vocabularies.filter((v) => !v.is_deleted).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Người dùng có thể truy cập
            </p>
          </div>
        </div>

        {/* Card 4: Đã xóa mềm */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Đã Ẩn / Xóa Mềm
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-bold text-rose-600 tracking-tight">
              {loading ? '...' : vocabularies.filter((v) => v.is_deleted).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Có thể khôi phục bất cứ lúc nào
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: QUẢN LÝ TỪ VỰNG                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'vocab' && (
        <div className="space-y-6">
          {/* Form Thêm Từ Vựng Mới */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Thêm Từ Vựng Mới
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Nhập thông tin từ và đường dẫn video thủ ngữ (YouTube hoặc file MP4)
                </p>
              </div>
            </div>

            <form onSubmit={handleAddVocab} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Chọn Topic */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Chủ đề thuộc về *
                  </label>
                  <select
                    value={newVocab.topic_id}
                    onChange={(e) => setNewVocab({ ...newVocab, topic_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  >
                    {topics.length === 0 && <option value="">Chưa có chủ đề nào</option>}
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} {t.is_free ? '(Miễn phí)' : '(Khóa VIP)'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Từ vựng */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Từ vựng (Word) *
                  </label>
                  <input
                    type="text"
                    value={newVocab.word}
                    onChange={(e) => setNewVocab({ ...newVocab, word: e.target.value })}
                    required
                    placeholder="VD: Cảm ơn, Xin chào..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 placeholder-gray-400"
                  />
                </div>

                {/* Nghĩa của từ */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Ý nghĩa (Meaning) *
                  </label>
                  <input
                    type="text"
                    value={newVocab.meaning}
                    onChange={(e) => setNewVocab({ ...newVocab, meaning: e.target.value })}
                    required
                    placeholder="VD: Bày tỏ sự biết ơn..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Link video */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Link video thủ ngữ (YouTube/MP4) *
                  </label>
                  <div className="relative">
                    <Video className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={newVocab.video_url}
                      onChange={(e) => setNewVocab({ ...newVocab, video_url: e.target.value })}
                      required
                      placeholder="https://www.youtube.com/embed/... hoặc https://youtu.be/..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Hướng dẫn thao tác tay */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Mô tả cử chỉ bàn tay (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={newVocab.description}
                    onChange={(e) => setNewVocab({ ...newVocab, description: e.target.value })}
                    placeholder="VD: Đưa tay phải lên ngang trán và vẫy nhẹ..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs shadow-sm transition active:scale-95 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm từ vựng vào bài</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Bảng Danh Sách Từ Vựng */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Filter Toolbar */}
            <div className="p-4 border-b border-gray-200 bg-white flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo từ vựng hoặc nghĩa..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                  <Filter className="w-3.5 h-3.5 text-gray-400" />
                  <span className="hidden sm:inline">Lọc:</span>
                </div>

                <select
                  value={selectedTopicFilter}
                  onChange={(e) => setSelectedTopicFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-900"
                >
                  <option value="ALL">Tất cả chủ đề</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-900"
                >
                  <option value="ALL">Mọi trạng thái</option>
                  <option value="ACTIVE">Đang hiển thị</option>
                  <option value="DELETED">Đã xóa mềm</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Từ vựng</th>
                    <th className="py-3 px-5">Ý nghĩa</th>
                    <th className="py-3 px-5">Chủ đề</th>
                    <th className="py-3 px-5">Video</th>
                    <th className="py-3 px-5 text-center">Trạng thái</th>
                    <th className="py-3 px-5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-gray-400">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-gray-600" />
                        <span>Đang tải danh sách từ vựng...</span>
                      </td>
                    </tr>
                  ) : filteredVocabularies.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-gray-500">
                        <div className="max-w-xs mx-auto space-y-1">
                          <BookOpen className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                          <p className="font-semibold text-gray-700">Không tìm thấy từ vựng nào</p>
                          <p className="text-xs text-gray-400">
                            Thử tìm kiếm với từ khóa khác hoặc thêm từ vựng mới.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredVocabularies.map((vocab) => {
                      const topicTitle = topicMap.get(vocab.topic_id) || 'Chủ đề không xác định'

                      return (
                        <tr
                          key={vocab.id}
                          className={`hover:bg-gray-50/80 transition-colors ${
                            vocab.is_deleted ? 'bg-rose-50/30' : ''
                          }`}
                        >
                          {/* Từ vựng */}
                          <td className="py-3.5 px-5">
                            <span className="font-semibold text-gray-900 text-sm">
                              {vocab.word}
                            </span>
                            {vocab.description && (
                              <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                                {vocab.description}
                              </p>
                            )}
                          </td>

                          {/* Nghĩa */}
                          <td className="py-3.5 px-5 text-gray-600">
                            {vocab.meaning}
                          </td>

                          {/* Chủ đề */}
                          <td className="py-3.5 px-5">
                            <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200 line-clamp-1 max-w-[200px]">
                              {topicTitle}
                            </span>
                          </td>

                          {/* Video */}
                          <td className="py-3.5 px-5">
                            <a
                              href={vocab.video_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:underline max-w-[160px] truncate"
                              title={vocab.video_url}
                            >
                              <ExternalLink className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                              <span className="truncate">{vocab.video_url}</span>
                            </a>
                          </td>

                          {/* Trạng thái */}
                          <td className="py-3.5 px-5 text-center">
                            {vocab.is_deleted ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-100 text-rose-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                <span>Đã xóa mềm</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                                <span>Đang hiển thị</span>
                              </span>
                            )}
                          </td>

                          {/* Thao tác */}
                          <td className="py-3.5 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingVocab(vocab)}
                                className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition active:scale-95"
                                title="Chỉnh sửa từ vựng"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleToggleDelete(vocab)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition active:scale-95 border ${
                                  vocab.is_deleted
                                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                    : 'bg-white hover:bg-rose-50 text-rose-600 border-gray-200 hover:border-rose-200'
                                }`}
                                title={vocab.is_deleted ? 'Khôi phục từ vựng này' : 'Xóa mềm từ vựng này'}
                              >
                                {vocab.is_deleted ? (
                                  <span className="inline-flex items-center gap-1">
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Khôi phục</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1">
                                    <Trash2 className="w-3 h-3" />
                                    <span>Xóa</span>
                                  </span>
                                )}
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
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: QUẢN LÝ CHỦ ĐỀ (TOPICS)                                            */}
      {/* ========================================================================= */}
      {activeTab === 'topics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Thêm Chủ Đề */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 p-6 shadow-sm h-fit">
            <div className="pb-4 mb-5 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Thêm Chủ Đề Mới
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Tạo chủ đề bài học mới cho hệ thống
              </p>
            </div>

            <form onSubmit={handleAddTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tên chủ đề (Title) *
                </label>
                <input
                  type="text"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                  required
                  placeholder="VD: Chủ đề 4: Động vật quen thuộc"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Mô tả ngắn
                </label>
                <textarea
                  rows={3}
                  value={newTopic.description}
                  onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                  placeholder="VD: Nhận biết ký hiệu các con vật quen thuộc quanh em..."
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 placeholder-gray-400"
                />
              </div>

              <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newTopic.is_free}
                    onChange={(e) => setNewTopic({ ...newTopic, is_free: e.target.checked })}
                    className="w-4 h-4 rounded text-gray-900 focus:ring-gray-900 border-gray-300"
                  />
                  <div>
                    <span className="text-xs font-semibold text-gray-900 block">
                      Chủ đề miễn phí (Free)
                    </span>
                    <span className="text-[11px] text-gray-500 block">
                      Nếu bỏ chọn, chỉ người dùng VIP mới có thể truy cập
                    </span>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tạo chủ đề</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Danh Sách Chủ Đề Hiện Có */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Danh sách các chủ đề hiện có
              </h3>
              <span className="text-xs font-medium text-gray-500">
                {topics.length} chủ đề
              </span>
            </div>

            <div className="space-y-3">
              {topics.map((t) => {
                const count = vocabularies.filter((v) => v.topic_id === t.id && !v.is_deleted).length

                return (
                  <div
                    key={t.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50 flex items-start justify-between gap-4 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{t.title}</h4>
                        {t.is_free ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Miễn phí
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            Khóa VIP
                          </span>
                        )}
                      </div>
                      {t.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">{t.description}</p>
                      )}
                      <p className="text-xs font-medium text-gray-600 mt-2">
                        {count} từ vựng đang hiển thị
                      </p>
                    </div>

                    <Link
                      href={`/topics/${t.id}`}
                      target="_blank"
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium transition inline-flex items-center gap-1.5 shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      <span>Xem bài</span>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POPUP / MODAL CHỈNH SỬA TỪ VỰNG (Enterprise SaaS Modal)                    */}
      {/* ========================================================================= */}
      {editingVocab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 p-6 shadow-2xl relative">
            <button
              onClick={() => setEditingVocab(null)}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center absolute top-5 right-5 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-900 flex items-center justify-center font-bold">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Chỉnh Sửa Từ Vựng
                </h3>
                <p className="text-xs text-gray-500">Cập nhật nội dung hoặc đổi link video thủ ngữ</p>
              </div>
            </div>

            <form onSubmit={handleUpdateVocab} className="space-y-4">
              {/* Chọn chủ đề */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Chủ đề
                </label>
                <select
                  value={editingVocab.topic_id}
                  onChange={(e) =>
                    setEditingVocab({ ...editingVocab, topic_id: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Từ vựng & Nghĩa */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Từ vựng *
                  </label>
                  <input
                    type="text"
                    value={editingVocab.word}
                    onChange={(e) =>
                      setEditingVocab({ ...editingVocab, word: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Ý nghĩa *
                  </label>
                  <input
                    type="text"
                    value={editingVocab.meaning}
                    onChange={(e) =>
                      setEditingVocab({ ...editingVocab, meaning: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>

              {/* Link video */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Link video URL (YouTube/MP4) *
                </label>
                <input
                  type="url"
                  value={editingVocab.video_url}
                  onChange={(e) =>
                    setEditingVocab({ ...editingVocab, video_url: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              {/* Mô tả ký hiệu */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Mô tả động tác thủ ngữ
                </label>
                <textarea
                  rows={3}
                  value={editingVocab.description || ''}
                  onChange={(e) =>
                    setEditingVocab({ ...editingVocab, description: e.target.value })
                  }
                  placeholder="Hướng dẫn cách làm ký hiệu tay..."
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2.5 justify-end pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingVocab(null)}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs shadow-sm transition active:scale-95 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang cập nhật...</span>
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
