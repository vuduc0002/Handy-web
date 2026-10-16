export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase as defaultSupabase } from '@/lib/supabaseClient';

// Sử dụng Service Role Key nếu có để bypass RLS ở phía server webhook, nếu không dùng default client
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    )
  : defaultSupabase;

// Mức tiền thanh toán gói VIP HANDY (199.000 VNĐ)
const REQUIRED_VIP_AMOUNT = 199000;

export async function POST(req: NextRequest) {
  try {
    // =========================================================================
    // 1. Xác thực Request từ SePAY
    // =========================================================================
    const rawAuth =
      req.headers.get('authorization') ||
      req.headers.get('x-sepay-api-key') ||
      '';

    // SePAY có thể gửi kèm tiền tố "Apikey " hoặc "Bearer " hoặc chỉ gửi raw token
    const token = rawAuth.replace(/^(Apikey|Bearer)\s+/i, '').trim();
    const expectedKey = process.env.SEPAY_API_KEY?.trim();

    if (!expectedKey || token !== expectedKey) {
      console.warn('[SePAY Webhook] Unauthorized attempt:', { received: token });
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // =========================================================================
    // 2. Xử lý Dữ liệu Giao dịch
    // =========================================================================
    const body = await req.json();
    const { content, transferAmount, referenceCode } = body;

    const transferContent: string = content || body.description || '';
    const amount = Number(transferAmount);

    console.log('[SePAY Webhook] Nhận giao dịch:', {
      referenceCode,
      amount,
      content: transferContent,
    });

    // Tìm mã nhận diện dạng HANDY_[USER_ID] (USER_ID dạng UUID hoặc string ID)
    const match = transferContent.match(/HANDY_([0-9a-fA-F-]+)/i);
    if (!match) {
      console.log('[SePAY Webhook] Không tìm thấy mã HANDY_[USER_ID] trong nội dung:', transferContent);
      return Response.json(
        { message: 'Bỏ qua: Không tìm thấy mã HANDY_[USER_ID]' },
        { status: 200 }
      );
    }

    const userId = match[1];

    // Kiểm tra số tiền chuyển khoản có đủ nâng cấp VIP hay không
    if (isNaN(amount) || amount < REQUIRED_VIP_AMOUNT) {
      console.warn(`[SePAY Webhook] Số tiền ${amount} chưa đủ mức ${REQUIRED_VIP_AMOUNT}`);
      return Response.json(
        { error: `Số tiền ${amount} chưa đủ ${REQUIRED_VIP_AMOUNT}` },
        { status: 400 }
      );
    }

    // Cập nhật trạng thái is_premium = true cho user trong bảng profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ is_premium: true })
      .eq('id', userId);

    if (profileError) {
      console.error('[SePAY Webhook] Lỗi khi cập nhật profile:', profileError);
      return Response.json(
        { error: 'Không thể cập nhật trạng thái VIP cho người dùng' },
        { status: 500 }
      );
    }

    // Thêm 1 dòng ghi chép lịch sử thanh toán vào bảng transactions
    try {
      await supabaseAdmin.from('transactions').insert({
        user_id: userId,
        amount: amount,
        status: 'SUCCESS',
        payment_method: 'VIETQR',
      });
    } catch (txError) {
      console.warn('[SePAY Webhook] Không thể ghi lịch sử giao dịch vào transactions:', txError);
      // Không throw lỗi ở đây để đảm bảo SePAY nhận status 200 không gửi lại nhiều lần
    }

    console.log(`[SePAY Webhook] Đã nâng cấp VIP thành công cho User: ${userId}`);

    // Trả về kết quả thành công cho SePAY
    return Response.json(
      {
        success: true,
        message: 'Nâng cấp tài khoản VIP thành công',
        user_id: userId,
        referenceCode,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('[SePAY Webhook] Lỗi hệ thống:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Endpoint GET để kiểm tra trạng thái hoạt động của Webhook
export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'SePAY Webhook Handler for HANDY',
    timestamp: new Date().toISOString(),
  });
}
