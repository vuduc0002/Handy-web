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
