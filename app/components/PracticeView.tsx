'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { getEmbedYoutubeUrl } from '@/lib/utils'

export interface Vocabulary {
  id: string
  word: string
  meaning: string
  description?: string | null
  video_url: string
}

export interface Topic {
  id: string
  title: string
  description?: string | null
  is_free: boolean
}

// Fallback topics & vocabularies if database topic has no items or is empty
const DEFAULT_TOPIC: Topic = {
  id: 'default',
  title: 'Chào hỏi & Giao tiếp cơ bản',
  description: 'Các câu chào hỏi thông dụng',
  is_free: true,
}

const DEFAULT_VOCABULARIES: Vocabulary[] = [
  { id: '1', word: 'Xin chào', meaning: 'Lời chào khi gặp ai đó, dùng được với người lớn tuổi, bạn bè và thầy cô.', video_url: 'https://www.youtube.com/watch?v=hLEQuuht_wI' },
  { id: '2', word: 'Tạm biệt', meaning: 'Lời chào khi chia tay hoặc rời đi.', video_url: 'https://www.youtube.com/watch?v=YSPRe4TeTxw' },
  { id: '3', word: 'Cảm ơn', meaning: 'Bày tỏ sự biết ơn khi được giúp đỡ hoặc nhận một món quà.', video_url: 'https://www.youtube.com/watch?v=hLEQuuht_wI' },
  { id: '4', word: 'Xin lỗi', meaning: 'Nhận lỗi khi làm điều chưa đúng hoặc làm phiền người khác.', video_url: 'https://www.youtube.com/watch?v=YSPRe4TeTxw' },
  { id: '5', word: 'Tên', meaning: 'Từ dùng khi hỏi hoặc giới thiệu tên của một người.', video_url: 'https://www.youtube.com/watch?v=hLEQuuht_wI' },
  { id: '6', word: 'Tôi', meaning: 'Từ dùng để nói về chính mình.', video_url: 'https://www.youtube.com/watch?v=YSPRe4TeTxw' },
  { id: '7', word: 'Bạn', meaning: 'Từ dùng để gọi người đang trò chuyện cùng mình.', video_url: 'https://www.youtube.com/watch?v=hLEQuuht_wI' },
  { id: '8', word: 'Vâng', meaning: 'Lời đáp đồng ý, lễ phép khi nói chuyện với người lớn.', video_url: 'https://www.youtube.com/watch?v=YSPRe4TeTxw' },
  { id: '9', word: 'Không', meaning: 'Lời đáp từ chối hoặc phủ định.', video_url: 'https://www.youtube.com/watch?v=hLEQuuht_wI' },
  { id: '10', word: 'Hẹn gặp lại', meaning: 'Lời chào khi chia tay, mong sẽ gặp lại nhau.', video_url: 'https://www.youtube.com/watch?v=YSPRe4TeTxw' },
]

function extractYouTubeId(url: string): string | null {
  if (!url) return null
  const m1 = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (m1) return m1[1]
  const m2 = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (m2) return m2[1]
  const m3 = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/)
  if (m3) return m3[1]
  const m4 = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/)
  if (m4) return m4[1]
  return null
}

interface PracticeViewProps {
  topicId?: string
  initialTopic?: Topic | null
  initialVocabularies?: Vocabulary[]
  allTopics?: Topic[]
}

