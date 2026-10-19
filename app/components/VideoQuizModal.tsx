'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCw,
  ArrowRight,
  ArrowLeft,
  Volume2,
  HelpCircle,
  Video
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { getEmbedYoutubeUrl } from '@/lib/utils'

export interface QuizVocabulary {
  id: string
  word: string
  meaning?: string
  video_url: string
  description?: string | null
}

interface QuizOption {
  id: string
  word: string
  meaning?: string
  isCorrect: boolean
}

interface QuizQuestion {
  id: string
  targetWord: QuizVocabulary
  options: QuizOption[]
}

interface VideoQuizModalProps {
  isOpen: boolean
  onClose: () => void
  topicTitle: string
  vocabularies: QuizVocabulary[]
}

// Fallback pool nếu database có ít hơn 4 từ
const FALLBACK_WORDS = [
  { id: 'fb-1', word: 'Xin chào', meaning: 'Lời chào khi gặp gỡ' },
  { id: 'fb-2', word: 'Cảm ơn', meaning: 'Bày tỏ lòng biết ơn' },
  { id: 'fb-3', word: 'Tạm biệt', meaning: 'Lời chào khi chia tay' },
  { id: 'fb-4', word: 'Xin lỗi', meaning: 'Nhận lỗi khi làm phiền' },
  { id: 'fb-5', word: 'Yêu thương', meaning: 'Tình cảm quý mến' },
  { id: 'fb-6', word: 'Gia đình', meaning: 'Tổ ấm yêu thương' },
  { id: 'fb-7', word: 'Bạn bè', meaning: 'Những người bạn tốt' },
  { id: 'fb-8', word: 'Trường học', meaning: 'Nơi học tập vui vẻ' },
]

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']

