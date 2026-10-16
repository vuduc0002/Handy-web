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
  Sparkles,
  ArrowLeft
} from 'lucide-react'

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
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 4500)
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
      showNotification('error', err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu.')
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
      showNotification('error', 'Vui lòng nhập tiêu đề chủ đề!')
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
      showNotification('success', `Đã thêm chủ đề "${data.title}" thành công!`)
    } catch (err: unknown) {
      showNotification(
        'error',
        err instanceof Error
          ? err.message
          : 'Không thể thêm chủ đề. Kiểm tra lại chính sách RLS trong Supabase!'
      )
    } finally {
      setActionLoading(false)
    }
  }

  // Thêm Vocabulary mới
  const handleAddVocab = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVocab.topic_id) {
      showNotification('error', 'Vui lòng chọn một chủ đề!')
      return
    }
    if (!newVocab.word.trim() || !newVocab.meaning.trim() || !newVocab.video_url.trim()) {
      showNotification('error', 'Vui lòng nhập đầy đủ Từ vựng, Ý nghĩa và Link video!')
      return
    }

    try {
      setActionLoading(true)
      const { data, error } = await supabase
        .from('vocabularies')
        .insert({
          topic_id: newVocab.topic_id,
          word: newVocab.word.trim(),
          meaning: newVocab.meaning.trim(),
          description: newVocab.description.trim() || null,
          video_url: newVocab.video_url.trim(),
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
      showNotification('success', `Đã thêm từ vựng "${data.word}" thành công!`)
    } catch (err: unknown) {
      showNotification(
        'error',
        err instanceof Error
          ? err.message
          : 'Không thể thêm từ vựng. Kiểm tra lại chính sách RLS trong Supabase!'
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
      const { error } = await supabase
        .from('vocabularies')
        .update({
          topic_id: editingVocab.topic_id,
          word: editingVocab.word.trim(),
          meaning: editingVocab.meaning.trim(),
          description: editingVocab.description?.trim() || null,
          video_url: editingVocab.video_url.trim(),
        })
        .eq('id', editingVocab.id)

      if (error) throw error

      setVocabularies((prev) =>
        prev.map((v) => (v.id === editingVocab.id ? { ...editingVocab } : v))
      )
      setEditingVocab(null)
      showNotification('success', `Cập nhật từ "${editingVocab.word}" thành công!`)
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Lỗi khi cập nhật từ vựng.')
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

      showNotification(
        'success',
        `${actionName} thành công từ "${vocab.word}"!`
      )
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : `Lỗi khi ${actionName.toLowerCase()} từ vựng.`)
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-600 font-extrabold text-base">
          Đang kiểm tra quyền quản trị viên...
        </p>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Toast thông báo nổi */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-bold transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
            feedback.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-red-600 text-white border-red-500'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <ShieldAlert className="w-5 h-5 shrink-0" />
          )}
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
              <span>⚡</span> Bảng Quản Trị HANDY
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Quản lý kho chủ đề học và danh sách từ vựng ngôn ngữ ký hiệu
          </p>
        </div>

        {/* Action Controls: Nút Quay lại Trang chủ & Tab switcher */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border-2 border-amber-300 hover:bg-amber-50 text-amber-900 font-extrabold text-xs shadow-sm transition active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-orange-500" />
            <span>Quay lại Trang chủ</span>
          </Link>

          {/* Tab switcher */}
          <div className="flex rounded-2xl bg-white p-1.5 border-2 border-amber-200 shadow-sm">
          <button
            onClick={() => setActiveTab('vocab')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all duration-200 ${
              activeTab === 'vocab'
                ? 'bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-md'
                : 'text-gray-600 hover:text-orange-500'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Quản lý Từ vựng ({vocabularies.length})
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all duration-200 ${
              activeTab === 'topics'
                ? 'bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-md'
                : 'text-gray-600 hover:text-orange-500'
            }`}
          >
            <Layers className="w-4 h-4" />
            Chủ đề học ({topics.length})
          </button>
        </div>
      </div>
    </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tổng chủ đề</p>
          <p className="text-3xl font-black text-gray-800 mt-1">{topics.length}</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tổng từ vựng</p>
          <p className="text-3xl font-black text-orange-500 mt-1">{vocabularies.length}</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border-2 border-emerald-200 shadow-sm">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Đang hiển thị</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">
            {vocabularies.filter((v) => !v.is_deleted).length}
          </p>
        </div>
        <div className="bg-white rounded-3xl p-5 border-2 border-red-200 shadow-sm">
          <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Đã xóa mềm</p>
          <p className="text-3xl font-black text-red-500 mt-1">
            {vocabularies.filter((v) => v.is_deleted).length}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: QUẢN LÝ TỪ VỰNG */}
      {/* ========================================================================= */}
      {activeTab === 'vocab' && (
        <div className="space-y-8">
          {/* FORM THÊM TỪ VỰNG MỚI */}
          <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-amber-100">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-800">Thêm Từ Vựng Mới</h2>
                <p className="text-xs text-gray-500">
                  Nhập thông tin từ và link video thủ ngữ (YouTube hoặc file MP4)
                </p>
              </div>
            </div>

            <form onSubmit={handleAddVocab} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Chọn Topic */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1.5">
                    Chủ đề thuộc về *
                  </label>
                  <select
                    value={newVocab.topic_id}
                    onChange={(e) => setNewVocab({ ...newVocab, topic_id: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-amber-50/70 border-2 border-amber-200 text-gray-800 text-sm font-semibold focus:outline-none focus:border-orange-400"
                  >
                    {topics.length === 0 && <option value="">Chưa có chủ đề nào</option>}
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} {t.is_free ? '(Miễn phí)' : '(VIP)'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Từ vựng */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1.5">
                    Từ vựng (Word) *
                  </label>
                  <input
                    type="text"
                    value={newVocab.word}
                    onChange={(e) => setNewVocab({ ...newVocab, word: e.target.value })}
                    required
                    placeholder="VD: Cảm ơn, Xin chào..."
                    className="w-full px-4 py-3 rounded-2xl bg-amber-50/70 border-2 border-amber-200 text-gray-800 text-sm font-semibold focus:outline-none focus:border-orange-400 placeholder-gray-400"
                  />
                </div>

                {/* Nghĩa của từ */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1.5">
                    Ý nghĩa (Meaning) *
                  </label>
                  <input
                    type="text"
                    value={newVocab.meaning}
                    onChange={(e) => setNewVocab({ ...newVocab, meaning: e.target.value })}
                    required
                    placeholder="VD: Bày tỏ sự biết ơn..."
                    className="w-full px-4 py-3 rounded-2xl bg-amber-50/70 border-2 border-amber-200 text-gray-800 text-sm font-semibold focus:outline-none focus:border-orange-400 placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Link video */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1.5">
                    Link video thủ ngữ (YouTube/MP4) *
                  </label>
                  <div className="relative">
                    <Video className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={newVocab.video_url}
                      onChange={(e) => setNewVocab({ ...newVocab, video_url: e.target.value })}
                      required
                      placeholder="https://www.youtube.com/embed/... hoặc https://youtu.be/..."
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-amber-50/70 border-2 border-amber-200 text-gray-800 text-sm font-semibold focus:outline-none focus:border-orange-400 placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Hướng dẫn thao tác tay */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1.5">
                    Mô tả cử chỉ bàn tay (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={newVocab.description}
                    onChange={(e) => setNewVocab({ ...newVocab, description: e.target.value })}
                    placeholder="VD: Đưa tay phải lên ngang trán và vẫy nhẹ..."
                    className="w-full px-4 py-3 rounded-2xl bg-amber-50/70 border-2 border-amber-200 text-gray-800 text-sm font-semibold focus:outline-none focus:border-orange-400 placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-md shadow-amber-200 transition active:scale-95 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Thêm từ vựng vào bài
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* BẢNG DANH SÁCH TỪ VỰNG */}
          <div className="bg-white rounded-3xl border-2 border-amber-200 shadow-sm overflow-hidden">
            {/* Thanh tìm kiếm và bộ lọc */}
            <div className="p-5 border-b border-amber-100 bg-amber-50/40 flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Input tìm kiếm */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo từ hoặc nghĩa..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border-2 border-amber-200 text-gray-800 text-xs font-semibold focus:outline-none focus:border-orange-400"
                />
              </div>

              {/* Bộ lọc Topic & Status */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Lọc:</span>
                </div>

                <select
                  value={selectedTopicFilter}
                  onChange={(e) => setSelectedTopicFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs font-bold text-gray-700 focus:outline-none focus:border-orange-400"
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
                  className="px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs font-bold text-gray-700 focus:outline-none focus:border-orange-400"
                >
                  <option value="ALL">Mọi trạng thái</option>
                  <option value="ACTIVE">Chỉ từ đang hiển thị</option>
                  <option value="DELETED">Chỉ từ đã xóa mềm</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-amber-100/50 text-gray-700 text-xs font-extrabold uppercase tracking-wider border-b border-amber-200">
                    <th className="py-4 px-6">Từ vựng</th>
                    <th className="py-4 px-6">Ý nghĩa</th>
                    <th className="py-4 px-6">Chủ đề</th>
                    <th className="py-4 px-6">Video URL</th>
                    <th className="py-4 px-6 text-center">Trạng thái</th>
                    <th className="py-4 px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-400" />
                        Đang tải danh sách từ vựng...
                      </td>
                    </tr>
                  ) : filteredVocabularies.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        Không tìm thấy từ vựng nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredVocabularies.map((vocab) => {
                      const topicTitle = topicMap.get(vocab.topic_id) || 'Chủ đề không xác định'

                      return (
                        <tr
                          key={vocab.id}
                          className={`hover:bg-amber-50/50 transition ${
                            vocab.is_deleted ? 'bg-red-50/30 opacity-70' : ''
                          }`}
                        >
                          {/* Từ vựng */}
                          <td className="py-4 px-6 font-extrabold text-gray-800">
                            <span className="text-base">{vocab.word}</span>
                            {vocab.description && (
                              <p className="text-xs font-normal text-gray-400 mt-0.5 line-clamp-1">
                                {vocab.description}
                              </p>
                            )}
                          </td>

                          {/* Nghĩa */}
                          <td className="py-4 px-6 font-medium text-gray-600">
                            {vocab.meaning}
                          </td>

                          {/* Chủ đề */}
                          <td className="py-4 px-6">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 line-clamp-1 max-w-[200px]">
                              {topicTitle}
                            </span>
                          </td>

                          {/* Video */}
                          <td className="py-4 px-6">
                            <a
                              href={vocab.video_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600 hover:underline max-w-[180px] truncate"
                              title={vocab.video_url}
                            >
                              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{vocab.video_url}</span>
                            </a>
                          </td>

                          {/* Trạng thái xóa mềm */}
                          <td className="py-4 px-6 text-center">
                            {vocab.is_deleted ? (
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-600 border border-red-200">
                                Đã xóa mềm
                              </span>
                            ) : (
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                Đang hiển thị
                              </span>
                            )}
                          </td>

                          {/* Nút hành động */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Nút Edit */}
                              <button
                                onClick={() => setEditingVocab(vocab)}
                                className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 transition active:scale-95"
                                title="Chỉnh sửa từ vựng"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Nút Xóa mềm / Khôi phục */}
                              <button
                                onClick={() => handleToggleDelete(vocab)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 ${
                                  vocab.is_deleted
                                    ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                                    : 'bg-red-100 hover:bg-red-200 text-red-600'
                                }`}
                                title={vocab.is_deleted ? 'Khôi phục từ này' : 'Xóa mềm từ này'}
                              >
                                {vocab.is_deleted ? (
                                  <>
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Khôi phục
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Xóa mềm
                                  </>
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
      {/* TAB 2: QUẢN LÝ CHỦ ĐỀ (TOPICS) */}
      {/* ========================================================================= */}
      {activeTab === 'topics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* FORM THÊM CHỦ ĐỀ */}
          <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-amber-300 p-6 md:p-8 shadow-sm h-fit">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-amber-100">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-800">Thêm Chủ Đề Mới</h2>
                <p className="text-xs text-gray-500">Tạo chủ đề bài học mới cho hệ thống</p>
              </div>
            </div>

            <form onSubmit={handleAddTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1.5">
                  Tên chủ đề (Title) *
                </label>
                <input
                  type="text"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                  required
                  placeholder="VD: Chủ đề 4: Động vật quen thuộc"
                  className="w-full px-4 py-3 rounded-2xl bg-amber-50/70 border-2 border-amber-200 text-gray-800 text-sm font-semibold focus:outline-none focus:border-orange-400 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1.5">
                  Mô tả ngắn
                </label>
                <textarea
                  rows={3}
                  value={newTopic.description}
                  onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                  placeholder="VD: Nhận biết ký hiệu các con vật quen thuộc quanh em..."
                  className="w-full px-4 py-3 rounded-2xl bg-amber-50/70 border-2 border-amber-200 text-gray-800 text-sm font-semibold focus:outline-none focus:border-orange-400 placeholder-gray-400"
                />
              </div>

              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newTopic.is_free}
                    onChange={(e) => setNewTopic({ ...newTopic, is_free: e.target.checked })}
                    className="w-5 h-5 rounded-lg text-orange-500 focus:ring-orange-400 border-amber-300"
                  />
                  <div>
                    <span className="text-sm font-extrabold text-gray-800 block">
                      Chủ đề miễn phí (Free)
                    </span>
                    <span className="text-xs text-gray-500 block">
                      Nếu bỏ chọn, chỉ người dùng VIP mới có thể truy cập
                    </span>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-md transition active:scale-95 disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Tạo chủ đề
                  </>
                )}
              </button>
            </form>
          </div>

          {/* DANH SÁCH CHỦ ĐỀ HIỆN CÓ */}
          <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-amber-200 p-6 shadow-sm">
            <h3 className="font-extrabold text-gray-800 text-lg mb-4 flex items-center justify-between">
              <span>Danh sách các chủ đề hiện có</span>
              <span className="text-xs font-bold text-gray-400">
                {topics.length} chủ đề
              </span>
            </h3>

            <div className="space-y-3">
              {topics.map((t) => {
                const count = vocabularies.filter((v) => v.topic_id === t.id && !v.is_deleted).length

                return (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl border-2 border-amber-100 hover:border-amber-200 bg-amber-50/30 flex items-start justify-between gap-4 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-extrabold text-gray-800 text-base">{t.title}</h4>
                        {t.is_free ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700">
                            Miễn phí
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-700">
                            Khóa VIP
                          </span>
                        )}
                      </div>
                      {t.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">{t.description}</p>
                      )}
                      <p className="text-xs font-bold text-orange-500 mt-2">
                        {count} từ vựng đang hiển thị
                      </p>
                    </div>

                    <Link
                      href={`/topics/${t.id}`}
                      target="_blank"
                      className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 hover:bg-amber-100 text-amber-800 text-xs font-bold transition flex items-center gap-1 shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Xem bài
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POPUP / MODAL CHỈNH SỬA TỪ VỰNG (EDIT POPUP) */}
      {/* ========================================================================= */}
      {editingVocab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl border-2 border-amber-300 p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setEditingVocab(null)}
              className="w-9 h-9 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 flex items-center justify-center absolute top-5 right-5 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-orange-600 flex items-center justify-center font-bold">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-gray-800">
                  Chỉnh Sửa Từ Vựng
                </h3>
                <p className="text-xs text-gray-500">Cập nhật nội dung hoặc đổi link video</p>
              </div>
            </div>

            <form onSubmit={handleUpdateVocab} className="space-y-4">
              {/* Chọn chủ đề */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">
                  Chủ đề
                </label>
                <select
                  value={editingVocab.topic_id}
                  onChange={(e) =>
                    setEditingVocab({ ...editingVocab, topic_id: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-amber-50/70 border-2 border-amber-200 text-gray-800 text-sm font-semibold focus:outline-none focus:border-orange-400"
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
                  <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">
                    Từ vựng *
                  </label>
                  <input
                    type="text"
                    value={editingVocab.word}
                    onChange={(e) =>
                      setEditingVocab({ ...editingVocab, word: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2.5 rounded-2xl bg-amber-50/70 border-2 border-amber-200 text-gray-800 text-sm font-semibold focus:outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">
                    Ý nghĩa *
                  </label>
                  <input
                    type="text"
                    value={editingVocab.meaning}
                    onChange={(e) =>
                      setEditingVocab({ ...editingVocab, meaning: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2.5 rounded-2xl bg-amber-50/70 border-2 border-amber-200 text-gray-800 text-sm font-semibold focus:outline-none focus:border-orange-400"
                  />
                </div>
              </div>

              {/* Link video */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">
                  Link video URL (YouTube/MP4) *
                </label>
                <input
                  type="url"
                  value={editingVocab.video_url}
                  onChange={(e) =>
                    setEditingVocab({ ...editingVocab, video_url: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-amber-50/70 border-2 border-amber-200 text-gray-800 text-sm font-semibold focus:outline-none focus:border-orange-400"
                />
              </div>

              {/* Mô tả ký hiệu */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">
                  Mô tả động tác thủ ngữ
                </label>
                <textarea
                  rows={3}
                  value={editingVocab.description || ''}
                  onChange={(e) =>
                    setEditingVocab({ ...editingVocab, description: e.target.value })
                  }
                  placeholder="Hướng dẫn cách làm ký hiệu tay..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-amber-50/70 border-2 border-amber-200 text-gray-800 text-sm font-semibold focus:outline-none focus:border-orange-400"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setEditingVocab(null)}
                  className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-md transition active:scale-95 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang cập nhật...
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
