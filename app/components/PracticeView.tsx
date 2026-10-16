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
  BookOpen
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
          .select('is_premium, role')
          .eq('id', user.id)
          .maybeSingle()

        if (isMounted) {
          const hasAccess = profile?.role === 'ADMIN' || profile?.is_premium === true
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

  // Phát âm từ vựng
  const speakWord = (text: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'vi-VN'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  // Hành động: Đã hiểu
  const handleMastered = () => {
    if (!currentVocab) return
    const nextLearned = new Set(learnedIds)
    nextLearned.add(currentVocab.id)
    setLearnedIds(nextLearned)

    // Xóa khỏi danh sách cần ôn lại nếu trước đó đã đánh dấu
    if (reviewIds.has(currentVocab.id)) {
      const nextReview = new Set(reviewIds)
      nextReview.delete(currentVocab.id)
      setReviewIds(nextReview)
    }

    goToNext()
  }

  // Hành động: Cần ôn lại
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
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-3" />
        <p className="text-gray-600 font-bold">Đang kiểm tra quyền truy cập...</p>
      </div>
    )
  }

  // Nếu chủ đề bị khóa VIP
  if (isLocked) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border-2 border-amber-300 p-8 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-800 mb-2">Chủ đề VIP</h2>
          <p className="text-gray-600 text-sm mb-6">
            Luyện tập Quizlet cho chủ đề này yêu cầu tài khoản VIP. Hãy nâng cấp để mở khóa toàn bộ!
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 text-white font-black text-sm shadow-md transition active:scale-95"
            >
              Nâng cấp VIP ngay
            </button>
            <Link
              href="/topics"
              className="py-2.5 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 transition"
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
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border-2 border-amber-200 p-8 shadow-md">
          <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="font-extrabold text-gray-800 text-lg mb-2">Chưa có thẻ từ vựng</h3>
          <p className="text-gray-500 text-xs mb-6">Chủ đề này chưa có dữ liệu từ vựng để luyện tập.</p>
          <Link
            href="/topics"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-orange-500 text-white font-bold text-xs"
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
      <div className="max-w-lg mx-auto px-4 py-12 text-center animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl border-2 border-amber-300 p-8 md:p-10 shadow-2xl space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-200">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
              Chúc mừng bạn!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mt-2">
              Hoàn Thành Luyện Tập 🎉
            </h2>
            <p className="text-sm text-gray-500 mt-1">Chủ đề: {topic.title}</p>
          </div>

          {/* Thống kê kết quả */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-bold text-emerald-700 block">Đã ghi nhớ</span>
              <span className="text-2xl font-black text-emerald-800">{completedCount} từ</span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-xs font-bold text-amber-700 block">Cần ôn thêm</span>
              <span className="text-2xl font-black text-amber-800">{reviewIds.size} từ</span>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 text-white font-black text-sm shadow-md transition active:scale-95"
            >
              <RotateCw className="w-4 h-4" />
              Luyện tập lại
            </button>
            <Link
              href={`/topics/${topic.id}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-sm transition"
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Top Header & Thanh tiến độ (Progress bar) */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href={`/topics/${topic.id}`}
            className="inline-flex items-center gap-2 text-xs font-extrabold text-gray-600 hover:text-orange-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về bài học ({topic.title})</span>
          </Link>
          <span className="text-xs font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
            Từ {currentIndex + 1} / {total}
          </span>
        </div>

        {/* Thanh Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-1.5">
            <span>Tiến độ ghi nhớ</span>
            <span className="text-orange-600 font-extrabold">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* KHỐI THẺ LẬT (FLIP CARD QUIZLET) */}
      <div
        onClick={toggleFlip}
        className="w-full min-h-[380px] sm:min-h-[440px] bg-white rounded-3xl border-4 border-amber-300 shadow-xl cursor-pointer p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:border-orange-400 hover:shadow-2xl relative select-none"
      >
        <div className="flex items-center justify-between text-xs font-bold text-gray-400">
          <span className="flex items-center gap-1 text-amber-600 font-extrabold">
            <Sparkles className="w-3.5 h-3.5" /> Thẻ Quizlet
          </span>
          <span className="text-gray-400 italic">Nhấp vào thẻ để lật xem nghĩa / video</span>
        </div>

        {/* MẶT TRƯỚC: TỪ VỰNG & PHÁT ÂM */}
        {!isFlipped ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Từ vựng ngôn ngữ ký hiệu:
            </span>
            <div className="flex items-center gap-3">
              <h2 className="text-4xl sm:text-6xl font-black text-orange-500 tracking-tight">
                {currentVocab.word}
              </h2>
              <button
                onClick={(e) => speakWord(currentVocab.word, e)}
                className="w-11 h-11 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 flex items-center justify-center transition active:scale-95 shrink-0"
                title="Phát âm"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-6 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200">
              👉 Nhấp vào thẻ để xem video thủ ngữ và ý nghĩa
            </p>
          </div>
        ) : (
          /* MẶT SAU: Ý NGHĨA & VIDEO THỦ NGỮ */
          <div className="flex-1 flex flex-col items-center justify-center py-4 text-center">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-2">
              Ý nghĩa: {currentVocab.meaning}
            </span>

            {/* Video Iframe / Player */}
            <div
              className="w-full max-w-sm aspect-video rounded-2xl overflow-hidden bg-black shadow-md border-2 border-amber-200 mb-3"
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
                    className="w-full aspect-video rounded-xl border-0 h-full"
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  Không có video
                </div>
              )}
            </div>

            {currentVocab.description && (
              <p className="text-xs text-gray-600 max-w-md line-clamp-2 italic">
                "{currentVocab.description}"
              </p>
            )}
          </div>
        )}

        <div className="text-center text-[11px] font-bold text-gray-400 pt-2 border-t border-amber-100">
          Chạm vào thẻ để lật lại
        </div>
      </div>

      {/* 2 NÚT TƯƠNG TÁC CHO NGƯỜI HỌC */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <button
          onClick={handleNeedReview}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-white border-2 border-amber-300 hover:bg-amber-50 text-amber-900 font-extrabold text-sm shadow-sm transition active:scale-95 cursor-pointer"
        >
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <span>Cần ôn lại</span>
        </button>

        <button
          onClick={handleMastered}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm shadow-md shadow-emerald-200 transition active:scale-95 cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Đã hiểu ✅</span>
        </button>
      </div>
    </div>
  )
}
