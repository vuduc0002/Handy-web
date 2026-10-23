'use client'

import { useState, useEffect, useRef } from 'react'
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
  Smile,
  Hand,
  CheckCircle2,
  Info,
} from 'lucide-react'
import { getEmbedYoutubeUrl } from '@/lib/utils'
import VideoQuizModal from '@/app/components/VideoQuizModal'

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
}

export default function TopicDetailView({
  topicId,
  initialTopic,
  initialVocabularies,
}: TopicDetailViewProps) {
  const router = useRouter()
  const [topic] = useState<Topic | null>(initialTopic)
  const [vocabularies] = useState<Vocabulary[]>(initialVocabularies)
  const [selectedVocab, setSelectedVocab] = useState<Vocabulary | null>(
    initialVocabularies.length > 0 ? initialVocabularies[0] : null
  )
  const [isLocked, setIsLocked] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(false)
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false)

  // Ref điều khiển video tự dừng khi mở Modal Quiz
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Carousel refs để tự động scroll item đang chọn vào giữa màn hình
  const carouselRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})

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
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'mute', args: [] }),
            '*'
          )
        } catch {
          // Bỏ qua cross-origin error
        }
      }
    }
  }, [isQuizModalOpen])

  // Kiểm tra quyền VIP nếu chủ đề yêu cầu trả phí
  useEffect(() => {
    let isMounted = true
    if (initialTopic && !initialTopic.is_free) {
      setCheckingAccess(true)
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) {
          if (isMounted) {
            setIsLocked(true)
            setCheckingAccess(false)
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
          setCheckingAccess(false)
        }
      })
    }
    return () => {
      isMounted = false
    }
  }, [initialTopic])

  // Tự động cuộn Carousel ngang tới item đang chọn
  useEffect(() => {
    if (selectedVocab?.id && itemRefs.current[selectedVocab.id]) {
      itemRefs.current[selectedVocab.id]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [selectedVocab])

  // Phát âm từ vựng bằng Web Speech API
  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'vi-VN'
      utterance.rate = 0.85 // Đọc chậm một chút để trẻ em dễ tiếp thu
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

  // Khóa quyền truy cập nếu là VIP và user chưa nâng cấp
  if (isLocked && !checkingAccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border-4 border-amber-300 p-8 shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-500 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Lock className="w-10 h-10" />
          </div>
          <span className="inline-block text-xs font-black text-amber-800 bg-amber-100 px-3.5 py-1 rounded-full uppercase tracking-wider mb-2">
            Nội dung VIP
          </span>
          <h2 className="text-2xl font-black text-gray-800 mb-3">
            {topic?.title || 'Chủ đề bị khóa'}
          </h2>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Chủ đề này chỉ dành riêng cho tài khoản đã nâng cấp VIP. Hãy nâng cấp ngay để bé mở khóa toàn bộ kho bài học thủ ngữ nhé!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition"
            >
              ← Về trang chủ
            </Link>
            <button
              onClick={() => router.push('/checkout')}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-lg shadow-amber-200 transition active:scale-95 cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              Nâng cấp VIP ngay
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Không tìm thấy chủ đề
  if (!topic) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border-2 border-red-200 p-8 shadow-lg">
          <p className="text-5xl mb-3">😕</p>
          <h3 className="font-extrabold text-gray-800 text-xl mb-2">Không tìm thấy chủ đề</h3>
          <p className="text-gray-500 text-sm mb-6">Chủ đề bài học này không tồn tại hoặc đã bị xóa.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    )
  }

  const isMp4 = selectedVocab?.video_url?.toLowerCase().endsWith('.mp4')

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6 selection:bg-amber-400 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. HEADER ĐIỀU HƯỚNG & CÁC NÚT TƯƠNG TÁC (Kid-friendly Top Bar)             */}
      {/* ========================================================================= */}
      <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border-2 border-amber-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-11 h-11 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center justify-center transition shrink-0 active:scale-90 shadow-2xs"
            title="Quay lại danh sách bài học"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl">🌟</span>
              <h1 className="text-base sm:text-lg md:text-xl font-black text-amber-950 truncate leading-snug">
                {topic.title}
              </h1>
              {topic.is_free ? (
                <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full shrink-0">
                  Miễn phí
                </span>
              ) : (
                <span className="text-[11px] font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-600" /> VIP
                </span>
              )}
            </div>
            {topic.description && (
              <p className="text-xs text-amber-800/70 mt-0.5 line-clamp-1">
                {topic.description}
              </p>
            )}
          </div>
        </div>

        {/* Nút Kiểm Tra Quiz & Luyện Tập Flashcard */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={() => setIsQuizModalOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold px-4 py-2 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 text-xs sm:text-sm"
          >
            <span>🧪</span>
            <span>Kiểm tra</span>
          </button>

          <Link
            href={`/practice/${topic.id}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-amber-200 transition active:scale-95"
            title="Luyện tập Flashcard Quizlet"
          >
            <span>Luyện tập</span>
            <Sparkles className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {vocabularies.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-amber-200 p-12 text-center shadow-sm">
          <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800 mb-1">Chưa có từ vựng nào</h3>
          <p className="text-sm text-gray-500 mb-6">Chủ đề này đang được cập nhật thêm nội dung.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 text-white font-bold text-sm"
          >
            ← Chọn chủ đề khác
          </Link>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 2. KHU VỰC HỌC TẬP TRUNG TÂM (Main Focus Zone - Interactive Card)            */}
          {/* ========================================================================= */}
          {selectedVocab && (
            <div className="relative bg-white/95 backdrop-blur-md rounded-3xl border-3 border-amber-200 shadow-xl p-4 sm:p-6 md:p-8 overflow-hidden transition-all duration-300">
              {/* Thanh điều hướng Trước/Sau nhanh cho trẻ em & Tablet */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-100">
                <button
                  onClick={handlePrevWord}
                  disabled={!hasPrev}
                  className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-xs sm:text-sm border border-amber-200 transition active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Từ trước</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                    Thẻ số {currentIndex + 1} / {vocabularies.length}
                  </span>
                </div>

                <button
                  onClick={handleNextWord}
                  disabled={!hasNext}
                  className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-xs sm:text-sm shadow-xs transition active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span className="hidden sm:inline">Từ tiếp</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Bố cục 2 cột 50-50 trên Desktop / iPad, xếp dọc trên Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
                {/* ------------------------------------------------------------------- */}
                {/* CỘT TRÁI (Khái niệm - Concept): Ảnh minh họa lớn & Tên từ vựng       */}
                {/* ------------------------------------------------------------------- */}
                <div className="flex flex-col items-center justify-between bg-gradient-to-b from-amber-50/70 via-orange-50/40 to-amber-50/80 rounded-3xl p-5 sm:p-6 border-2 border-amber-200/90 shadow-sm h-full min-h-[380px] lg:min-h-[460px]">
                  {/* Khung Ảnh Minh Họa Thật Lớn */}
                  <div className="w-full flex-1 min-h-[220px] max-h-[340px] rounded-2xl overflow-hidden bg-white border-2 border-amber-200 flex items-center justify-center p-3 shadow-inner relative group">
                    {selectedVocab.illustration_url ? (
                      <img
                        src={selectedVocab.illustration_url}
                        alt={`Ảnh minh họa ${selectedVocab.word}`}
                        className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <div className="w-24 h-24 rounded-3xl bg-amber-100 flex items-center justify-center text-4xl mb-2 shadow-inner">
                          🎨
                        </div>
                        <span className="text-xs font-bold text-amber-700">
                          {selectedVocab.word}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tên Từ Vựng Khổng Lồ Cho Bé */}
                  <div className="w-full mt-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-amber-950 tracking-tight select-none drop-shadow-2xs">
                        {selectedVocab.word}
                      </h2>

                      {/* Nút Nghe Phát Âm To Rõ */}
                      <button
                        onClick={() => speakWord(selectedVocab.word)}
                        className="w-12 h-12 rounded-2xl bg-amber-400 hover:bg-amber-500 text-white shadow-md hover:shadow-lg transition-transform active:scale-90 flex items-center justify-center cursor-pointer shrink-0"
                        title="Nghe phát âm từ này"
                      >
                        <Volume2 className="w-6 h-6 stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Ý nghĩa của từ */}
                    <p className="text-base sm:text-lg font-bold text-amber-800/90 mt-1">
                      {selectedVocab.meaning}
                    </p>

                    {/* Hướng dẫn thao tác tay nếu có */}
                    {selectedVocab.description && (
                      <div className="mt-3 p-3 bg-white/90 rounded-2xl border border-amber-200/90 text-xs text-amber-900 text-left flex items-start gap-2 shadow-2xs">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">
                          <strong>Ký hiệu tay:</strong> {selectedVocab.description}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ------------------------------------------------------------------- */}
                {/* CỘT PHẢI (Hành động - Motion & Gesture): Video Player & Ảnh Cử Chỉ     */}
                {/* ------------------------------------------------------------------- */}
                <div className="flex flex-col gap-4 h-full min-h-[380px] lg:min-h-[460px]">
                  {/* Nửa trên: Video Player (YouTube iframe) bo góc tròn */}
                  <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-lg border-3 border-amber-300 shrink-0">
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

                  {/* Nửa dưới: Ảnh Cử Chỉ Tĩnh (gesture_image_url) để đối chiếu */}
                  <div className="flex-1 bg-gradient-to-b from-white to-amber-50/40 rounded-3xl border-2 border-amber-200 p-3.5 sm:p-4 flex flex-col justify-between shadow-xs overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 uppercase tracking-wide">
                        <Hand className="w-4 h-4 text-amber-600" />
                        <span>Động tác tay đối chiếu</span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                        Bé làm theo nhé! 👋
                      </span>
                    </div>

                    <div className="w-full flex-1 min-h-[140px] max-h-[220px] rounded-2xl bg-white border border-amber-200 flex items-center justify-center p-2 overflow-hidden shadow-inner">
                      {selectedVocab.gesture_image_url ? (
                        <img
                          src={selectedVocab.gesture_image_url}
                          alt={`Cử chỉ tay ${selectedVocab.word}`}
                          className="w-full h-full object-contain rounded-xl"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-3 text-amber-700">
                          <span className="text-3xl mb-1">🤟</span>
                          <span className="text-xs font-semibold text-gray-500">
                            Bé nhìn theo video cử chỉ ở khung trên nhé!
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. KHU VỰC ĐIỀU HƯỚNG BÊN DƯỚI (Bottom Thumbnail Carousel)                  */}
          {/* ========================================================================= */}
          <div className="mt-5 sm:mt-6 bg-white/90 backdrop-blur-md rounded-3xl border-2 border-amber-200 p-3.5 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎨</span>
                <span className="text-xs sm:text-sm font-black text-amber-950">
                  Danh mục từ vựng ({vocabularies.length} từ)
                </span>
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                Bé chạm vào thẻ để đổi bài nhé 👇
              </span>
            </div>

            {/* Dải băng chuyền cuộn ngang (Horizontal Scroll Carousel) */}
            <div
              ref={carouselRef}
              className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 px-1 scroll-smooth"
              style={{ scrollbarWidth: 'thin' }}
            >
              {vocabularies.map((vocab, index) => {
                const isSelected = selectedVocab?.id === vocab.id

                return (
                  <button
                    key={vocab.id}
                    ref={(el) => {
                      itemRefs.current[vocab.id] = el
                    }}
                    onClick={() => setSelectedVocab(vocab)}
                    className={`shrink-0 flex flex-col items-center justify-between p-2 rounded-2xl transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'w-24 sm:w-28 bg-gradient-to-b from-amber-200 via-orange-100 to-amber-200 border-3 border-amber-500 shadow-md scale-105 -translate-y-1'
                        : 'w-22 sm:w-26 bg-amber-50/60 hover:bg-amber-100/80 border-2 border-amber-200/80 hover:border-amber-300 hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Thumbnail vuông */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white border border-amber-200 flex items-center justify-center p-1 shadow-2xs">
                      {vocab.illustration_url ? (
                        <img
                          src={vocab.illustration_url}
                          alt={vocab.word}
                          className="w-full h-full object-contain"
                        />
                      ) : vocab.gesture_image_url ? (
                        <img
                          src={vocab.gesture_image_url}
                          alt={vocab.word}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-2xl select-none">🤟</span>
                      )}
                    </div>

                    {/* Tên từ vựng */}
                    <span
                      className={`text-xs font-black truncate max-w-full mt-1.5 ${
                        isSelected ? 'text-amber-950 font-extrabold' : 'text-gray-700'
                      }`}
                    >
                      {vocab.word}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Màn hình Kiểm tra từ vựng (Video-to-Text Quiz) */}
      <VideoQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        topicTitle={topic.title}
        vocabularies={vocabularies}
      />
    </div>
  )
}
