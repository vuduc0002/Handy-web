export const revalidate = 60

import { supabase } from '@/lib/supabaseClient'
import HeroSection from '@/app/components/HeroSection'
import StatsAndBenefitsSection from '@/app/components/StatsAndBenefitsSection'
import TopicsSection from '@/app/components/TopicsSection'
import TestimonialsSection from '@/app/components/TestimonialsSection'
import FAQSection from '@/app/components/FAQSection'
import type { Topic } from '@/app/components/TopicsGrid'

export default async function HomePage() {
  // Server-side fetching với cache revalidate 60s và chỉ chọn lọc các trường cần thiết
  const { data: topics } = await supabase
    .from('topics')
    .select('id, title, description, is_free')
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      {/* 1. HERO SECTION (Hấp dẫn, giàu thị giác, 2 cột + hiệu ứng fade-in-up) */}
      <HeroSection />

      {/* 2. STATS & BENEFITS SECTION (Khối thông tin nổi bật với hiệu ứng Domino Stagger) */}
      <StatsAndBenefitsSection />

      {/* 3. LỘ TRÌNH HỌC TẬP (Server-side rendered, load ngay tức thì dưới 1s) */}
      <TopicsSection initialTopics={(topics as Topic[]) ?? []} />

      {/* 4. TESTIMONIALS (Đánh giá học viên & phụ huynh với hiệu ứng Domino Stagger) */}
      <TestimonialsSection />

      {/* 5. FAQ SECTION (Giải đáp thắc mắc thường gặp với hiệu ứng Scroll Reveal) */}
      <FAQSection />
    </div>
  )
}
