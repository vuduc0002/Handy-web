import { Suspense } from 'react'
import HeroSection from '@/app/components/HeroSection'
import FeaturesSection from '@/app/components/FeaturesSection'
import TopicsGrid from '@/app/components/TopicsGrid'
import { Loader2 } from 'lucide-react'

function GridSkeleton() {
  return (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 pb-16">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Features Section */}
      <FeaturesSection />

      {/* 3. Topics Section */}
      <section id="topics-section" className="pt-8 md:pt-12 scroll-mt-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight mb-2">
            [Điền Tiêu đề: Giới thiệu danh sách bài học hoặc lộ trình]
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            [Điền Mô tả: Hướng dẫn người dùng chọn chủ đề để bắt đầu]
          </p>
        </div>

        {/* Topics grid with Supabase integration */}
        <Suspense fallback={<GridSkeleton />}>
          <TopicsGrid />
        </Suspense>
      </section>
    </div>
  )
}
