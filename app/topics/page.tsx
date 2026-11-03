export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabaseClient'
import TopicsGrid, { Topic } from '@/app/components/TopicsGrid'

export default async function TopicsPage() {
  const { data: topics } = await supabase
    .from('topics')
    .select('id, title, description, is_free')
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-white">
      <TopicsGrid initialTopics={(topics as Topic[]) ?? []} />
    </div>
  )
}
