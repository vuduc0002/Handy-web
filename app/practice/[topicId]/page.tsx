export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabaseClient'
import PracticeView from '@/app/components/PracticeView'

export default async function PracticePage({
  params,
}: {
  params: Promise<{ topicId: string }>
}) {
  const { topicId } = await params

  // Lấy thông tin topic
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
    <PracticeView
      topicId={topicId}
      initialTopic={topicData ?? null}
      initialVocabularies={vocabulariesData ?? []}
    />
  )
}
