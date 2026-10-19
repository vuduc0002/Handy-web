export const revalidate = 60

import { supabase } from '@/lib/supabaseClient'
import TopicsGrid, { Topic } from '@/app/components/TopicsGrid'
import { Layers } from 'lucide-react'

export default async function TopicsPage() {
  // Server-side fetching với cache 60s và chọn lọc các trường cần thiết
  const { data: topics } = await supabase
    .from('topics')
    .select('id, title, description, is_free')
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
      {/* Header khu vực chủ đề */}
      <div className="text-center max-w-2xl mx-auto mb-10 animate-slide-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs sm:text-sm font-extrabold mb-3">
          <Layers className="w-4 h-4 text-orange-500" />
          <span>Kho Bài Giảng Ngôn Ngữ Ký Hiệu</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
          Danh Sách Chủ Đề Bài Học
        </h1>

        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          Khám phá các chủ đề học tập trực quan được biên soạn tỉ mỉ dành cho trẻ em và người mới bắt đầu. Chọn một chủ đề để học từ vựng ngay!
        </p>
      </div>

      {/* Lưới danh sách các chủ đề từ Supabase được pre-render từ Server */}
      <TopicsGrid initialTopics={(topics as Topic[]) ?? []} />
    </div>
  )
}
