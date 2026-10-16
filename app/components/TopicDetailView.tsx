'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import {
  ArrowLeft,
  Play,
  Volume2,
  BookOpen,
  Lock,
  Crown,
  Sparkles,
  Info
} from 'lucide-react'

export interface Vocabulary {
  id: string
  topic_id: string
  word: string
  meaning: string
  description: string | null
  video_url: string
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

import { getEmbedYoutubeUrl } from '@/lib/utils'


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
          .select('is_premium, role')
          .eq('id', user.id)
          .maybeSingle()

        if (isMounted) {
          const hasAccess = profile?.role === 'ADMIN' || profile?.is_premium === true
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

  // Phát âm thử từ vựng bằng Web Speech API
  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'vi-VN'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  // Khóa quyền truy cập nếu là VIP và user chưa nâng cấp
  if (isLocked && !checkingAccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border-2 border-amber-300 p-8 shadow-xl">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-500 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Lock className="w-10 h-10" />
          </div>
          <span className="inline-block text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            Nội dung Premium
          </span>
          <h2 className="text-2xl font-extrabold text-gray-800 mb-3">
            {topic?.title || 'Chủ đề bị khóa'}
          </h2>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Chủ đề này chỉ dành riêng cho tài khoản đã nâng cấp VIP. Hãy nâng cấp ngay để mở khóa toàn bộ kho từ vựng thủ ngữ!
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
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-lg shadow-amber-200 transition active:scale-95"
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
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow transition"
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
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      {/* Header điều hướng & Tiêu đề bài học */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-3xl border-2 border-amber-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-10 h-10 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-800 flex items-center justify-center transition shrink-0 active:scale-95"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-gray-800 line-clamp-1">
                {topic.title}
              </h1>
              {topic.is_free ? (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full shrink-0">
                  Miễn phí
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> VIP
                </span>
              )}
            </div>
            {topic.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                {topic.description}
              </p>
            )}
          </div>
        </div>

        <div className="text-sm font-bold text-amber-700 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200 flex items-center gap-2 self-start md:self-auto shrink-0">
          <BookOpen className="w-4 h-4 text-orange-500" />
          <span>{vocabularies.length} từ vựng</span>
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
        /* Bố cục 2 phần: Trái là Video Iframe, Phải là Danh sách từ */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CỘT TRÁI: Khung video to & Thông tin chi tiết từ vựng đang chọn */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Khung phát Video */}
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-xl border-4 border-amber-300">
              {selectedVocab ? (
                isMp4 ? (
                  <video
                    key={selectedVocab.id}
                    src={selectedVocab.video_url}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <iframe
                    key={selectedVocab.id}
                    src={getEmbedYoutubeUrl(selectedVocab.video_url)}
                    title={selectedVocab.word}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full aspect-video rounded-xl shadow-md border-0 h-full"
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  Chọn một từ vựng để xem video
                </div>
              )}
            </div>

            {/* Chi tiết từ đang xem */}
            {selectedVocab && (
              <div className="bg-white rounded-3xl border-2 border-amber-200 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-extrabold text-orange-500">
                        {selectedVocab.word}
                      </h2>
                      <button
                        onClick={() => speakWord(selectedVocab.word)}
                        className="w-9 h-9 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 flex items-center justify-center transition active:scale-95"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-lg font-bold text-gray-700 mt-1">
                      {selectedVocab.meaning}
                    </p>
                  </div>

                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full shrink-0">
                    Đang xem
                  </span>
                </div>

                {selectedVocab.description && (
                  <div className="mt-4 bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-1">
                        Hướng dẫn ký hiệu bàn tay:
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {selectedVocab.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CỘT PHẢI: Danh sách từ vựng trong chủ đề */}
          <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-amber-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-100">
              <h3 className="font-extrabold text-gray-800 text-lg flex items-center gap-2">
                <span>📖</span> Danh sách từ vựng
              </h3>
              <span className="text-xs font-bold text-gray-400">
                Nhấp vào từ để đổi video
              </span>
            </div>

            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {vocabularies.map((vocab, index) => {
                const isSelected = selectedVocab?.id === vocab.id

                return (
                  <button
                    key={vocab.id}
                    onClick={() => setSelectedVocab(vocab)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-3.5 group ${
                      isSelected
                        ? 'bg-gradient-to-r from-orange-400 to-amber-400 border-orange-400 text-white shadow-md shadow-amber-200 -translate-y-0.5'
                        : 'bg-amber-50/50 hover:bg-amber-100/60 border-amber-200 text-gray-800'
                    }`}
                  >
                    {/* Số thứ tự hoặc Icon Play */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 transition ${
                        isSelected
                          ? 'bg-white text-orange-500 shadow-sm'
                          : 'bg-white border border-amber-200 text-amber-700 group-hover:bg-amber-200/50'
                      }`}
                    >
                      {isSelected ? <Play className="w-4 h-4 fill-current" /> : index + 1}
                    </div>

                    {/* Nội dung từ & nghĩa */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-extrabold text-base leading-snug line-clamp-1 ${
                          isSelected ? 'text-white' : 'text-gray-800'
                        }`}
                      >
                        {vocab.word}
                      </p>
                      <p
                        className={`text-xs line-clamp-1 mt-0.5 ${
                          isSelected ? 'text-white/90' : 'text-gray-500'
                        }`}
                      >
                        {vocab.meaning}
                      </p>
                    </div>

                    {/* Dấu hiệu đang chọn */}
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0 animate-ping" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
