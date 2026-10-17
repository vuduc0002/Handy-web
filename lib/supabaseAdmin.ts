import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// ✅ Security Patch: Ném lỗi cứng nếu thiếu Service Role Key.
// Tránh silent fallback sang anon key — điều đó sẽ khiến supabaseAdmin bị RLS chặn
// mà không thông báo lỗi, gây ra các lỗi logic khó debug và nguy hiểm.
if (!supabaseUrl) {
  throw new Error('[supabaseAdmin] Thiếu biến môi trường NEXT_PUBLIC_SUPABASE_URL!')
}

if (!serviceRoleKey) {
  throw new Error(
    '[supabaseAdmin] Thiếu biến môi trường SUPABASE_SERVICE_ROLE_KEY! ' +
    'Client này KHÔNG ĐƯỢC dùng anon key làm fallback vì sẽ vi phạm bảo mật và bị RLS chặn.'
  )
}

// Client này chạy ở phía Server, bypass hoàn toàn RLS để admin xem được 100% dữ liệu.
// TUYỆT ĐỐI không export sang Client Components.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
