import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

/**
 * GET: Lấy danh sách toàn bộ support_requests cho Admin
 */
export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('support_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching support requests:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (err) {
    console.error('API Error:', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH: Cập nhật trạng thái của support_request
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Thiếu id hoặc status' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const { data, error } = await supabaseAdmin
      .from('support_requests')
      .update({ status, updated_at: now })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating support request:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data?.[0] })
  } catch (err) {
    console.error('API Error:', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
