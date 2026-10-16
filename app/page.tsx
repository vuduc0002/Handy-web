import { Suspense } from 'react'
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
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Hero section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-3">
          🌟 Học Ngôn Ngữ Ký Hiệu
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Khám phá từ vựng qua video sinh động, học cùng <span className="text-orange-500 font-bold">HANDY</span> thật vui và dễ dàng!
        </p>
      </div>

      {/* Topics grid */}
      <Suspense fallback={<GridSkeleton />}>
        <TopicsGrid />
      </Suspense>
    </div>
  )
}
