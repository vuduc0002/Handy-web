export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    // 2. Khởi tạo Supabase bằng Service Role Key để bypass hoàn toàn RLS
    // =========================================================================
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      console.error('[SePAY Webhook] Thiếu biến môi trường SUPABASE_SERVICE_ROLE_KEY!');
    }

    const supabase = createClient(
      supabaseUrl!,
      serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );

    // =========================================================================
    // 3. Xử lý Dữ liệu Giao dịch
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

    // Tìm mã nhận diện linh hoạt với regex: hỗ trợ cả có hoặc không có dấu gạch dưới / khoảng trắng
    const match = transferContent.match(/HANDY[\s_]*([a-zA-Z0-9]+)/i);
    if (!match) {
      console.log('[SePAY Webhook] Không tìm thấy mã nhận diện HANDY trong nội dung:', transferContent);
      return Response.json(
        { message: 'Bỏ qua: Không tìm thấy mã nhận diện HANDY' },
        { status: 200 }
      );
    }

    // Lấy 8 ký tự đầu tiên của chuỗi trích xuất được (VD: '5f7299dd')
    const rawExtracted = match[1];
    const shortId = rawExtracted.substring(0, 8);

    // Kiểm tra số tiền chuyển khoản có đủ nâng cấp VIP hay không
    if (isNaN(amount) || amount < REQUIRED_VIP_AMOUNT) {
      console.warn(`[SePAY Webhook] Số tiền ${amount} chưa đủ mức ${REQUIRED_VIP_AMOUNT}`);
      return Response.json(
        { error: `Số tiền ${amount} chưa đủ ${REQUIRED_VIP_AMOUNT}` },
        { status: 400 }
      );
    }

    // Cập nhật User bằng .ilike() trực tiếp qua Service Role
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_premium: true })
      .ilike('id', shortId + '%')
      .select();

    if (error || !data || data.length === 0) {
      console.error('[SePAY Webhook] Không thể cập nhật profile hoặc không tìm thấy user:', {
        shortId,
        error,
        data,
      });
      return Response.json(
        { error: `Không tìm thấy user hoặc lỗi cập nhật với mã ${shortId}` },
        { status: 404 }
      );
    }

    const updatedUser = data[0];
    const userId = updatedUser.id;

    // Ghi chép lịch sử thanh toán vào bảng transactions (nếu có)
    try {
      await supabase.from('transactions').insert({
        user_id: userId,
        amount: amount,
        status: 'SUCCESS',
        payment_method: 'VIETQR',
      });
    } catch (txError) {
      console.warn('[SePAY Webhook] Không thể ghi lịch sử giao dịch vào transactions:', txError);
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
