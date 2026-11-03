export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient'
import PracticeView from '@/app/components/PracticeView'

export default async function PracticeGeneralPage({
  searchParams,
}: {
  searchParams: Promise<{ topicId?: string; man?: string }>
}) {
  const { topicId } = await searchParams

  // Lấy tất cả topics
  const { data: allTopics } = await supabase
    .from('topics')
    .select('id, title, description, is_free')
    .order('created_at', { ascending: true })

  const topicsList = allTopics ?? []

  // Chọn topic: ưu tiên topicId nếu có, ngược lại lấy topic đầu tiên
  const currentTopic = topicId
    ? topicsList.find((t) => t.id === topicId) || topicsList[0] || null
    : topicsList[0] || null

  let vocabularies: any[] = []
  if (currentTopic) {
    const { data: vocabulariesData } = await supabase
      .from('vocabularies')
      .select('id, word, meaning, description, video_url')
      .eq('topic_id', currentTopic.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    vocabularies = vocabulariesData ?? []
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#1A8CFF] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PracticeView
        topicId={currentTopic?.id}
        initialTopic={currentTopic}
        initialVocabularies={vocabularies}
        allTopics={topicsList}
      />
    </Suspense>
  )
}
