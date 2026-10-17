import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch TOÀN BỘ profiles không bị giới hạn RLS (không phân biệt admin hay user)
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

// PATCH: Cấp hoặc Hủy VIP thủ công cho người dùng (Bypass RLS qua supabaseAdmin)
export async function PATCH(req: NextRequest) {
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
