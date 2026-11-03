export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import {
  ClipboardCheck,
  Crown,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

interface Topic {
  id: string
  title: string
  description: string | null
  is_free: boolean
}

const GRADIENTS = [
  'linear-gradient(135deg,#FFB36B 0%,#F0436A 100%)',
  'linear-gradient(135deg,#5CB0FF 0%,#1A6FE0 100%)',
  'linear-gradient(135deg,#FAD961 0%,#F76B1C 100%)',
  'linear-gradient(135deg,#6FDDB0 0%,#17A673 100%)',
  'linear-gradient(135deg,#B993D6 0%,#8CA6DB 100%)',
  'linear-gradient(135deg,#FFA7A6 0%,#FF5858 100%)',
]

export default async function QuizSelectionPage() {
  const { data: topics } = await supabase
    .from('topics')
    .select('id, title, description, is_free')
    .order('created_at', { ascending: true })

  const topicList: Topic[] = topics ?? []

  return (
    <div className="min-h-screen bg-white">
      {/* 01 BANNER KIỂM TRA CHUẨN HANDY V2 */}
      <section className="relative overflow-hidden bg-[radial-gradient(45%_80%_at_100%_0%,#F1EBFB_0%,rgba(241,235,251,0)_70%),radial-gradient(40%_70%_at_0%_100%,#FFF3D6_0%,rgba(255,243,214,0)_70%),#FBFAFE] border-b border-[#EFEAF9]">
        {/* Floating decorative elements */}
        <span
          aria-hidden="true"
          className="absolute left-[7%] top-[60px] w-4 h-4 rounded-full bg-[#F0436A] pointer-events-none opacity-80"
        />
        <span
          aria-hidden="true"
          className="absolute right-[9%] top-[50px] w-8 h-8 rounded-full border-4 border-[#F9C31F] pointer-events-none opacity-75"
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-10 pb-16 flex flex-col items-center gap-3.5 text-center">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[#6B6B6B]">
            <Link href="/" className="hover:text-[#1A8CFF] transition-colors">
              Trang chủ
            </Link>
            <span className="text-[#A0A0A0]">/</span>
            <span className="text-[#7B5BB5] font-semibold">Kiểm tra</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1E1E1E] tracking-tight leading-tight">
            Kiểm tra <span className="text-[#7B5BB5]">kiến thức</span> sau mỗi chủ đề
          </h1>
          <p className="text-sm sm:text-base text-[#4A4A4A] max-w-xl leading-relaxed">
            Làm bài kiểm tra ngắn với video trực quan để biết bạn đã nhớ những ký hiệu nào và cần ôn lại phần nào.
          </p>
        </div>
      </section>

      {/* 02 DANH SÁCH CHỦ ĐỀ KIỂM TRA */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E1E1E]">
              Chọn chủ đề kiểm tra
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">
              Mỗi chủ đề gồm các câu hỏi trắc nghiệm qua video cử chỉ bàn tay.
            </p>
          </div>
          <span className="text-sm font-semibold text-[#7B5BB5] bg-[#F1EBFB] px-3.5 py-1.5 rounded-full">
            {topicList.length} chủ đề
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topicList.map((t, idx) => {
            const grad = GRADIENTS[idx % GRADIENTS.length]

            return (
              <article
                key={t.id}
                className="flex flex-col justify-between p-6 sm:p-7 rounded-[22px] bg-white border border-[#ECEEF3] hover:border-[#7B5BB5] hover:shadow-[0_18px_40px_rgba(123,91,181,0.14)] hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div
                      style={{ background: grad }}
                      className="w-13 h-13 min-w-[52px] min-h-[52px] rounded-2xl text-white flex items-center justify-center shadow-[0_10px_22px_rgba(20,30,60,0.14)] group-hover:scale-105 transition-transform"
                    >
                      <ClipboardCheck className="w-6 h-6 stroke-[2.2]" />
                    </div>

                    {t.is_free ? (
                      <span className="shrink-0 text-xs font-semibold px-3 py-1 rounded-full bg-[#E3F7EE] text-[#0C8558]">
                        Miễn phí
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs font-bold px-3 py-1 rounded-full bg-[#FFF1C9] text-[#9A5B00] flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5 fill-[#F7A21B] text-[#F7A21B]" /> VIP
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-[#8A8F99] tracking-wide uppercase">
                    Chủ đề {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </span>

                  <h3 className="text-lg sm:text-xl font-bold text-[#1E1E1E] group-hover:text-[#7B5BB5] transition-colors leading-snug">
                    {t.title}
                  </h3>

                  {t.description && (
                    <p className="text-sm text-[#4A4A4A] leading-relaxed line-clamp-2">
                      {t.description}
                    </p>
                  )}
                </div>

                <div className="pt-6">
                  <Link
                    href={`/topics/${t.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F1EBFB] text-[#7B5BB5] hover:bg-[#7B5BB5] hover:text-white text-sm font-semibold transition-all duration-200 shadow-sm"
                  >
                    <span>Vào làm bài kiểm tra</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.4]" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