export default function PracticeView({
  topicId,
  initialTopic,
  initialVocabularies,
  allTopics = [],
}: PracticeViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const manParam = searchParams.get('man')

  const topic: Topic = initialTopic || DEFAULT_TOPIC
  const rawVocabs = (initialVocabularies && initialVocabularies.length > 0)
    ? initialVocabularies
    : DEFAULT_VOCABULARIES

  // Mode: 'flash' | 'quiz'
  const [mode, setMode] = useState<'flash' | 'quiz'>(() => {
    return manParam === 'quiz' ? 'quiz' : 'flash'
  })

  // Deck: 'all' | 'star'
  const [deck, setDeck] = useState<'all' | 'star'>(() => {
    return manParam === 'star' ? 'star' : 'all'
  })

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set())
  const [reviewIds, setReviewIds] = useState<Set<string>>(new Set())
  const [starredWords, setStarredWords] = useState<Record<string, boolean>>({})
  const [isFinished, setIsFinished] = useState(() => manParam === 'done')
  const [isLocked, setIsLocked] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(false)

  // Quiz state
  const [pickedOption, setPickedOption] = useState<number | null>(null)
  const [quizScore, setQuizScore] = useState(0)

  // Load starred words from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('handy-starred-signs')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && typeof parsed === 'object') {
          setStarredWords(parsed)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  // Handle man query param changes
  useEffect(() => {
    if (manParam === 'quiz') {
      setMode('quiz')
      setIsFinished(false)
    } else if (manParam === 'star') {
      setMode('flash')
      setDeck('star')
      setIsFinished(false)
    } else if (manParam === 'done') {
      setIsFinished(true)
    }
  }, [manParam])

  // VIP access check via Supabase
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

  // Active vocabularies list based on deck filter ('all' vs 'star')
  const activeVocabs = useMemo(() => {
    if (deck === 'star') {
      const filtered = rawVocabs.filter((v) => starredWords[v.word])
      return filtered.length > 0 ? filtered : rawVocabs
    }
    return rawVocabs
  }, [rawVocabs, deck, starredWords])

  const total = activeVocabs.length
  const currentVocab = activeVocabs[Math.min(currentIndex, Math.max(0, total - 1))]

  // Generate 4 options for Quiz
  const quizOptions = useMemo(() => {
    if (!currentVocab) return []
    const correct = currentVocab.word
    const distractors = rawVocabs
      .map((v) => v.word)
      .filter((w) => w !== correct)
    
    // Shuffle distractors
    const shuffledDistractors = [...distractors].sort(() => 0.5 - Math.random())
    const chosen = [correct, ...shuffledDistractors.slice(0, 3)]
    // Stable shuffle for the current question
    return chosen.sort(() => 0.5 - Math.random())
  }, [currentVocab, rawVocabs])

  // Star toggle
  const toggleStar = useCallback(
    (word?: string) => {
      const targetWord = word || currentVocab?.word
      if (!targetWord) return
      setStarredWords((prev) => {
        const next = { ...prev }
        if (next[targetWord]) {
          delete next[targetWord]
        } else {
          next[targetWord] = true
        }
        try {
          localStorage.setItem('handy-starred-signs', JSON.stringify(next))
        } catch {
          // ignore
        }
        return next
      })
    },
    [currentVocab]
  )

  const isCurrentStarred = currentVocab ? !!starredWords[currentVocab.word] : false
  const starredList = rawVocabs.filter((v) => starredWords[v.word]).map((v) => v.word)
  const starCount = starredList.length

  // Flashcard controls
  const toggleFlip = () => setIsFlipped((prev) => !prev)

  const goToPrev = useCallback(() => {
    setIsFlipped(false)
    setPickedOption(null)
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
    }
  }, [currentIndex])

  const goToNext = useCallback(() => {
    setIsFlipped(false)
    setPickedOption(null)
    if (currentIndex + 1 < total) {
      setCurrentIndex((i) => i + 1)
    } else {
      setIsFinished(true)
    }
  }, [currentIndex, total])

  const handleMastered = () => {
    if (!currentVocab) return
    setLearnedIds((prev) => new Set(prev).add(currentVocab.id))
    setReviewIds((prev) => {
      const next = new Set(prev)
      next.delete(currentVocab.id)
      return next
    })
    goToNext()
  }

  const handleNeedReview = () => {
    if (!currentVocab) return
    setReviewIds((prev) => new Set(prev).add(currentVocab.id))
    goToNext()
  }

  // Quiz answer select
  const handleSelectQuizOption = useCallback(
    (index: number) => {
      if (pickedOption !== null || !currentVocab) return
      setPickedOption(index)
      if (quizOptions[index] === currentVocab.word) {
        setQuizScore((s) => s + 1)
      }
    },
    [pickedOption, currentVocab, quizOptions]
  )

  // Restart practice
  const handleRestart = (newMode?: 'flash' | 'quiz', newDeck?: 'all' | 'star') => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setPickedOption(null)
    setQuizScore(0)
    setLearnedIds(new Set())
    setReviewIds(new Set())
    setIsFinished(false)
    if (newMode) setMode(newMode)
    if (newDeck) setDeck(newDeck)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished) return
      const target = e.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return

      if (mode === 'flash') {
        if (e.key === ' ' || e.code === 'Space') {
          e.preventDefault()
          toggleFlip()
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault()
          goToPrev()
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          goToNext()
        } else if (e.key === 's' || e.key === 'S') {
          e.preventDefault()
          toggleStar()
        }
      } else if (mode === 'quiz') {
        if (pickedOption === null && ['1', '2', '3', '4'].includes(e.key)) {
          const idx = parseInt(e.key, 10) - 1
          if (idx >= 0 && idx < quizOptions.length) {
            handleSelectQuizOption(idx)
          }
        } else if (pickedOption !== null && e.key === 'Enter') {
          e.preventDefault()
          goToNext()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mode, isFinished, pickedOption, quizOptions, goToNext, goToPrev, toggleStar, handleSelectQuizOption])

  // Progress percentage
  const doneCount = isFinished
    ? total
    : currentIndex + (mode === 'quiz' && pickedOption !== null ? 1 : 0)
  const progressPercent = total > 0 ? Math.round((doneCount / total) * 100) : 0

  // Video embed & Thumbnail
  const ytid = currentVocab ? extractYouTubeId(currentVocab.video_url) : null
  const cardImg = ytid
    ? `https://i.ytimg.com/vi/${ytid}/hqdefault.jpg`
    : '/assets/the-xin-chao.png'
  const isMp4 = currentVocab?.video_url?.toLowerCase().endsWith('.mp4')

  // VIP Locked Screen
  if (isLocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-white font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#ECEEF3] p-8 text-center shadow-[0_20px_48px_rgba(20,30,60,0.08)]">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF6E5] text-[#F7A21B] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#1E1E1E] mb-2">Chủ đề VIP</h2>
          <p className="text-[#4A4A4A] text-sm mb-6 leading-relaxed">
            Phần luyện tập cho chủ đề này yêu cầu tài khoản VIP. Hãy nâng cấp để mở khóa toàn bộ bài học và từ vựng!
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => router.push('/pricing')}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#0050B3] to-[#1A8CFF] text-white font-bold text-sm shadow-md transition hover:opacity-95"
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

  return (
    <div className="min-h-screen bg-white font-sans text-[#1E1E1E]">
      {/* 01 BANNER LUYỆN TẬP */}
      <section
        data-screen-label="01 Banner luyện tập"
        className="relative overflow-hidden"
        style={{
          background:
            'radial-gradient(45% 80% at 100% 0%,#E3F7EE 0%,rgba(227,247,238,0) 70%),radial-gradient(40% 70% at 0% 100%,#F1EBFB 0%,rgba(241,235,251,0) 70%),#F8FBFA',
        }}
      >
        <span
          aria-hidden="true"
          className="absolute left-[6%] top-16 w-4 h-4 rounded-full bg-[#F9C31F] pointer-events-none hidden sm:block"
        />
        <span
          aria-hidden="true"
          className="absolute right-[9%] top-14 w-8 h-8 rounded-full border-[5px] border-[#7B5BB5] pointer-events-none hidden sm:block"
        />
        <svg
          aria-hidden="true"
          className="absolute right-[5%] bottom-12 pointer-events-none animate-pulse hidden sm:block"
          width="24"
          height="24"
          viewBox="0 0 40 40"
        >
          <path
            d="M20 0 C21.5 13 27 18.5 40 20 C27 21.5 21.5 27 20 40 C18.5 27 13 21.5 0 20 C13 18.5 18.5 13 20 0Z"
            fill="#17A673"
          />
        </svg>

        <div className="relative z-10 max-w-[820px] mx-auto px-6 py-11 pb-14 flex flex-col items-center gap-3.5 text-center">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[#6B6B6B]">
            <Link href="/" className="hover:text-[#1A8CFF] transition-colors">
              Trang chủ
            </Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 6 6 6-6 6" />
            </svg>
            <Link href="/topics" className="hover:text-[#1A8CFF] transition-colors">
              Chủ đề
            </Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 6 6 6-6 6" />
            </svg>
            <span className="text-[#1A8CFF] font-semibold">Luyện tập</span>
          </nav>

          <h1 className="font-bold text-[32px] sm:text-[42px] md:text-[52px] leading-[1.2] tracking-tight text-[#1E1E1E]">
            <span className="text-[#17A673]">Luyện tập</span> để nhớ lâu hơn
          </h1>
          <p className="text-base leading-relaxed text-[#4A4A4A] max-w-[600px]">
            Ôn lại các ký hiệu đã học bằng thẻ ghi nhớ hoặc bài chọn đáp án. Mỗi lượt chỉ vài phút.
          </p>
        </div>
      </section>

      {/* 02 KHU VỰC LUYỆN TẬP */}
      <section
        id="luyen"
        data-screen-label="02 Khu luyện tập"
        className="max-w-[1240px] mx-auto px-6 py-11 pb-24 flex flex-col lg:flex-row gap-7 items-start"
      >
        {/* ASIDE: Chọn dạng bài & Chọn chủ đề */}
        <aside className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6 sticky top-24">
          {/* 1. Chọn dạng bài */}
          <div className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-[#1E1E1E]">
              1. Chọn dạng bài
            </h2>
            <div className="flex flex-col gap-3">
              {/* Thẻ ghi nhớ */}
              <button
                type="button"
                onClick={() => handleRestart('flash')}
                className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                  mode === 'flash'
                    ? 'border-[#1A8CFF] bg-[#F4F9FF] shadow-[0_10px_24px_rgba(26,140,255,0.14)]'
                    : 'border-[#ECEEF3] bg-white hover:border-[#CFE3FB]'
                }`}
              >
                <span className="w-12 h-12 rounded-xl text-white flex items-center justify-center shrink-0 bg-gradient-to-br from-[#5CB0FF] to-[#1A6FE0] shadow-sm">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="6" width="14" height="15" rx="2" />
                    <path d="M7 3h12a2 2 0 0 1 2 2v12" />
                  </svg>
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-base font-bold text-[#1E1E1E]">Thẻ ghi nhớ</span>
                  <span className="text-[13.5px] leading-relaxed text-[#4A4A4A]">
                    Xem video, tự đoán nghĩa rồi lật thẻ để kiểm tra.
                  </span>
                </div>
              </button>

              {/* Chọn đáp án đúng */}
              <button
                type="button"
                onClick={() => handleRestart('quiz')}
                className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                  mode === 'quiz'
                    ? 'border-[#17A673] bg-[#E3F7EE] shadow-[0_10px_24px_rgba(23,166,115,0.14)]'
                    : 'border-[#ECEEF3] bg-white hover:border-[#CFE3FB]'
                }`}
              >
                <span className="w-12 h-12 rounded-xl text-white flex items-center justify-center shrink-0 bg-gradient-to-br from-[#6FDDB0] to-[#17A673] shadow-sm">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="3" width="14" height="18" rx="2" />
                    <path d="M9 3v2h6V3" />
                    <path d="m9 13 2 2 4-4" />
                  </svg>
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-base font-bold text-[#1E1E1E]">Chọn đáp án đúng</span>
                  <span className="text-[13.5px] leading-relaxed text-[#4A4A4A]">
                    Xem video và chọn nghĩa đúng trong 4 đáp án.
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Chọn chủ đề */}
          <div className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-[#1E1E1E]">
              2. Chọn chủ đề
            </h2>
            <div className="flex flex-col gap-1.5 p-2 rounded-2xl border border-[#ECEEF3] bg-white max-h-[320px] overflow-y-auto">
              {(allTopics.length > 0 ? allTopics : [topic]).map((t, index) => {
                const isSelected = t.id === topic.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      if (t.id !== topic.id) {
                        router.push(`/practice/${t.id}`)
                      }
                    }}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#F4F9FF] border border-[#CFE3FB]'
                        : 'hover:bg-[#F9FBFC]'
                    }`}
                  >
                    <span
                      className="w-8 h-8 rounded-lg text-white flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{
                        background:
                          index % 3 === 0
                            ? 'linear-gradient(135deg,#FFB36B 0%,#F0436A 100%)'
                            : index % 3 === 1
                            ? 'linear-gradient(135deg,#5CB0FF 0%,#1A6FE0 100%)'
                            : 'linear-gradient(135deg,#6FDDB0 0%,#17A673 100%)',
                      }}
                    >
                      {index + 1}
                    </span>
                    <span className="flex-1 min-w-0 text-[14px] font-semibold text-[#1E1E1E] truncate">
                      {t.title}
                    </span>
                    {t.is_free ? (
                      <span className="w-5 h-5 rounded-full bg-[#1A8CFF] text-white flex items-center justify-center shrink-0">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m5 12 5 5L20 7" />
                        </svg>
                      </span>
                    ) : (
                      <svg className="shrink-0 text-[#8A8F99]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="11" width="16" height="10" rx="2" />
                        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        {/* MAIN PRACTICE BOX */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-4 p-6 sm:p-8 rounded-[28px] bg-[#F7FAFF] border border-[#E7EEF8]">
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="flex items-center gap-2.5 text-[15px] font-bold text-[#1E1E1E]">
              {mode === 'flash' ? 'Thẻ ghi nhớ' : 'Chọn đáp án đúng'}
              <span className="text-[13px] font-semibold px-2.5 py-1 rounded-full bg-white text-[#4A4A4A] border border-[#E3E7EE]">
                {topic.title}
              </span>
            </span>
            <span className="text-sm font-semibold text-[#1A8CFF]">
              {isFinished
                ? 'Hoàn thành'
                : `${mode === 'flash' ? 'Thẻ ' : 'Câu '}${currentIndex + 1}/${total}`}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2.5 rounded-full bg-[#E3EAF5] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-450 ease-out"
              style={{
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, #1A8CFF, #17A673)',
              }}
            />
          </div>

          {/* ======================= MÀN 1: FLASHCARD ======================= */}
          {mode === 'flash' && !isFinished && currentVocab && (
            <div className="flex flex-col items-center gap-5 pt-1">
              {/* Starred Deck Filter Bar */}
              <div className="flex items-center justify-between gap-3 flex-wrap w-full max-w-[560px]">
                <span className="flex items-center gap-2 text-sm font-semibold text-[#4A4A4A]">
                  <span className="text-[#F7A21B]">★</span>
                  <span>{starCount ? `${starCount} thẻ đã gắn sao` : 'Chạm ngôi sao để đánh dấu thẻ cần xem lại'}</span>
                </span>
                <div role="radiogroup" aria-label="Bộ thẻ" className="flex gap-1 p-1 rounded-full bg-[#EAF0F8]">
                  <button
                    type="button"
                    onClick={() => {
                      setDeck('all')
                      setCurrentIndex(0)
                      setIsFlipped(false)
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-[13.5px] font-semibold transition ${
                      deck === 'all'
                        ? 'bg-white text-[#1A8CFF] shadow-xs'
                        : 'text-[#4A4A4A] hover:text-[#1E1E1E]'
                    }`}
                  >
                    Tất cả thẻ
                  </button>
                  <button
                    type="button"
                    disabled={starCount === 0}
                    onClick={() => {
                      if (starCount > 0) {
                        setDeck('star')
                        setCurrentIndex(0)
                        setIsFlipped(false)
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-[13.5px] font-semibold transition ${
                      deck === 'star'
                        ? 'bg-white text-[#B26A00] shadow-xs'
                        : starCount === 0
                        ? 'opacity-40 cursor-not-allowed text-[#8A8F99]'
                        : 'text-[#4A4A4A] hover:text-[#1E1E1E]'
                    }`}
                  >
                    Thẻ gắn sao {starCount > 0 ? `(${starCount})` : ''}
                  </button>
                </div>
              </div>

              {/* 3D Flip Card */}
              <div className="relative w-full max-w-[560px]">
                {/* Star Button */}
                <button
                  type="button"
                  onClick={() => toggleStar(currentVocab.word)}
                  aria-pressed={isCurrentStarred}
                  title={isCurrentStarred ? 'Bỏ gắn sao' : 'Gắn sao thẻ này (phím S)'}
                  className={`absolute top-3.5 right-3.5 z-20 w-11 h-11 rounded-full border-none cursor-pointer flex items-center justify-center transition-transform hover:scale-110 ${
                    isCurrentStarred
                      ? 'bg-[#FFC94D] text-[#8A4B00] shadow-[0_8px_20px_rgba(247,162,27,0.45)]'
                      : 'bg-white/90 text-[#8A8F99] shadow-[0_6px_16px_rgba(15,42,92,0.18)]'
                  }`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill={isCurrentStarred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2.5l2.9 5.9 6.6 1-4.8 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5-4.8-4.6 6.6-1z" />
                  </svg>
                </button>

                {/* Perspective Container */}
                <div
                  onClick={toggleFlip}
                  className="w-full aspect-[4/3] [perspective:1400px] cursor-pointer"
                >
                  <div
                    className="relative w-full h-full [transform-style:preserve-3d] transition-transform duration-650 ease-[cubic-bezier(.3,.7,.25,1)]"
                    style={{
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    {/* MẶT TRƯỚC (Front: Image & Word) */}
                    <div className="absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] rounded-3xl overflow-hidden bg-white border-2 border-[#E3EAF5] flex flex-col shadow-[0_20px_44px_rgba(20,30,60,0.10)]">
                      <div className="flex-1 min-h-0 relative bg-[#1B2A63] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cardImg}
                          alt={currentVocab.word}
                          className="absolute inset-0 w-full h-full object-cover block"
                        />
                      </div>
                      <div className="shrink-0 flex items-center justify-between gap-3 p-4 sm:p-5 px-6 bg-white border-t border-[#EEF1F6]">
                        <span className="text-[24px] sm:text-[30px] font-bold tracking-tight text-[#1E1E1E]">
                          {currentVocab.word}
                        </span>
                        <span className="shrink-0 text-[13.5px] font-semibold text-[#1A8CFF]">
                          Chạm để xem video
                        </span>
                      </div>
                    </div>

                    {/* MẶT SAU (Back: Video Embed & Word detail) */}
                    <div
                      className="absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl overflow-hidden bg-[#0F2A5C] flex flex-col shadow-[0_20px_44px_rgba(15,42,92,0.25)]"
                      style={{
                        background:
                          'radial-gradient(70% 90% at 30% 20%,#2A97FF 0%,rgba(42,151,255,0) 70%),#0F2A5C',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isFlipped && (
                        isMp4 ? (
                          <video
                            src={currentVocab.video_url}
                            autoPlay
                            controls
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <iframe
                            src={getEmbedYoutubeUrl(currentVocab.video_url)}
                            title={currentVocab.word}
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        )
                      )}
                      {/* Bottom banner on back side */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between px-5 text-white pointer-events-none">
                        <span className="text-sm font-bold truncate">
                          Video ký hiệu “{currentVocab.word}”
                        </span>
                        <span className="text-xs text-white/80">
                          Chạm lật lại
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls below Card */}
              <div className="w-full max-w-[560px] flex items-center justify-between gap-3">
                {/* Prev Button */}
                <button
                  type="button"
                  onClick={goToPrev}
                  disabled={currentIndex === 0}
                  aria-label="Thẻ trước"
                  title="Thẻ trước (phím ←)"
                  className="w-12 h-12 rounded-full border-[1.5px] border-[#D6E4F5] bg-white text-[#1A8CFF] hover:bg-[#1A8CFF] hover:border-[#1A8CFF] hover:text-white flex items-center justify-center shadow-xs transition disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 6-6 6 6 6" />
                  </svg>
                </button>

                {/* Flip or Mastered/NeedReview */}
                <div className="flex-1 flex justify-center">
                  {!isFlipped ? (
                    <button
                      type="button"
                      onClick={toggleFlip}
                      className="flex items-center gap-2 px-7 py-3 rounded-full text-white text-[15px] font-semibold bg-[#1A8CFF] hover:bg-[#0B6FE0] transition-colors shadow-sm"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
                        <path d="M21 3v5h-5" />
                      </svg>
                      <span>Lật thẻ</span>
                    </button>
                  ) : (
                    <div className="flex gap-3 flex-wrap justify-center">
                      <button
                        type="button"
                        onClick={handleNeedReview}
                        className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[#F0436A] bg-white text-[#F0436A] hover:bg-[#F0436A] hover:text-white text-[15px] font-semibold transition-colors"
                      >
                        Chưa nhớ
                      </button>
                      <button
                        type="button"
                        onClick={handleMastered}
                        className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[#17A673] bg-[#17A673] hover:bg-[#0C8558] text-white text-[15px] font-semibold transition-colors shadow-sm"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m5 12 5 5L20 7" />
                        </svg>
                        <span>Đã nhớ</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={goToNext}
                  disabled={currentIndex === total - 1}
                  aria-label="Thẻ sau"
                  title="Thẻ sau (phím →)"
                  className="w-12 h-12 rounded-full border-[1.5px] border-[#D6E4F5] bg-white text-[#1A8CFF] hover:bg-[#1A8CFF] hover:border-[#1A8CFF] hover:text-white flex items-center justify-center shadow-xs transition disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ======================= MÀN 2: QUIZ ======================= */}
          {mode === 'quiz' && !isFinished && currentVocab && (
            <div className="flex flex-col gap-5 pt-1">
              {/* Video Player */}
              <div className="relative w-full aspect-[16/9] sm:aspect-[16/8] rounded-3xl overflow-hidden bg-black shadow-md">
                {isMp4 ? (
                  <video
                    src={currentVocab.video_url}
                    autoPlay
                    controls
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
                )}
              </div>

              {/* Question */}
              <h3 className="text-lg sm:text-xl font-bold text-[#1E1E1E]">
                Ký hiệu trong video có nghĩa là gì?
              </h3>

              {/* 4 Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quizOptions.map((opt, idx) => {
                  const letters = ['A', 'B', 'C', 'D']
                  const isCorrect = opt === currentVocab.word
                  const isPicked = pickedOption === idx
                  const answered = pickedOption !== null

                  let border = 'border-[#E3E7EE]'
                  let bg = 'bg-white'
                  let keyBg = 'bg-[#F1F3F7]'
                  let keyFg = 'text-[#4A4A4A]'

                  if (answered) {
                    if (isCorrect) {
                      border = 'border-[#17A673]'
                      bg = 'bg-[#E3F7EE]'
                      keyBg = 'bg-[#17A673]'
                      keyFg = 'text-white'
                    } else if (isPicked) {
                      border = 'border-[#F0436A]'
                      bg = 'bg-[#FFF0F3]'
                      keyBg = 'bg-[#F0436A]'
                      keyFg = 'text-white'
                    }
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={answered}
                      onClick={() => handleSelectQuizOption(idx)}
                      className={`flex items-center gap-3 p-4 px-5 rounded-2xl border-2 ${border} ${bg} text-[16px] font-semibold text-[#1E1E1E] transition cursor-pointer text-left ${
                        !answered ? 'hover:border-[#1A8CFF]' : ''
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${keyBg} ${keyFg}`}>
                        {letters[idx]}
                      </span>
                      <span>{opt}</span>
                    </button>
                  )
                })}
              </div>

              {/* Feedback & Next Button */}
              {pickedOption !== null && (
                <div
                  className={`flex items-center justify-between gap-3 flex-wrap p-4 px-5 rounded-2xl ${
                    quizOptions[pickedOption] === currentVocab.word
                      ? 'bg-[#E3F7EE] text-[#0C8558]'
                      : 'bg-[#FFF0F3] text-[#C8284F]'
                  }`}
                >
                  <span className="text-[15.5px] font-semibold">
                    {quizOptions[pickedOption] === currentVocab.word
                      ? '🎉 Chính xác! Bạn làm rất tốt.'
                      : `Chưa đúng rồi. Đáp án đúng là “${currentVocab.word}”.`}
                  </span>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-sm font-semibold bg-[#1A8CFF] hover:bg-[#0B6FE0] transition shadow-xs"
                  >
                    <span>{currentIndex >= total - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================= MÀN 3: HOÀN THÀNH ======================= */}
          {isFinished && (
            <div className="flex flex-col items-center gap-4 py-10 px-4 text-center">
              {/* Trophy Badge */}
              <div className="w-24 h-24 rounded-[30px] bg-gradient-to-br from-[#6FDDB0] to-[#17A673] text-white flex items-center justify-center shadow-[0_16px_32px_rgba(23,166,115,0.3)] rotate-[-4deg]">
                <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-[#1E1E1E]">
                Hoàn thành lượt luyện tập!
              </h3>
              <p className="text-base leading-relaxed text-[#4A4A4A] max-w-md">
                {mode === 'flash'
                  ? `Bạn đã ôn tập ${total} ký hiệu. Hãy tiếp tục duy trì thói quen luyện tập mỗi ngày!`
                  : `Bạn trả lời đúng ${quizScore}/${total} câu hỏi trắc nghiệm.`}
              </p>

              {/* Starred words reminder */}
              {starCount > 0 && (
                <div className="w-full max-w-[520px] flex flex-col gap-3 p-4 rounded-2xl bg-[#FFF8EA] border border-[#FBE3B5]">
                  <span className="flex items-center justify-center gap-2 text-sm font-bold text-[#B26A00]">
                    <span>★</span>
                    <span>Thẻ bạn đã gắn sao để ôn lại</span>
                  </span>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {starredList.map((sw) => (
                      <span
                        key={sw}
                        className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-[#1E1E1E] border border-[#FBE3B5]"
                      >
                        {sw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap justify-center mt-2">
                <button
                  type="button"
                  onClick={() => handleRestart(mode, 'all')}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-white text-[15px] font-semibold bg-[#1A8CFF] hover:bg-[#0B6FE0] transition shadow-sm"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
                    <path d="M21 3v5h-5" />
                  </svg>
                  <span>Luyện tập lại</span>
                </button>

                {starCount > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRestart('flash', 'star')}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#FFC94D] hover:bg-[#F7A21B] text-[#7A4500] text-[15px] font-semibold transition"
                  >
                    <span>★</span>
                    <span>Ôn thẻ gắn sao ({starCount})</span>
                  </button>
                )}

                <Link
                  href={topic.id !== 'default' ? `/topics/${topic.id}` : '/topics'}
                  className="flex items-center gap-2 px-6 py-3 rounded-full border-[1.5px] border-[#1A8CFF] bg-white text-[#1A8CFF] hover:bg-[#1A8CFF] hover:text-white text-[15px] font-semibold transition"
                >
                  <span>Ôn lại chủ đề</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
