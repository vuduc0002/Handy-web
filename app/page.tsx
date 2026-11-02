export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient'
import HeroSection from '@/app/components/landing/HeroSection'
import HighlightsSection from '@/app/components/landing/HighlightsSection'
import FeatureCardsSection from '@/app/components/landing/FeatureCardsSection'
import RoadmapSection, { RoadmapTopic } from '@/app/components/landing/RoadmapSection'
import AudienceSection from '@/app/components/landing/AudienceSection'
import FeedbackSection from '@/app/components/landing/FeedbackSection'
import FAQSection from '@/app/components/landing/FAQSection'
import CTASection from '@/app/components/landing/CTASection'

// Truy xuất danh sách topics mới nhất từ database
async function getFreshTopics(): Promise<RoadmapTopic[]> {
  try {
    const { data: topics, error } = await supabase
      .from('topics')
      .select('id, title, description, is_free')
      .order('created_at', { ascending: true })

    if (error) {
      console.warn('Lỗi lấy topics trên server:', error.message)
      return []
    }
    return (topics as RoadmapTopic[]) ?? []
  } catch (e) {
    console.warn('Exception lấy topics:', e)
    return []
  }
}

// Server Component bất đồng bộ tải dữ liệu chủ đề lộ trình
async function AsyncRoadmapSection() {
  const topics = await getFreshTopics()
  return <RoadmapSection initialTopics={topics} />
}

export default function HomePage() {
  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* 1. HERO SECTION (Banner chào mừng & hình ảnh minh họa) */}
      <HeroSection />

      {/* 2. HIGHLIGHTS / KHẢO SÁT (4 khối tính năng: Sách, Flashcard, Video, Tra cứu) */}
      <HighlightsSection />

      {/* 3. TÍNH NĂNG (4 thẻ màu: Từ điển, Bảng ký hiệu, Học trực quan, Theo chủ đề) */}
      <FeatureCardsSection />

      {/* 4. LỘ TRÌNH (Bộ lọc chủ đề, thẻ lộ trình kéo ngang & badge VIP/Miễn phí) */}
      <Suspense fallback={<RoadmapSection />}>
        <AsyncRoadmapSection />
      </Suspense>

      {/* 5. DÀNH CHO AI (Mục lục & Sách mở tương tác 3D) */}
      <AudienceSection />

      {/* 6. FEEDBACK (Băng chuyền vô tận đánh giá phụ huynh & người học) */}
      <FeedbackSection />

      {/* 7. FAQ (Accordion giải đáp thắc mắc cùng hình minh họa bé gái) */}
      <FAQSection />

      {/* 8. CTA BANNER (Kêu gọi hành động & nút bắt đầu) */}
      <CTASection />
    </div>
  )
}
