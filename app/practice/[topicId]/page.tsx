export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient'
import PracticeView from '@/app/components/PracticeView'

export default async function PracticeByTopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>
}) {
  const { topicId } = await params

  // Lấy tất cả topics cho sidebar
  const { data: allTopics } = await supabase
    .from('topics')
    .select('id, title, description, is_free')
    .order('created_at', { ascending: true })

  // Lấy thông tin topic hiện tại
  const { data: topicData } = await supabase
    .from('topics')
    .select('id, title, description, is_free')
    .eq('id', topicId)
    .single()

  // Lấy danh sách từ vựng của topic
  const { data: vocabulariesData } = await supabase
    .from('vocabularies')
    .select('id, word, meaning, description, video_url')
    .eq('topic_id', topicId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#1A8CFF] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PracticeView
        topicId={topicId}
        initialTopic={topicData ?? null}
        initialVocabularies={vocabulariesData ?? []}
        allTopics={allTopics ?? []}
      />
    </Suspense>
  )
}
