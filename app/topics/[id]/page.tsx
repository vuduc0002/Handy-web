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
  let topic: Topic | null = null;
  let vocabularies: Vocabulary[] = [];

  try {
    const { data: topicData, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!error && topicData) {
      topic = topicData;

      // Lấy danh sách vocabularies từ Supabase theo topic_id (chỉ lấy is_deleted = false)
      const { data: vocabulariesData } = await supabase
        .from('vocabularies')
        .select('*')
        .eq('topic_id', id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      vocabularies = vocabulariesData ?? [];
    }
  } catch (err) {
    console.error('Lỗi khi tải thông tin chủ đề:', err);
  }

  return (
    <TopicDetailView
      topicId={id}
      initialTopic={topic}
      initialVocabularies={vocabularies}
    />
  );
}
