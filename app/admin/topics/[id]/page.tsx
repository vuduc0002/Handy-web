'use client'

import { useState, useEffect, useMemo, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  RotateCcw,
  Search,
  ExternalLink,
  Loader2,
  Video,
  Check,
  X,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  Crown,
} from 'lucide-react'
import { getEmbedYoutubeUrl } from '@/lib/utils'
import ImageDropzone from '@/app/components/ImageDropzone'
import ImportExcelModal from '@/app/components/ImportExcelModal'

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
  illustration_url?: string | null
  gesture_image_url?: string | null
  is_deleted: boolean
  created_at: string
}

export default function AdminTopicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const resolvedParams = use(params)
  const topicId = resolvedParams.id

  const [checkingAuth, setCheckingAuth] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DELETED'>('ALL')

  // Modals state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [editingVocab, setEditingVocab] = useState<Vocabulary | null>(null)
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)

  // Form states - New Vocabulary
  const [newVocab, setNewVocab] = useState({
    word: '',
    meaning: '',
    description: '',
    video_url: '',
  })

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{
    text: string
    type: 'success' | 'error'
  } | null>(null)

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  // 1. Xác thực quyền Admin
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
          fetchTopicAndVocabs()
        }
      } catch (err) {
        console.error('Lỗi xác thực Admin:', err)
        router.push('/')
      }
    }

    verifyAdmin()

    return () => {
      isMounted = false
    }
  }, [router, topicId])

  // 2. Tải thông tin Topic và danh sách từ vựng thuộc Topic
  const fetchTopicAndVocabs = async () => {
    try {
      setLoading(true)

      const [topicRes, vocabsRes] = await Promise.all([
        supabase.from('topics').select('*').eq('id', topicId).maybeSingle(),
        supabase
          .from('vocabularies')
          .select('*')
          .eq('topic_id', topicId)
          .order('created_at', { ascending: false }),
      ])

      if (topicRes.error) throw topicRes.error
      if (vocabsRes.error) throw vocabsRes.error

      setTopic(topicRes.data)
      setVocabularies(vocabsRes.data || [])
    } catch (err: unknown) {
      console.error('Lỗi khi tải dữ liệu chủ đề:', err)
      showToast('Lỗi khi tải dữ liệu chủ đề', 'error')
    } finally {
      setLoading(false)
    }
  }

  // 3. Cập nhật state ảnh trực tiếp (AJAX)
  const handleImageUpdate = (
    vocabId: string,
    imageType: 'illustration' | 'gesture',
    url: string | null
  ) => {
    const key = imageType === 'illustration' ? 'illustration_url' : 'gesture_image_url'
    setVocabularies((prev) =>
      prev.map((v) => (v.id === vocabId ? { ...v, [key]: url } : v))
    )
    setEditingVocab((prev) =>
      prev && prev.id === vocabId ? { ...prev, [key]: url } : prev
    )
  }

  // 4. Thêm từ vựng mới
  const handleAddVocab = async (e: React.FormEvent) => {
    e.preventDefault()
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
          topic_id: topicId,
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
        word: '',
        meaning: '',
        description: '',
        video_url: '',
      })
      setIsAddFormOpen(false)
      showToast(`Đã thêm từ vựng "${data.word}" thành công!`, 'success')
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi thêm từ vựng', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // 5. Cập nhật từ vựng (Edit)
  const handleUpdateVocab = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingVocab) return

    try {
      setActionLoading(true)
      const formattedUrl = getEmbedYoutubeUrl(editingVocab.video_url.trim())

      const { error } = await supabase
        .from('vocabularies')
        .update({
          word: editingVocab.word.trim(),
          meaning: editingVocab.meaning.trim(),
          description: editingVocab.description?.trim() || null,
          video_url: formattedUrl,
        })
        .eq('id', editingVocab.id)

      if (error) throw error

      setVocabularies((prev) =>
        prev.map((v) =>
          v.id === editingVocab.id ? { ...editingVocab, video_url: formattedUrl } : v
        )
      )
      setEditingVocab(null)
      showToast(`Cập nhật từ "${editingVocab.word}" thành công!`, 'success')
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi cập nhật từ vựng.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // 6. Xóa mềm / Khôi phục
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

  // Lọc từ vựng theo Search & Status
  const filteredVocabularies = useMemo(() => {
    return vocabularies.filter((v) => {
      const matchQuery =
        v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.meaning.toLowerCase().includes(searchQuery.toLowerCase())

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && !v.is_deleted) ||
        (statusFilter === 'DELETED' && v.is_deleted)

      return matchQuery && matchStatus
    })
  }, [vocabularies, searchQuery, statusFilter])

  if (checkingAuth) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-800 animate-spin mb-3" />
        <p className="text-gray-500 font-semibold text-xs tracking-wide uppercase">
          Đang xác thực quyền quản trị...
        </p>
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans antialiased text-gray-900">
      {/* Toast thông báo nổi */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg border text-xs font-semibold ${
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

      {/* Header điều hướng & Tiêu đề trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Quản lý chung</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {topic ? topic.title : 'Quản Lý Từ Vựng Theo Chủ Đề'}
            </h1>
            {topic?.is_free ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Miễn phí
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-600" />
                <span>Khóa VIP</span>
              </span>
            )}
          </div>

          {topic?.description && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-3xl">
              {topic.description}
            </p>
          )}
        </div>

        {/* Nút hành động chính */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchTopicAndVocabs}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold border border-gray-300 shadow-xs transition cursor-pointer disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>

          {/* NÚT IMPORT EXCEL THEO YÊU CẦU */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            title="Import hàng loạt từ vựng từ file Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import Excel</span>
          </button>

          <button
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddFormOpen ? 'Đóng form thêm' : 'Thêm từ vựng'}</span>
          </button>
        </div>
      </div>

      {/* Form thêm từ vựng nhanh (Collapsible) */}
      {isAddFormOpen && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Thêm Từ Vựng Mới Vào Chủ Đề Này
            </h2>
            <button
              onClick={() => setIsAddFormOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAddVocab} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Từ vựng (Word) *
                </label>
                <input
                  type="text"
                  value={newVocab.word}
                  onChange={(e) => setNewVocab({ ...newVocab, word: e.target.value })}
                  required
                  placeholder="VD: Xin chào, Cảm ơn..."
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Ý nghĩa (Meaning) *
                </label>
                <input
                  type="text"
                  value={newVocab.meaning}
                  onChange={(e) => setNewVocab({ ...newVocab, meaning: e.target.value })}
                  required
                  placeholder="VD: Chào hỏi khi gặp gỡ..."
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Link video YouTube *
                </label>
                <div className="relative">
                  <Video className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={newVocab.video_url}
                    onChange={(e) => setNewVocab({ ...newVocab, video_url: e.target.value })}
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Mô tả cử chỉ bàn tay (Tùy chọn)
              </label>
              <textarea
                rows={2}
                value={newVocab.description}
                onChange={(e) => setNewVocab({ ...newVocab, description: e.target.value })}
                placeholder="Hướng dẫn cách làm ký hiệu tay..."
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsAddFormOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Lưu từ vựng</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bảng Danh Sách Từ Vựng Của Topic Này */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-white flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm từ vựng hoặc nghĩa..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900"
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

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-medium">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-900"
            >
              <option value="ALL">Tất cả ({vocabularies.length})</option>
              <option value="ACTIVE">Đang hiển thị</option>
              <option value="DELETED">Đã xóa mềm</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Từ vựng</th>
                <th className="py-3 px-4">Ý nghĩa</th>
                <th className="py-3 px-3 text-center">Ảnh Minh Họa</th>
                <th className="py-3 px-3 text-center">Ảnh Cử Chỉ</th>
                <th className="py-3 px-4">Video YouTube</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-gray-600" />
                    <span>Đang tải danh sách từ vựng...</span>
                  </td>
                </tr>
              ) : filteredVocabularies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <BookOpen className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                      <p className="font-semibold text-gray-700">Chưa có từ vựng nào</p>
                      <p className="text-xs text-gray-400">
                        Bấm <strong>&quot;Import Excel&quot;</strong> để đưa hàng loạt từ vựng vào hoặc bấm <strong>&quot;Thêm từ vựng&quot;</strong>.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVocabularies.map((vocab) => (
                  <tr
                    key={vocab.id}
                    className={`hover:bg-gray-50/80 transition-colors ${
                      vocab.is_deleted ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    {/* Từ vựng */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-gray-900 text-sm">
                        {vocab.word}
                      </span>
                      {vocab.description && (
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                          {vocab.description}
                        </p>
                      )}
                    </td>

                    {/* Ý nghĩa */}
                    <td className="py-3.5 px-4 text-gray-600">{vocab.meaning}</td>

                    {/* Kéo thả Ảnh Minh Họa */}
                    <td className="py-3 px-3 text-center align-middle">
                      <div className="flex justify-center">
                        <ImageDropzone
                          wordId={vocab.id}
                          imageType="illustration"
                          currentUrl={vocab.illustration_url}
                          onUploadSuccess={(url) => {
                            handleImageUpdate(vocab.id, 'illustration', url)
                            showToast(
                              url
                                ? `Đã ghép ảnh minh họa cho "${vocab.word}"`
                                : `Đã xóa ảnh minh họa của "${vocab.word}"`,
                              'success'
                            )
                          }}
                        />
                      </div>
                    </td>

                    {/* Kéo thả Ảnh Cử Chỉ */}
                    <td className="py-3 px-3 text-center align-middle">
                      <div className="flex justify-center">
                        <ImageDropzone
                          wordId={vocab.id}
                          imageType="gesture"
                          currentUrl={vocab.gesture_image_url}
                          onUploadSuccess={(url) => {
                            handleImageUpdate(vocab.id, 'gesture', url)
                            showToast(
                              url
                                ? `Đã ghép ảnh cử chỉ cho "${vocab.word}"`
                                : `Đã xóa ảnh cử chỉ của "${vocab.word}"`,
                              'success'
                            )
                          }}
                        />
                      </div>
                    </td>

                    {/* Link Video */}
                    <td className="py-3.5 px-4">
                      {vocab.video_url ? (
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
                      ) : (
                        <span className="text-gray-400 italic">Chưa có link</span>
                      )}
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3.5 px-4 text-center">
                      {vocab.is_deleted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-100 text-rose-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                          <span>Đã xóa</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                          <span>Hiển thị</span>
                        </span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingVocab(vocab)}
                          className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition active:scale-95 cursor-pointer"
                          title="Chỉnh sửa từ vựng"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleDelete(vocab)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition active:scale-95 border cursor-pointer ${
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL IMPORT EXCEL */}
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        topicId={topicId}
        topicTitle={topic?.title}
        onSuccess={(count) => {
          fetchTopicAndVocabs()
          showToast(`Đã import thành công ${count} từ vựng vào chủ đề!`, 'success')
        }}
        showToast={showToast}
      />

      {/* MODAL CHỈNH SỬA TỪ VỰNG */}
      {editingVocab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 p-6 shadow-2xl relative">
            <button
              onClick={() => setEditingVocab(null)}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center absolute top-5 right-5 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-900 flex items-center justify-center font-bold">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Chỉnh Sửa Từ Vựng</h3>
                <p className="text-xs text-gray-500">Cập nhật nội dung hoặc đổi link video thủ ngữ</p>
              </div>
            </div>

            <form onSubmit={handleUpdateVocab} className="space-y-4">
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

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Mô tả động tác thủ ngữ
                </label>
                <textarea
                  rows={2}
                  value={editingVocab.description || ''}
                  onChange={(e) =>
                    setEditingVocab({ ...editingVocab, description: e.target.value })
                  }
                  placeholder="Hướng dẫn cách làm ký hiệu tay..."
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              {/* Kéo thả ảnh trực quan trong modal */}
              <div className="pt-2 border-t border-gray-100">
                <span className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Hình ảnh trực quan
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                    <span className="block text-[11px] font-semibold text-gray-700 mb-2">
                      Ảnh Minh Họa
                    </span>
                    <div className="flex justify-center">
                      <ImageDropzone
                        wordId={editingVocab.id}
                        imageType="illustration"
                        currentUrl={editingVocab.illustration_url}
                        onUploadSuccess={(url) => {
                          handleImageUpdate(editingVocab.id, 'illustration', url)
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                    <span className="block text-[11px] font-semibold text-gray-700 mb-2">
                      Ảnh Cử Chỉ
                    </span>
                    <div className="flex justify-center">
                      <ImageDropzone
                        wordId={editingVocab.id}
                        imageType="gesture"
                        currentUrl={editingVocab.gesture_image_url}
                        onUploadSuccess={(url) => {
                          handleImageUpdate(editingVocab.id, 'gesture', url)
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 justify-end pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingVocab(null)}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 hover:bg-black text-white font-semibold text-xs shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
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
