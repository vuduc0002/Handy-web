export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient'
import HeroSection from '@/app/components/HeroSection'
import StatsAndBenefitsSection from '@/app/components/StatsAndBenefitsSection'
import TopicsSection from '@/app/components/TopicsSection'
import TestimonialsSection from '@/app/components/TestimonialsSection'
import FAQSection from '@/app/components/FAQSection'
import type { Topic } from '@/app/components/TopicsGrid'

// Truy xuất danh sách topics mới nhất từ database (no-cache để phản ánh tức thì quyền VIP/Admin)
async function getFreshTopics(): Promise<Topic[]> {
  try {
    const { data: topics, error } = await supabase
      .from('topics')
      .select('id, title, description, is_free')
      .order('created_at', { ascending: true })

    if (error) {
      console.warn('Lỗi lấy topics trên server:', error.message)
      return []
    }
    return (topics as Topic[]) ?? []
  } catch (e) {
    console.warn('Exception lấy topics:', e)
    return []
  }
}

// Server Component bất đồng bộ tải dữ liệu chủ đề
async function AsyncTopicsSection() {
  const topics = await getFreshTopics()
  return <TopicsSection initialTopics={topics} />
}

// Skeleton hiển thị lập tức nếu cache chưa sẵn sàng, tuyệt đối không chặn render trang chủ
function TopicsGridSkeleton() {
  return (
    <section className="pt-8 md:pt-16 pb-8 md:pb-12 scroll-mt-20">
      <div className="text-center mb-10 md:mb-12">
        <div className="w-36 h-6 bg-amber-100 rounded-full mx-auto mb-3 animate-pulse" />
        <div className="w-64 h-8 bg-amber-200/60 rounded-xl mx-auto mb-3 animate-pulse" />
        <div className="w-80 h-4 bg-amber-100 rounded-lg mx-auto animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl border-2 border-amber-200 p-6 shadow-sm animate-pulse"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div className="h-5 bg-amber-200/70 rounded-full w-3/4" />
                <div className="h-3.5 bg-amber-100 rounded-full w-full" />
                <div className="h-3.5 bg-amber-100 rounded-full w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      {/* 1. HERO SECTION (Hấp dẫn, giàu thị giác, load ngay lập tức) */}
      <HeroSection />

      {/* 2. STATS & BENEFITS SECTION (Khối thông tin nổi bật với hiệu ứng Domino Stagger) */}
      <StatsAndBenefitsSection />

      {/* 3. LỘ TRÌNH HỌC TẬP (Bọc trong Suspense + unstable_cache để trang chủ xuất hiện ngay không chặn điều hướng) */}
      <Suspense fallback={<TopicsGridSkeleton />}>
        <AsyncTopicsSection />
      </Suspense>

      {/* 4. TESTIMONIALS (Đánh giá học viên & phụ huynh với hiệu ứng Domino Stagger) */}
      <TestimonialsSection />

      {/* 5. FAQ SECTION (Giải đáp thắc mắc thường gặp với hiệu ứng Scroll Reveal) */}
      <FAQSection />
    </div>
  )
}
