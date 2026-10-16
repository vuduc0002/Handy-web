export const dynamic = 'force-dynamic';

import { supabase } from '@/lib/supabaseClient';
import TopicDetailView, { Topic, Vocabulary } from '@/app/components/TopicDetailView';

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Lấy thông tin chủ đề theo id
  const { data: topicData } = await supabase
    .from('topics')
    .select('*')
    .eq('id', id)
    .single();

  // Lấy danh sách vocabularies từ Supabase theo topic_id (chỉ lấy is_deleted = false)
  const { data: vocabulariesData } = await supabase
    .from('vocabularies')
    .select('*')
    .eq('topic_id', id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true });

  const topic: Topic | null = topicData ?? null;
  const vocabularies: Vocabulary[] = vocabulariesData ?? [];

  return (
    <TopicDetailView
      topicId={id}
      initialTopic={topic}
      initialVocabularies={vocabularies}
    />
  );
}
