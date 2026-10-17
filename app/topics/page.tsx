import { Suspense } from 'react'
import TopicsGrid from '@/app/components/TopicsGrid'
import { Loader2, Layers, BookOpen, Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

function TopicsSkeleton() {
  return (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
    </div>
  )
}

export default function TopicsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
      {/* Header khu vực chủ đề */}
      <div className="text-center max-w-2xl mx-auto mb-10 animate-slide-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs sm:text-sm font-extrabold mb-3">
          <Layers className="w-4 h-4 text-orange-500" />
          <span>Kho Bài Giảng Ngôn Ngữ Ký Hiệu</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-gray-800 tracking-tight mb-3">
          Danh Sách Chủ Đề Bài Học
        </h1>

        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          Khám phá các chủ đề học tập trực quan được biên soạn tỉ mỉ dành cho trẻ em và người mới bắt đầu. Chọn một chủ đề để học từ vựng ngay!
        </p>
      </div>

      {/* Lưới danh sách các chủ đề từ Supabase */}
      <Suspense fallback={<TopicsSkeleton />}>
        <TopicsGrid />
      </Suspense>
    </div>
  )
}
