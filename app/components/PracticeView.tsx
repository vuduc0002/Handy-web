'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import {
  ArrowLeft,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Sparkles,
  Trophy,
  Loader2,
  Crown,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Check,
  Star,
  Repeat,
} from 'lucide-react'
import { getEmbedYoutubeUrl } from '@/lib/utils'

interface Vocabulary {
  id: string
  word: string
  meaning: string
  description: string | null
  video_url: string
}

interface Topic {
  id: string
  title: string
  description: string | null
  is_free: boolean
}

export default function PracticeView({
  topicId,
  initialTopic,
  initialVocabularies,
}: {
  topicId: string
  initialTopic: Topic | null
  initialVocabularies: Vocabulary[]
}) {
  const router = useRouter()
  const [topic] = useState<Topic | null>(initialTopic)
  const [vocabularies] = useState<Vocabulary[]>(initialVocabularies)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set())
  const [reviewIds, setReviewIds] = useState<Set<string>>(new Set())
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set())
  const [isFinished, setIsFinished] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(false)

  // Kiểm tra quyền VIP nếu chủ đề yêu cầu trả phí
  useEffect(() => {
    let isMounted = true
    if (initialTopic && !initialTopic.is_free) {
      setCheckingAuth(true)
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) {
          if (isMounted) {
            setIsLocked(true)
            setCheckingAuth(false)
          }
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_premium, vip_until, role')
          .eq('id', user.id)
          .maybeSingle()

        if (isMounted) {
          const isVipValid =
            profile?.is_premium === true &&
            (!profile?.vip_until || new Date(profile.vip_until) > new Date())
          const hasAccess = profile?.role === 'ADMIN' || isVipValid
          if (!hasAccess) {
            setIsLocked(true)
          }
          setCheckingAuth(false)
        }
      })
    }
    return () => {
      isMounted = false
    }
  }, [initialTopic])

  const total = vocabularies.length
  const currentVocab = vocabularies[currentIndex]
  const completedCount = learnedIds.size
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0

  // Lật thẻ
  const toggleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  // Toggle star
  const toggleStar = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!currentVocab) return
    setStarredIds((prev) => {
      const next = new Set(prev)
      if (next.has(currentVocab.id)) {
        next.delete(currentVocab.id)
      } else {
        next.add(currentVocab.id)
      }
      return next
    })
  }

  // Phát âm từ vựng
  const speakWord = (text: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'vi-VN'
      utterance.rate = 0.85
      window.speechSynthesis.speak(utterance)
    }
  }

  // Hành động: Đã nhớ
  const handleMastered = () => {
    if (!currentVocab) return
    const nextLearned = new Set(learnedIds)
    nextLearned.add(currentVocab.id)
    setLearnedIds(nextLearned)

    if (reviewIds.has(currentVocab.id)) {
      const nextReview = new Set(reviewIds)
      nextReview.delete(currentVocab.id)
      setReviewIds(nextReview)
    }

    goToNext()
  }

  // Hành động: Chưa nhớ
  const handleNeedReview = () => {
    if (!currentVocab) return
    const nextReview = new Set(reviewIds)
    nextReview.add(currentVocab.id)
    setReviewIds(nextReview)

    goToNext()
  }

  // Chuyển sang thẻ tiếp theo
  const goToNext = () => {
    setIsFlipped(false)
    if (currentIndex + 1 < total) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setIsFinished(true)
    }
  }

  // Chuyển sang thẻ trước đó
  const goToPrev = () => {
    setIsFlipped(false)
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  // Luyện tập lại từ đầu
  const handleRestart = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setLearnedIds(new Set())
    setReviewIds(new Set())
    setIsFinished(false)
  }

  if (checkingAuth) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#17A673] animate-spin mb-3" />
        <p className="text-[#4A4A4A] font-bold">Đang kiểm tra quyền truy cập...</p>
      </div>
    )
  }

  // Nếu chủ đề bị khóa VIP
  if (isLocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#ECEEF3] p-8 text-center shadow-[0_20px_48px_rgba(20,30,60,0.08)]">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF6E5] text-[#F7A21B] flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Crown className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#1E1E1E] mb-2">Chủ đề VIP</h2>
          <p className="text-[#4A4A4A] text-sm mb-6 leading-relaxed">
            Luyện tập cho chủ đề này yêu cầu tài khoản VIP. Hãy nâng cấp để mở khóa toàn bộ!
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => router.push('/pricing')}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#0050B3] to-[#1A8CFF] text-white font-bold text-sm shadow-md transition hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              Nâng cấp VIP ngay
            </button>
            <Link
              href="/topics"
              className="py-2.5 rounded-full bg-[#F4F6FA] hover:bg-[#EAEFF7] text-[#4A4A4A] font-semibold text-xs transition"
            >
              Chọn chủ đề khác
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Không có từ vựng
  if (!topic || total === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 text-center">
        <div className="max-w-md bg-white rounded-3xl border border-[#ECEEF3] p-8 shadow-sm">
          <Sparkles className="w-12 h-12 text-[#17A673] mx-auto mb-3" />
          <h3 className="font-bold text-[#1E1E1E] text-lg mb-2">Chưa có thẻ từ vựng</h3>
          <p className="text-[#6B6B6B] text-xs mb-6">Chủ đề này chưa có dữ liệu từ vựng để luyện tập.</p>
          <Link
            href="/topics"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#1A8CFF] text-white font-semibold text-xs shadow"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
          </Link>
        </div>
      </div>
    )
  }

  // Màn hình khi đã hoàn thành toàn bộ lượt luyện tập
  if (isFinished) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-14 text-center">
        <div className="max-w-lg w-full bg-white rounded-[28px] border border-[#ECEEF3] p-8 md:p-10 shadow-[0_20px_50px_rgba(20,30,60,0.1)] space-y-6">
          <div className="w-20 h-20 rounded-[26px] bg-gradient-to-tr from-[#6FDDB0] to-[#17A673] text-white flex items-center justify-center mx-auto shadow-[0_16px_32px_rgba(23,166,115,0.3)] -rotate-3">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#0C8558] bg-[#E3F7EE] px-3.5 py-1 rounded-full mb-2">
              Hoàn thành lượt luyện tập
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E]">
              Xuất sắc! 🎉
            </h2>
            <p className="text-sm text-[#6B6B6B] mt-1">Chủ đề: {topic.title}</p>
          </div>

          {/* Thống kê kết quả */}
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-[#E3F7EE] border border-[#C6EFDC]">
              <span className="text-xs font-semibold text-[#0C8558] block mb-1">Đã ghi nhớ</span>
              <span className="text-2xl font-black text-[#0C8558]">{completedCount} từ</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FFF5F7] border border-[#F9C4D1]">
              <span className="text-xs font-semibold text-[#B0173C] block mb-1">Cần ôn thêm</span>
              <span className="text-2xl font-black text-[#C8284F]">{reviewIds.size} từ</span>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-gradient-to-r from-[#0050B3] to-[#1A8CFF] text-white font-bold text-sm shadow-md transition active:scale-95 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              Luyện tập lại
            </button>
            <Link
              href={`/topics/${topic.id}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-[#F4F6FA] hover:bg-[#EAEFF7] text-[#1E1E1E] font-semibold text-sm transition"
            >
              <BookOpen className="w-4 h-4" />
              Xem bài học
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isMp4 = currentVocab?.video_url?.toLowerCase().endsWith('.mp4')
  const isStarred = currentVocab ? starredIds.has(currentVocab.id) : false

  return (
    <div className="min-h-screen bg-white">
      {/* BANNER LUYỆN TẬP CHUẨN HANDY V2 */}
      <section className="relative overflow-hidden bg-[radial-gradient(45%_80%_at_100%_0%,#E3F7EE_0%,rgba(227,247,238,0)_70%),radial-gradient(40%_70%_at_0%_100%,#F1EBFB_0%,rgba(241,235,251,0)_70%),#F8FBFA] border-b border-[#E8F2EC]">
        {/* Decorative elements */}
        <span
          aria-hidden="true"
          className="absolute left-[6%] top-[64px] w-4 h-4 rounded-full bg-[#F9C31F] pointer-events-none opacity-80"
        />
        <span
          aria-hidden="true"
          className="absolute right-[9%] top-[52px] w-8 h-8 rounded-full border-4 border-[#7B5BB5] pointer-events-none opacity-75"
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-8 pb-12 flex flex-col items-center gap-3.5 text-center">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[#6B6B6B]">
            <Link href="/" className="hover:text-[#1A8CFF] transition-colors">
              Trang chủ
            </Link>
            <span className="text-[#A0A0A0]">/</span>
            <Link href="/topics" className="hover:text-[#1A8CFF] transition-colors">
              Chủ đề
            </Link>
            <span className="text-[#A0A0A0]">/</span>
            <span className="text-[#17A673] font-semibold">Luyện tập</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E1E1E] tracking-tight">
            <span className="text-[#17A673]">Luyện tập</span> để nhớ lâu hơn
          </h1>
          <p className="text-sm sm:text-base text-[#4A4A4A] max-w-lg">
            Ôn lại các ký hiệu qua thẻ ghi nhớ thông minh. Mỗi lượt luyện tập chỉ mất vài phút.
          </p>
        </div>
      </section>

      {/* KHU VỰC THẺ LẬT FLASHCARD */}
      <section className="max-w-2xl mx-auto px-6 py-10 md:py-14 flex flex-col gap-6">
        {/* Top Info Bar: Back + Progress */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <Link
              href={`/topics/${topic.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4A4A4A] hover:text-[#1A8CFF] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="truncate max-w-[200px] sm:max-w-sm">{topic.title}</span>
            </Link>

            <span className="text-xs font-bold text-[#17A673] bg-[#E3F7EE] px-3.5 py-1 rounded-full">
              Thẻ {currentIndex + 1} / {total}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 rounded-full bg-[#E3EAF5] overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full rounded-full bg-gradient-to-r from-[#1A8CFF] to-[#17A673] transition-all duration-300"
            />
          </div>
        </div>

        {/* 3D PERSPECTIVE FLIP CARD */}
        <div className="relative w-full [perspective:1400px]">
          {/* Bookmark Star Button */}
          <button
            type="button"
            onClick={toggleStar}
            title={isStarred ? 'Bỏ gắn sao' : 'Gắn sao thẻ này'}
            className={`absolute top-4 right-4 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm cursor-pointer ${
              isStarred
                ? 'bg-[#FFF6E5] text-[#F7A21B]'
                : 'bg-white/80 text-[#8A8F99] hover:text-[#F7A21B]'
            }`}
          >
            <Star
              className={`w-5 h-5 ${isStarred ? 'fill-[#F7A21B]' : ''}`}
            />
          </button>

          {/* Clickable Card Body */}
          <div
            onClick={toggleFlip}
            className="w-full min-h-[380px] sm:min-h-[420px] rounded-[26px] cursor-pointer transition-transform duration-600 [transform-style:preserve-3d] select-none"
            style={{
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* MẶT TRƯỚC (Front: Word & Audio) */}
            <div
              className={`absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] rounded-[26px] bg-white border-2 border-[#E3EAF5] shadow-[0_20px_44px_rgba(20,30,60,0.08)] flex flex-col justify-between p-6 sm:p-8 text-center transition-colors hover:border-[#1A8CFF] ${
                isFlipped ? 'pointer-events-none' : ''
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[#8A8F99]">
                <span className="flex items-center gap-1.5 text-[#1A8CFF]">
                  <Sparkles className="w-4 h-4" /> Thẻ từ vựng
                </span>
                <span>Chạm để lật xem video</span>
              </div>

              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <span className="text-xs font-bold text-[#8A8F99] uppercase tracking-wider">
                  Ký hiệu ngôn ngữ thủ ngữ:
                </span>
                <div className="flex items-center gap-3">
                  <h2 className="text-4xl sm:text-5xl font-extrabold text-[#1E1E1E] tracking-tight">
                    {currentVocab.word}
                  </h2>
                  <button
                    type="button"
                    onClick={(e) => speakWord(currentVocab.word, e)}
                    className="w-11 h-11 rounded-full bg-[#EAF4FF] text-[#1A8CFF] hover:bg-[#1A8CFF] hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer shadow-xs"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F1F3F7] text-xs font-medium text-[#8A8F99]">
                Chạm vào thẻ hoặc bấm nút Lật thẻ để xem video cử chỉ
              </div>
            </div>

            {/* MẶT SAU (Back: Video & Meaning) */}
            <div
              className={`absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[26px] bg-white border-2 border-[#CFE3FB] shadow-[0_20px_44px_rgba(26,140,255,0.14)] flex flex-col justify-between p-6 sm:p-8 text-center ${
                !isFlipped ? 'pointer-events-none' : ''
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[#8A8F99]">
                <span className="text-[#1A8CFF] font-bold">
                  {currentVocab.word}
                </span>
                <span>Chạm để lật lại</span>
              </div>

              {/* Video container */}
              <div
                className="w-full max-w-md mx-auto aspect-video rounded-2xl overflow-hidden bg-black shadow-md my-2"
                onClick={(e) => e.stopPropagation()}
              >
                {currentVocab.video_url ? (
                  isMp4 ? (
                    <video
                      src={currentVocab.video_url}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <iframe
                      src={getEmbedYoutubeUrl(currentVocab.video_url)}
                      title={currentVocab.word}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xs">
                    Chưa có video minh họa
                  </div>
                )}
              </div>

              <div className="text-sm font-semibold text-[#4A4A4A]">
                Ý nghĩa: <strong className="text-[#1E1E1E]">{currentVocab.meaning}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM INTERACTION CONTROLS */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="w-12 h-12 rounded-full border border-[#D6E4F5] bg-white text-[#1A8CFF] hover:bg-[#EAF4FF] flex items-center justify-center shadow-xs transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Thẻ trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 flex justify-center">
            {!isFlipped ? (
              <button
                type="button"
                onClick={toggleFlip}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#0050B3] to-[#1A8CFF] hover:opacity-95 text-white font-bold text-sm shadow-[0_10px_24px_rgba(26,140,255,0.25)] transition active:scale-95 cursor-pointer"
              >
                <Repeat className="w-4 h-4" />
                <span>Lật thẻ</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleNeedReview}
                  className="px-6 py-3 rounded-full border-2 border-[#F0436A] bg-white text-[#F0436A] hover:bg-[#FFF0F3] font-bold text-sm transition active:scale-95 cursor-pointer"
                >
                  Chưa nhớ
                </button>
                <button
                  type="button"
                  onClick={handleMastered}
                  className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-[#17A673] hover:bg-[#0C8558] text-white font-bold text-sm shadow-md transition active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.6]" />
                  <span>Đã nhớ</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={goToNext}
            disabled={currentIndex === total - 1}
            className="w-12 h-12 rounded-full border border-[#D6E4F5] bg-white text-[#1A8CFF] hover:bg-[#EAF4FF] flex items-center justify-center shadow-xs transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Thẻ sau"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  )
}
