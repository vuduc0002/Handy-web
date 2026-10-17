import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

// ============================================================================
// ✅ Security Patch: Server-side Admin Authentication
// Xác thực danh tính và quyền Admin tại server cho MỌI endpoint.
// Không thể bypass bằng cách gọi API trực tiếp từ curl / Postman.
// ============================================================================
async function verifyAdminRequest(req: NextRequest): Promise<{ error: Response | null }> {
  // Lấy JWT token từ header Authorization: Bearer <token>
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '').trim()

  if (!token) {
    return {
      error: Response.json(
        { error: 'Unauthorized: Thiếu Authorization header' },
        { status: 401 }
      ),
    }
  }

  // Verify JWT với Supabase (dùng supabaseAdmin để bypass RLS nhưng vẫn verify token)
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

  if (authError || !user) {
    return {
      error: Response.json(
        { error: 'Unauthorized: Token không hợp lệ hoặc đã hết hạn' },
        { status: 401 }
      ),
    }
  }

  // Kiểm tra role === 'ADMIN' trong bảng profiles
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'ADMIN') {
    return {
      error: Response.json(
        { error: 'Forbidden: Bạn không có quyền Admin để thực hiện thao tác này' },
        { status: 403 }
      ),
    }
  }

  return { error: null }
}

// ============================================================================
// GET: Lấy toàn bộ dữ liệu dashboard (profiles + transactions)
// ✅ Bảo vệ: Chỉ Admin mới được gọi endpoint này
// ============================================================================
export async function GET(req: NextRequest) {
  // Xác thực Admin
  const { error: authError } = await verifyAdminRequest(req)
  if (authError) return authError

  try {
    // 1. Fetch TOÀN BỘ profiles không bị giới hạn RLS
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role, is_premium, created_at')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('[Admin API] Lỗi khi lấy profiles:', profilesError)
      return Response.json({ error: profilesError.message }, { status: 500 })
    }

    // 2. Fetch TOÀN BỘ transactions không bị giới hạn RLS
    const { data: transactions, error: transactionsError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (transactionsError) {
      console.error('[Admin API] Lỗi khi lấy transactions:', transactionsError)
      return Response.json({ error: transactionsError.message }, { status: 500 })
    }

    // 3. Ghép user_email vào transaction để hiển thị
    const userMap = new Map<string, string>()
    ;(profiles || []).forEach((p) => {
      if (p.id && p.email) userMap.set(p.id, p.email)
    })

    const formattedTransactions = (transactions || []).map((tx) => ({
      ...tx,
      user_email: userMap.get(tx.user_id) || 'Khách vãng lai / Ẩn danh',
    }))

    return Response.json({
      profiles: profiles || [],
      transactions: formattedTransactions || [],
    })
  } catch (err: unknown) {
    console.error('[Admin API] Lỗi hệ thống:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PATCH: Cấp hoặc Hủy VIP thủ công cho người dùng
// ✅ Bảo vệ: Chỉ Admin mới được gọi endpoint này (bypass RLS qua supabaseAdmin)
// ============================================================================
export async function PATCH(req: NextRequest) {
  // Xác thực Admin — không có auth hợp lệ thì dừng ngay
  const { error: authError } = await verifyAdminRequest(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const { userId, is_premium } = body

    if (!userId || typeof is_premium !== 'boolean') {
      return Response.json(
        { error: 'Thiếu userId hoặc trạng thái is_premium không hợp lệ' },
        { status: 400 }
      )
    }

    // Cập nhật trực tiếp vào bảng profiles bằng Service Role Key
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ is_premium })
      .eq('id', userId)
      .select('id, email, role, is_premium, created_at')
      .single()

    if (error) {
      console.error('[Admin API] Lỗi khi cập nhật VIP thủ công:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({
      success: true,
      message: `Đã ${is_premium ? 'kích hoạt' : 'hủy'} VIP thành công cho người dùng.`,
      profile: data,
    })
  } catch (err: unknown) {
    console.error('[Admin API] Lỗi ngoại lệ khi cấp VIP thủ công:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
