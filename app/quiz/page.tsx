import { Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { BrainCircuit, BookOpen, Crown, ChevronRight, Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Topic {
  id: string
  title: string
  description: string | null
  is_free: boolean
}

export default async function QuizSelectionPage() {
  const { data: topics } = await supabase
    .from('topics')
    .select('id, title, description, is_free')
    .order('created_at', { ascending: true })

  const topicList: Topic[] = topics ?? []

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs sm:text-sm font-extrabold mb-3">
          <BrainCircuit className="w-4 h-4 text-orange-500" />
          <span>Luyện Tập Phản Xạ Flashcard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-800 mb-3">
          Chọn Chủ Đề Luyện Tập Quizlet
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Ôn tập từ vựng qua thẻ lật thông minh và video cử chỉ bàn tay trực quan.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {topicList.map((t) => (
          <Link
            key={t.id}
            href={`/practice/${t.id}`}
            className="group bg-white rounded-3xl p-6 border-2 border-amber-200 hover:border-orange-400 hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
                  📖
                </span>
                {t.is_free ? (
                  <span className="shrink-0 text-[11px] font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-0.5 rounded-full">
                    Miễn phí
                  </span>
                ) : (
                  <span className="shrink-0 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-600" /> VIP
                  </span>
                )}
              </div>

              <h3 className="font-black text-gray-800 text-base sm:text-lg group-hover:text-orange-600 transition-colors break-words whitespace-normal leading-snug mb-1.5">
                {t.title}
              </h3>
              {t.description && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                  {t.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-black text-orange-600 pt-3 border-t border-amber-100 group-hover:gap-3 transition-all">
              <BrainCircuit className="w-4 h-4" />
              <span>Vào luyện Flashcard</span>
              <ChevronRight className="w-4 h-4 ml-auto" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
