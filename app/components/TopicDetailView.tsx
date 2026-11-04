'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import {
  ArrowLeft,
  Volume2,
  Lock,
  Crown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Hand,
  Check,
  CheckCircle2,
  Search,
  BookOpen,
  QrCode,
  BrainCircuit,
  ClipboardCheck,
  Users,
  Smile,
  Activity,
} from 'lucide-react'
import { getEmbedYoutubeUrl } from '@/lib/utils'
import VideoQuizModal from '@/app/components/VideoQuizModal'
import { isVipProfile } from '@/lib/types'
import { toast } from '@/lib/toast'

export interface Vocabulary {
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

export interface Topic {
  id: string
  title: string
  description: string | null
  is_free: boolean
}

interface TopicDetailViewProps {
  topicId: string
  initialTopic: Topic | null
  initialVocabularies: Vocabulary[]
  otherTopics?: Topic[]
}

const DEFAULT_OTHER_TOPICS: Topic[] = [
  {
    id: 'other-1',
    title: 'Gia đình & Người thân',
    description: 'Học các ký hiệu gọi tên thành viên trong gia đình và những người thân quen.',
    is_free: false,
  },
  {
    id: 'other-2',
    title: 'Cảm xúc & Trạng thái',
    description: 'Diễn tả niềm vui, nỗi buồn và những trạng thái quen thuộc bằng ký hiệu.',
    is_free: false,
  },
  {
    id: 'other-3',
    title: 'Hoạt động hằng ngày',
    description: 'Ký hiệu cho những việc làm quen thuộc trong ngày, từ thức dậy đến đi ngủ.',
    is_free: false,
  },
]

const CARD_GRADIENTS = [
  'linear-gradient(135deg,#5CB0FF 0%,#1A6FE0 100%)',
  'linear-gradient(135deg,#B48CF0 0%,#7B4FD0 100%)',
  'linear-gradient(135deg,#FFE066 0%,#F7A21B 100%)',
  'linear-gradient(135deg,#FFB36B 0%,#F0436A 100%)',
]

const CARD_ICONS = [Users, Smile, Activity, Hand]

export default function TopicDetailView({
  topicId,
  initialTopic,
  initialVocabularies,
  otherTopics = [],
}: TopicDetailViewProps) {
  const router = useRouter()
  const [topic] = useState<Topic | null>(initialTopic)
  const [vocabularies] = useState<Vocabulary[]>(initialVocabularies)
  const [selectedVocab, setSelectedVocab] = useState<Vocabulary | null>(
    initialVocabularies.length > 0 ? initialVocabularies[0] : null
  )
  const [isLocked, setIsLocked] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(false)
  const [isUserVip, setIsUserVip] = useState(false)
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false)
  const [vocabSearch, setVocabSearch] = useState('')
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set())

  // Video refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Load learned state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`learned-vocab-${topicId}`)
      if (stored) {
        setLearnedIds(new Set(JSON.parse(stored)))
      }
    } catch {
      // ignore
    }
  }, [topicId])

  const toggleLearned = (id: string) => {
    setLearnedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      try {
        localStorage.setItem(`learned-vocab-${topicId}`, JSON.stringify(Array.from(next)))
      } catch {
        // ignore
      }
      return next
    })
  }

  // Tự động pause video nền khi mở chế độ kiểm tra Quiz
  useEffect(() => {
    if (isQuizModalOpen) {
      if (videoRef.current) {
        videoRef.current.pause()
      }
      if (iframeRef.current?.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
            '*'
          )
        } catch {
          // Bỏ qua cross-origin error
        }
      }
    }
  }, [isQuizModalOpen])

  // Kiểm tra quyền VIP và trạng thái người dùng
  useEffect(() => {
    let isMounted = true
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        if (isMounted) {
          setIsUserVip(false)
          if (initialTopic && !initialTopic.is_free) {
            setIsLocked(true)
            setCheckingAccess(false)
            toast.error('Bạn cần nâng cấp VIP để xem nội dung này')
            router.replace('/pricing')
          }
        }
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, is_premium, vip_until, role, email, plan_type')
        .eq('id', user.id)
        .maybeSingle()

      if (isMounted) {
        const hasAccess = isVipProfile(profile)
        setIsUserVip(hasAccess)
        if (initialTopic && !initialTopic.is_free) {
          if (!hasAccess) {
            setIsLocked(true)
            toast.error('Bạn cần nâng cấp VIP để xem nội dung này')
            router.replace('/pricing')
          } else {
            setIsLocked(false)
          }
          setCheckingAccess(false)
        }
      }
    })
    return () => {
      isMounted = false
    }
  }, [initialTopic, router])

  // Danh sách 3 chủ đề tiếp theo hiển thị ở cuối trang
  const displayOtherTopics = useMemo(() => {
    if (!otherTopics || otherTopics.length === 0) {
      return DEFAULT_OTHER_TOPICS
    }
    if (otherTopics.length >= 3) {
      return otherTopics.slice(0, 3)
    }
    const filled = [...otherTopics]
    for (const def of DEFAULT_OTHER_TOPICS) {
      if (filled.length >= 3) break
      if (!filled.some((t) => t.id === def.id || t.title === def.title)) {
        filled.push(def)
      }
    }
    return filled
  }, [otherTopics])

  // Phát âm từ vựng bằng Web Speech API
  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'vi-VN'
      utterance.rate = 0.85
      window.speechSynthesis.speak(utterance)
    }
  }

  // Điều hướng từ vựng Trước / Sau
  const currentIndex = vocabularies.findIndex((v) => v.id === selectedVocab?.id)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < vocabularies.length - 1

  const handlePrevWord = () => {
    if (hasPrev) {
      setSelectedVocab(vocabularies[currentIndex - 1])
    }
  }

  const handleNextWord = () => {
    if (hasNext) {
      setSelectedVocab(vocabularies[currentIndex + 1])
    }
  }

  // Filter vocabularies for sidebar
  const filteredVocabs = useMemo(() => {
    if (!vocabSearch.trim()) return vocabularies
    const q = vocabSearch.toLowerCase().trim()
    return vocabularies.filter(
      (v) => v.word.toLowerCase().includes(q) || v.meaning.toLowerCase().includes(q)
    )
  }, [vocabularies, vocabSearch])

  // Tiến độ học tập
  const learnedCount = vocabularies.filter((v) => learnedIds.has(v.id)).length
  const progressPct =
    vocabularies.length > 0
      ? Math.round((learnedCount / vocabularies.length) * 100)
      : 0

  if (checkingAccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-[#EAF4FF] text-[#1A8CFF] flex items-center justify-center mb-4 animate-pulse">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-[#1E1E1E] text-lg mb-1">
          Đang kiểm tra quyền truy cập...
        </h3>
        <p className="text-[#6B6B6B] text-sm">Vui lòng chờ trong giây lát.</p>
      </div>
    )
  }

  if (isLocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border-2 border-[#FFE3EA] p-8 text-center shadow-[0_20px_48px_rgba(20,30,60,0.08)]">
          <div className="w-18 h-18 rounded-3xl bg-[#FFF0F3] text-[#F0436A] flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Lock className="w-9 h-9" />
          </div>
          <span className="inline-block text-xs font-bold text-[#9A5B00] bg-[#FFF1C9] px-3.5 py-1 rounded-full uppercase tracking-wider mb-2">
            Nội dung VIP
          </span>
          <h2 className="text-2xl font-bold text-[#1E1E1E] mb-2">
            {topic?.title || 'Chủ đề bị khóa'}
          </h2>
          <p className="text-[#4A4A4A] text-sm mb-6 leading-relaxed">
            Chủ đề này chỉ dành riêng cho tài khoản đã nâng cấp VIP. Hãy nâng cấp để mở khóa toàn bộ!
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/pricing')}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#0050B3] to-[#1A8CFF] text-white font-bold text-sm shadow-md transition hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              Nâng cấp VIP ngay
            </button>
            <Link
              href="/topics"
              className="w-full py-3 rounded-full bg-[#F4F6FA] hover:bg-[#EAEFF7] text-[#4A4A4A] font-semibold text-sm transition text-center"
            >
              ← Xem chủ đề khác
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
        <div className="max-w-md bg-white rounded-3xl border border-[#ECEEF3] p-8 shadow-sm">
          <h3 className="font-bold text-[#1E1E1E] text-xl mb-2">Không tìm thấy chủ đề</h3>
          <p className="text-[#6B6B6B] text-sm mb-6">Chủ đề bài học này không tồn tại hoặc đã bị xóa.</p>
          <Link
            href="/topics"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1A8CFF] text-white font-bold text-sm shadow transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Xem các chủ đề khác
          </Link>
        </div>
      </div>
    )
  }

  const isMp4 = selectedVocab?.video_url?.toLowerCase().endsWith('.mp4')
  const isSelectedLearned = selectedVocab ? learnedIds.has(selectedVocab.id) : false

  return (
    <div className="min-h-screen bg-white">
      {/* 01 BANNER CHI TIẾT CHỦ ĐỀ CHUẨN HANDY V2 */}
      <section className="relative overflow-hidden bg-[radial-gradient(45%_80%_at_100%_0%,#FFE7D6_0%,rgba(255,231,214,0)_70%),radial-gradient(40%_70%_at_0%_100%,#E2F0FF_0%,rgba(226,240,255,0)_70%),#FFFAF7] border-b border-[#F2EAE4]">
        {/* Decorative elements */}
        <span
          aria-hidden="true"
          className="absolute right-[7%] top-[56px] w-4 h-4 rounded-full bg-[#F9C31F] opacity-80 pointer-events-none"
        />
        <span
          aria-hidden="true"
          className="absolute right-[14%] bottom-[48px] w-7 h-7 rounded-full border-4 border-[#1A8CFF] opacity-75 pointer-events-none"
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 md:py-12 flex flex-col gap-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 flex-wrap text-sm text-[#6B6B6B]">
            <Link href="/" className="hover:text-[#1A8CFF] transition-colors">
              Trang chủ
            </Link>
            <span className="text-[#A0A0A0]">/</span>
            <Link href="/topics" className="hover:text-[#1A8CFF] transition-colors">
              Chủ đề
            </Link>
            <span className="text-[#A0A0A0]">/</span>
            <span className="text-[#1A8CFF] font-semibold">{topic.title}</span>
          </nav>

          {/* Header Main: Icon + Topic Info + Progress Box */}
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div className="flex items-start sm:items-center gap-4 sm:gap-6 flex-1 min-w-[280px]">
              {/* Rotating Gradient Icon Box */}
              <div className="flex-none w-18 h-18 sm:w-20 sm:h-20 rounded-[24px] bg-gradient-to-br from-[#FFB36B] to-[#F0436A] text-white flex items-center justify-center shadow-[0_16px_32px_rgba(240,67,106,0.28)] -rotate-3">
                <Hand className="w-9 h-9 sm:w-10 sm:h-10 stroke-[2.2]" />
              </div>

              <div className="flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-[#4A4A4A] border border-[#F1E4DC] shadow-xs">
                    {vocabularies.length} từ vựng
                  </span>
                  {topic.is_free ? (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#E3F7EE] text-[#0C8558]">
                      Miễn phí
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FFF1C9] text-[#9A5B00] flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 fill-[#F7A21B] text-[#F7A21B]" /> VIP
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E1E1E] tracking-tight leading-tight">
                  {topic.title}
                </h1>

                {topic.description && (
                  <p className="text-sm sm:text-base text-[#4A4A4A] max-w-xl line-clamp-2">
                    {topic.description}
                  </p>
                )}
              </div>
            </div>

            {/* Progress Card on right */}
            <div className="flex flex-col gap-2.5 p-5 rounded-[20px] bg-white shadow-[0_14px_36px_rgba(20,30,60,0.08)] border border-[#EBEFF5] min-w-[260px] w-full sm:w-auto">
              <div className="flex justify-between items-baseline gap-4">
                <span className="text-sm font-semibold text-[#1E1E1E]">Tiến độ của bạn</span>
                <span className="text-sm font-bold text-[#1A8CFF]">
                  {learnedCount}/{vocabularies.length} từ ({progressPct}%)
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-[#EEF1F6] overflow-hidden">
                <div
                  style={{ width: `${progressPct}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-[#1A8CFF] to-[#17A673] transition-all duration-500"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={`/practice/${topic.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF4FF] hover:bg-[#1A8CFF] text-[#1A8CFF] hover:text-white text-xs font-semibold transition-all"
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>Luyện tập</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsQuizModalOpen(true)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF0F3] hover:bg-[#F0436A] text-[#F0436A] hover:text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  <span>Kiểm tra</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02 KHU VỰC HỌC KÝ HIỆU CHÍNH (2 Cột) */}
      <section className="max-w-6xl mx-auto px-6 py-10 md:py-14">
        {vocabularies.length === 0 ? (
          <div className="text-center py-16 bg-[#F7FAFF] rounded-[24px] border border-[#E3ECF8] p-8">
            <Sparkles className="w-12 h-12 text-[#1A8CFF] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#1E1E1E] mb-1">Chưa có từ vựng nào</h3>
            <p className="text-sm text-[#6B6B6B] mb-6">Chủ đề này đang được cập nhật thêm nội dung.</p>
            <Link
              href="/topics"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1A8CFF] text-white font-semibold text-sm"
            >
              ← Chọn chủ đề khác
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* CỘT TRÁI (8 cols): Video Player + Concepts & Actions */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {selectedVocab && (
                <>
                  {/* Video & Thumbnails Container */}
                  <div className="flex flex-col sm:flex-row gap-3.5 items-stretch">
                    {/* 2 Ảnh nhỏ: Minh họa (illustration_url) & Cử chỉ tay (gesture_image_url) */}
                    <div className="w-full sm:w-36 md:w-40 flex flex-row sm:flex-col justify-center gap-3 shrink-0">
                      {/* Ảnh minh họa */}
                      <div className="relative flex-1 sm:flex-none aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#F4F9FF] to-[#FFF3F6] border-[1.5px] border-[#E3EAF5] shadow-xs group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedVocab.illustration_url || '/assets/ctd-hands-dark.png'}
                          alt={`Minh họa ${selectedVocab.word}`}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/assets/ctd-hands-dark.png'
                          }}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className="absolute bottom-1.5 left-1.5 right-1.5 text-center text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs py-0.5 px-1.5 rounded-md pointer-events-none">
                          Ảnh minh họa
                        </span>
                      </div>

                      {/* Ảnh cử chỉ */}
                      <div className="relative flex-1 sm:flex-none aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#F4F9FF] to-[#FFF3F6] border-[1.5px] border-[#E3EAF5] shadow-xs group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedVocab.gesture_image_url || '/assets/ctd-hands-rings.png'}
                          alt={`Cử chỉ ${selectedVocab.word}`}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/assets/ctd-hands-rings.png'
                          }}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className="absolute bottom-1.5 left-1.5 right-1.5 text-center text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs py-0.5 px-1.5 rounded-md pointer-events-none">
                          Ảnh cử chỉ
                        </span>
                      </div>
                    </div>

                    {/* Video Player Box */}
                    <div className="relative flex-1 min-w-0 aspect-video rounded-[24px] overflow-hidden bg-black shadow-[0_20px_44px_rgba(15,42,92,0.22)] border-2 border-[#1A8CFF]/20">
                      {isMp4 ? (
                        <video
                          ref={videoRef}
                          key={selectedVocab.id}
                          src={selectedVocab.video_url}
                          controls
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <iframe
                          ref={iframeRef}
                          key={selectedVocab.id}
                          src={getEmbedYoutubeUrl(selectedVocab.video_url)}
                          title={selectedVocab.word}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      )}
                    </div>
                  </div>

                  {/* Controls Bar: Prev - Learned - Speak - Next */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={handlePrevWord}
                      disabled={!hasPrev}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#E3E7EE] bg-white text-[#1E1E1E] font-semibold text-sm hover:border-[#1A8CFF] hover:text-[#1A8CFF] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Từ trước</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {/* Mark learned toggle */}
                      <button
                        type="button"
                        onClick={() => toggleLearned(selectedVocab.id)}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition cursor-pointer ${
                          isSelectedLearned
                            ? 'bg-[#E3F7EE] text-[#0C8558] border-[#9ADBC0]'
                            : 'bg-white text-[#4A4A4A] border-[#E3E7EE] hover:border-[#17A673] hover:text-[#17A673]'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>{isSelectedLearned ? 'Đã thuộc' : 'Đánh dấu đã thuộc'}</span>
                      </button>

                      {/* Speak pronunciation */}
                      <button
                        type="button"
                        onClick={() => speakWord(selectedVocab.word)}
                        title="Nghe phát âm"
                        className="w-10 h-10 rounded-full border border-[#BFDDFF] bg-[#EAF4FF] hover:bg-[#1A8CFF] text-[#1A8CFF] hover:text-white flex items-center justify-center transition cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextWord}
                      disabled={!hasNext}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#0050B3] to-[#1A8CFF] text-white font-semibold text-sm hover:opacity-95 shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <span>Từ tiếp theo</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Word Header & Meaning Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Card 1: Từ vựng & Giải nghĩa */}
                    <div className="flex flex-col gap-2.5 p-6 rounded-[20px] bg-[#F4F9FF] border border-[#DCEBFC]">
                      <span className="flex items-center gap-2 text-xs font-bold text-[#1A8CFF] uppercase tracking-wider">
                        <BookOpen className="w-4 h-4" />
                        Từ vựng &amp; Giải nghĩa
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E]">
                        {selectedVocab.word}
                      </h2>
                      <p className="text-base text-[#4A4A4A] leading-relaxed">
                        {selectedVocab.meaning}
                      </p>
                    </div>

                    {/* Card 2: Hướng dẫn ký hiệu tay */}
                    <div className="flex flex-col gap-2.5 p-6 rounded-[20px] bg-[#FFF5F7] border border-[#F9C4D1]">
                      <span className="flex items-center gap-2 text-xs font-bold text-[#F0436A] uppercase tracking-wider">
                        <Hand className="w-4 h-4" />
                        Ký hiệu cử chỉ tay
                      </span>
                      <p className="text-sm sm:text-base text-[#4A4A4A] leading-relaxed">
                        {selectedVocab.description ||
                          'Quan sát kỹ khẩu hình miệng và các chuyển động của ngón tay trên video để thực hiện theo.'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* CỘT PHẢI (4 cols): Danh sách từ vựng Sidebar */}
            <aside className="lg:col-span-4 sticky top-24 flex flex-col gap-4 p-5 sm:p-6 rounded-[24px] bg-white border border-[#ECEEF3] shadow-[0_14px_36px_rgba(20,30,60,0.06)]">
              <div className="flex justify-between items-baseline gap-2">
                <h3 className="font-bold text-lg text-[#1E1E1E]">Ký hiệu trong chủ đề</h3>
                <span className="text-xs text-[#6B6B6B] font-medium">
                  {vocabularies.length} từ
                </span>
              </div>

              {/* Lọc ký hiệu */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F4F6FA] border border-transparent focus-within:border-[#1A8CFF] focus-within:bg-white transition-all">
                <Search className="w-4 h-4 text-[#8A8F99] shrink-0" />
                <input
                  type="text"
                  value={vocabSearch}
                  onChange={(e) => setVocabSearch(e.target.value)}
                  placeholder="Lọc từ vựng..."
                  className="flex-1 bg-transparent text-sm text-[#1E1E1E] placeholder-[#8A8F99] outline-none"
                />
              </div>

              {/* Scrollable list */}
              <div className="flex flex-col gap-1.5 max-h-[460px] overflow-y-auto pr-1">
                {filteredVocabs.map((vocab, idx) => {
                  const isSelected = selectedVocab?.id === vocab.id
                  const isLearned = learnedIds.has(vocab.id)

                  return (
                    <button
                      key={vocab.id}
                      type="button"
                      onClick={() => setSelectedVocab(vocab)}
                      className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#EAF4FF] border border-[#9CCBFF] text-[#0B6FE0]'
                          : 'bg-white hover:bg-[#F7FAFF] border border-transparent text-[#1E1E1E]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            isSelected
                              ? 'bg-[#1A8CFF] text-white'
                              : 'bg-[#F1F3F7] text-[#6B6B6B]'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-sm font-bold truncate">
                          {vocab.word}
                        </span>
                      </div>

                      {isLearned && (
                        <span
                          title="Đã thuộc"
                          className="w-5 h-5 rounded-full bg-[#17A673] text-white flex items-center justify-center shrink-0"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#EEF1F6]">
                <Link
                  href={`/practice/${topic.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#EAF4FF] hover:bg-[#1A8CFF] text-[#1A8CFF] hover:text-white font-semibold text-sm transition-all"
                >
                  <BrainCircuit className="w-4 h-4" />
                  <span>Luyện tập Flashcard</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsQuizModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-[#E3E7EE] hover:border-[#1A8CFF] text-[#1E1E1E] hover:text-[#1A8CFF] font-semibold text-sm transition-all cursor-pointer"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Kiểm tra Video Quiz</span>
                </button>
              </div>
            </aside>
          </div>
        )}
      </section>

      {/* 03 FLASHCARD SHOWCASE BANNER CHUẨN HANDY V2 */}
      <section className="max-w-6xl mx-auto px-6 pb-14">
        <div className="flex items-center gap-6 flex-wrap p-7 md:p-10 rounded-[24px] bg-gradient-to-r from-[#FFF8EC] to-[#FFF5F7] border border-[#F6EBE2]">
          <div className="flex-none w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-[0_10px_24px_rgba(20,30,60,0.08)] flex items-center justify-center text-[#1E1E1E] -rotate-3">
            <QrCode className="w-10 h-10 text-[#1A8CFF]" />
          </div>
          <div className="flex-1 min-w-[260px] flex flex-col gap-1.5">
            <h3 className="text-xl sm:text-2xl font-bold text-[#1E1E1E]">
              Học cùng <span className="text-[#F0436A]">flashcard</span> HANDY
            </h3>
            <p className="text-sm sm:text-base text-[#4A4A4A] leading-relaxed">
              Quét mã QR trên mỗi thẻ học thực tế để mở đúng video ký hiệu trong chủ đề này, giúp bé và gia đình ôn lại mọi lúc mọi nơi.
            </p>
          </div>
        </div>
      </section>

      {/* 04 CHỦ ĐỀ TIẾP THEO (Next Topics) CHUẨN HANDY V2 */}
      <section className="max-w-6xl mx-auto px-6 pb-24 flex flex-col gap-7">
        <div className="flex justify-between items-end gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] tracking-tight">
              Chủ đề <span className="text-[#1A8CFF]">tiếp theo</span>
            </h2>
            <p className="text-sm text-[#6B6B6B] mt-1">
              Khám phá thêm các chủ đề khác để nâng cao vốn từ vựng ký hiệu của bạn.
            </p>
          </div>
          <Link
            href="/topics"
            className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-[#1A8CFF] hover:text-[#0B6FE0] transition-colors"
          >
            <span>Xem tất cả chủ đề</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayOtherTopics.map((other, idx) => {
            const isTopicLocked = !other.is_free && !isUserVip
            const gradient = CARD_GRADIENTS[idx % CARD_GRADIENTS.length]
            const Icon = CARD_ICONS[idx % CARD_ICONS.length]

            return (
              <article
                key={other.id}
                className="group relative flex flex-col gap-3.5 p-6 rounded-[22px] bg-white border border-[#ECEEF3] hover:border-[#1A8CFF]/40 shadow-xs hover:shadow-[0_16px_32px_rgba(26,140,255,0.12)] transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-2.5 mb-1.5">
                  <div
                    className="w-13 h-13 rounded-2xl flex items-center justify-center text-white shadow-[0_10px_22px_rgba(20,30,60,0.14)] transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3"
                    style={{ background: gradient }}
                  >
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  {isTopicLocked ? (
                    <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#F3F4F7] text-[#6B6B6B]">
                      <Lock className="w-3 h-3" />
                      Đang khóa
                    </span>
                  ) : (
                    <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#E3F7EE] text-[#0C8558]">
                      <Sparkles className="w-3 h-3" />
                      {other.is_free ? 'Miễn phí' : 'Đã mở'}
                    </span>
                  )}
                </div>

                <span className="text-xs font-semibold text-[#8A8F99]">
                  Chủ đề {String(idx + 2).padStart(2, '0')}
                </span>

                <h3 className="text-lg font-bold text-[#1E1E1E] group-hover:text-[#1A8CFF] transition-colors line-clamp-1">
                  {other.title}
                </h3>

                <p className="text-sm text-[#4A4A4A] leading-relaxed line-clamp-2 flex-1">
                  {other.description || 'Học các ký hiệu ngôn ngữ ký hiệu chủ đề này.'}
                </p>

                {isTopicLocked ? (
                  <Link
                    href="/pricing"
                    className="mt-2 self-start inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFF3E0] hover:bg-[#F7931E] text-[#C96A00] hover:text-white text-sm font-semibold transition-all"
                  >
                    <span>Mở khóa chủ đề</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href={`/topics/${other.id}`}
                    className="mt-2 self-start inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#EAF4FF] hover:bg-[#1A8CFF] text-[#1A8CFF] hover:text-white text-sm font-semibold transition-all"
                  >
                    <span>Bắt đầu học</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </article>
            )
          })}
        </div>
      </section>

      {/* Màn hình Kiểm tra từ vựng (Video-to-Text Quiz Modal) */}
      <VideoQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        topicTitle={topic.title}
        vocabularies={vocabularies}
      />
    </div>
  )
}
