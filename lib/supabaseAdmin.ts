import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.warn('[supabaseAdmin] Cảnh báo: SUPABASE_SERVICE_ROLE_KEY chưa được cấu hình. Hệ thống sẽ dùng anon key thay thế.')
}

// Client này chạy ở phía Server, bypass hoàn toàn RLS để admin xem được 100% dữ liệu
export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)