export default function VideoQuizModal({
  isOpen,
  onClose,
  topicTitle,
  vocabularies
}: VideoQuizModalProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(true)

  // Khởi tạo và tạo bộ câu hỏi tự động
  const generateQuiz = useCallback(async () => {
    if (!vocabularies || vocabularies.length === 0) {
      setQuestions([])
      setLoadingQuestions(false)
      return
    }

    setLoadingQuestions(true)
    setCurrentIndex(0)
    setSelectedOptionIndex(null)
    setScore(0)
    setIsFinished(false)

    try {
      // Lấy thêm danh sách từ vựng từ Supabase để làm pool đáp án sai phong phú
      let distractorPool: { id: string; word: string; meaning?: string }[] = []
      const { data: dbVocabs } = await supabase
        .from('vocabularies')
        .select('id, word, meaning')
        .eq('is_deleted', false)
        .limit(60)

      if (dbVocabs && dbVocabs.length > 0) {
        distractorPool = dbVocabs
      } else {
        distractorPool = FALLBACK_WORDS
      }

      // Tạo câu hỏi cho mỗi từ trong chủ đề hiện tại
      const generatedQuestions: QuizQuestion[] = vocabularies.map((target) => {
        // Lấy các từ khác làm đáp án sai (loại trừ từ đúng hiện tại theo word & id)
        const candidates = distractorPool.filter(
          (item) =>
            item.id !== target.id &&
            item.word.trim().toLowerCase() !== target.word.trim().toLowerCase()
        )

        const shuffledCandidates = shuffleArray(candidates)
        const wrongAnswers = shuffledCandidates.slice(0, 3)

        // Nếu thiếu đáp án sai, bổ sung từ fallback
        if (wrongAnswers.length < 3) {
          const needed = 3 - wrongAnswers.length
          const additional = FALLBACK_WORDS.filter(
            (fb) =>
              fb.word.trim().toLowerCase() !== target.word.trim().toLowerCase() &&
              !wrongAnswers.some(
                (w) => w.word.trim().toLowerCase() === fb.word.trim().toLowerCase()
              )
          ).slice(0, needed)
          wrongAnswers.push(...additional)
        }

        // Tạo 4 phương án lựa chọn
        const correctOpt: QuizOption = {
          id: target.id,
          word: target.word,
          meaning: target.meaning,
          isCorrect: true,
        }

        const wrongOpts: QuizOption[] = wrongAnswers.map((w) => ({
          id: w.id,
          word: w.word,
          meaning: w.meaning,
          isCorrect: false,
        }))

        const shuffledOptions = shuffleArray([correctOpt, ...wrongOpts])

        return {
          id: target.id,
          targetWord: target,
          options: shuffledOptions,
        }
      })

      // Trộn ngẫu nhiên thứ tự các câu hỏi trong đề
      setQuestions(shuffleArray(generatedQuestions))
    } catch (err) {
      console.error('Error generating video quiz:', err)
    } finally {
      setLoadingQuestions(false)
    }
  }, [vocabularies])

  useEffect(() => {
    if (isOpen) {
      generateQuiz()
    }
  }, [isOpen, generateQuiz])

  // Ngăn cuộn trang body khi modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length
  const progressPercent = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0
  const isAnswered = selectedOptionIndex !== null
  const isLastQuestion = currentIndex === totalQuestions - 1

  // Xử lý khi người dùng chọn đáp án
  const handleSelectOption = (index: number) => {
    if (isAnswered) return // Đã trả lời thì khóa không cho chọn lại

    setSelectedOptionIndex(index)
    const chosen = currentQuestion.options[index]
    if (chosen.isCorrect) {
      setScore((prev) => prev + 1)
    }
  }

  // Chuyển sang câu tiếp theo
  const handleNext = () => {
    if (isLastQuestion) {
      setIsFinished(true)
    } else {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOptionIndex(null)
    }
  }

  // Khởi động lại bài kiểm tra
  const handleRestart = () => {
    generateQuiz()
  }

  const isMp4 = currentQuestion?.targetWord.video_url?.toLowerCase().endsWith('.mp4')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-amber-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* ================================================================
            MODAL HEADER: Tiến trình + Nút đóng
            ================================================================ */}
        <div className="p-4 sm:p-5 border-b border-amber-100 bg-amber-50/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-orange-100 text-orange-600">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 block">
                Kiểm tra từ vựng • {topicTitle}
              </span>
              <h2 className="text-base sm:text-lg font-black text-gray-800">
                {!isFinished ? `Câu hỏi ${currentIndex + 1} / ${totalQuestions}` : 'Hoàn thành bài kiểm tra'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-800 border border-gray-200 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0 shadow-xs"
            title="Đóng bài kiểm tra"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thanh Progress Bar */}
        {!isFinished && totalQuestions > 0 && (
          <div className="w-full bg-amber-100 h-2 shrink-0">
            <div
              className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 h-2 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* ================================================================
            MODAL BODY
            ================================================================ */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {loadingQuestions ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-bold text-gray-600">Đang chuẩn bị đề kiểm tra thủ ngữ...</p>
            </div>
          ) : totalQuestions === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-2xl">
                📖
              </div>
              <h3 className="text-lg font-extrabold text-gray-800">Chưa có từ vựng để kiểm tra</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Chủ đề này chưa có dữ liệu từ vựng. Vui lòng quay lại bài học hoặc chọn chủ đề khác.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm shadow hover:bg-orange-600 transition"
              >
                Quay về bài học
              </button>
            </div>
          ) : isFinished ? (
            /* ================================================================
                MÀN HÌNH TỔNG KẾT (RESULT SCREEN)
                ================================================================ */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="py-6 text-center space-y-6"
            >
              {/* Icon Cúp vinh danh */}
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-400 text-white flex items-center justify-center mx-auto shadow-xl shadow-orange-200">
                  <Trophy className="w-12 h-12" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="inline-block text-xs font-black uppercase tracking-wider text-orange-700 bg-orange-100 px-3.5 py-1 rounded-full mb-2">
                  Báo cáo kết quả kiểm tra
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
                  {score === totalQuestions
                    ? '🎉 Xuất sắc! Tuyệt đối 100%'
                    : score >= totalQuestions * 0.7
                    ? '🌟 Làm tốt lắm! Bạn đã nắm vững bài'
                    : '💪 Hãy cố gắng thêm nhé!'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Bạn đã trả lời đúng{' '}
                  <strong className="text-orange-600 font-black text-base">
                    {score} / {totalQuestions}
                  </strong>{' '}
                  câu hỏi thủ ngữ.
                </p>
              </div>

              {/* Bảng điểm chi tiết */}
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-[11px] font-bold text-emerald-700 block">Số câu đúng</span>
                  <span className="text-2xl font-black text-emerald-800">{score}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                  <span className="text-[11px] font-bold text-rose-700 block">Số câu sai</span>
                  <span className="text-2xl font-black text-rose-800">{totalQuestions - score}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                  <span className="text-[11px] font-bold text-amber-700 block">Độ chính xác</span>
                  <span className="text-2xl font-black text-amber-800">
                    {Math.round((score / totalQuestions) * 100)}%
                  </span>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-md mx-auto">
                <button
                  onClick={handleRestart}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm shadow-md transition active:scale-95 cursor-pointer"
                >
                  <RotateCw className="w-4 h-4" />
                  Làm lại bài kiểm tra
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-sm transition active:scale-95 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Trở về bài học
                </button>
              </div>
            </motion.div>
          ) : (
            /* ================================================================
                GIAO DIỆN CÂU HỎI KIỂM TRA (TEST MODE)
                ================================================================ */
            <div className="space-y-4">
              {/* KHUNG VIDEO KÝ HIỆU — TUYỆT ĐỐI KHÔNG HIỂN THỊ TÊN TỪ VỰNG */}
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg border-2 border-amber-300 flex items-center justify-center">
                {currentQuestion.targetWord.video_url ? (
                  isMp4 ? (
                    <video
                      key={currentQuestion.targetWord.id}
                      src={currentQuestion.targetWord.video_url}
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <iframe
                      key={currentQuestion.targetWord.id}
                      src={getEmbedYoutubeUrl(currentQuestion.targetWord.video_url)}
                      title="Video câu hỏi kiểm tra thủ ngữ"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full aspect-video border-0 h-full"
                    />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 text-xs p-4 text-center">
                    <Video className="w-8 h-8 mb-2 opacity-50" />
                    <span>Video câu hỏi không khả dụng</span>
                  </div>
                )}
              </div>

              {/* Lời gợi ý quan sát */}
              <p className="text-center text-xs font-bold text-amber-800 bg-amber-50/80 py-1.5 px-4 rounded-full border border-amber-200 max-w-md mx-auto">
                👀 Hãy quan sát động tác ký hiệu trong video và chọn từ vựng đúng:
              </p>

              {/* LƯỚI 4 ĐÁP ÁN: 2x2 Desktop, Stack Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOptionIndex === idx
                  const showCorrect = isAnswered && option.isCorrect
                  const showWrong = isAnswered && isSelected && !option.isCorrect

                  let cardStyle =
                    'bg-white border-2 border-amber-200 text-gray-800 hover:border-orange-400 hover:bg-orange-50/50 hover:scale-[1.01]'

                  if (showCorrect) {
                    cardStyle =
                      'bg-green-500 text-white border-green-600 shadow-md scale-[1.01] ring-2 ring-green-300'
                  } else if (showWrong) {
                    cardStyle =
                      'bg-red-500 text-white border-red-600 shadow-md ring-2 ring-red-300'
                  } else if (isAnswered) {
                    cardStyle = 'bg-gray-50 border-gray-200 text-gray-400 opacity-60 cursor-not-allowed'
                  }

                  return (
                    <button
                      key={option.id + '-' + idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`
                        w-full p-4 rounded-2xl border-2 font-bold text-center transition-all duration-200
                        flex items-center justify-between gap-3 text-sm sm:text-base select-none
                        ${cardStyle}
                        ${!isAnswered ? 'cursor-pointer active:scale-95' : 'cursor-default'}
                      `}
                    >
                      {/* Badge A, B, C, D */}
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                          showCorrect || showWrong
                            ? 'bg-white/20 text-white'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {OPTION_LABELS[idx]}
                      </span>

                      {/* Tên từ vựng */}
                      <span className="flex-1 text-center font-extrabold break-words">
                        {option.word}
                      </span>

                      {/* Icon trạng thái khi đã chọn */}
                      <span className="w-6 h-6 flex items-center justify-center shrink-0">
                        {showCorrect && <CheckCircle2 className="w-5 h-5 text-white" />}
                        {showWrong && <XCircle className="w-5 h-5 text-white" />}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Thông báo kết quả câu hiện tại & Nút câu tiếp theo */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3"
                  >
                    <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                      {currentQuestion.options[selectedOptionIndex].isCorrect ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Chính xác! Bạn giỏi quá! 🎉
                        </span>
                      ) : (
                        <span className="text-rose-600 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Chưa đúng rồi! Đáp án đúng là:{' '}
                          <strong className="underline ml-0.5">
                            {currentQuestion.targetWord.word}
                          </strong>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={handleNext}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{isLastQuestion ? 'Xem kết quả 🎉' : 'Câu tiếp theo'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
