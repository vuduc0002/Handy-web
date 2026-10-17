export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Mức tiền thanh toán gói VIP HANDY (199.000 VNĐ)
const REQUIRED_VIP_AMOUNT = 6000;

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

    // Tìm mã nhận diện: hỗ trợ chuỗi 32 ký tự hex (ngân hàng bỏ dấu gạch ngang) hoặc UUID chuẩn
    // 1. Thử bắt chuỗi 32 ký tự hex liền nhau (không có dấu gạch ngang)
    let formattedUuid: string | null = null;
    const match32 = transferContent.match(/HANDY[\s_]*([a-fA-F0-9]{32})/i);

    if (match32) {
      const rawId = match32[1];
      // Phục hồi định dạng UUID chuẩn: 8-4-4-4-12
      formattedUuid = `${rawId.slice(0, 8)}-${rawId.slice(8, 12)}-${rawId.slice(12, 16)}-${rawId.slice(16, 20)}-${rawId.slice(20)}`.toLowerCase();
    } else {
      // 2. Dự phòng trường hợp ngân hàng giữ nguyên dấu gạch ngang UUID
      const matchUuid = transferContent.match(/HANDY[\s_]*([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})/i);
      if (matchUuid) {
        formattedUuid = matchUuid[1].toLowerCase();
      }
    }

    if (!formattedUuid) {
      console.warn('[SePAY Webhook] Không tìm thấy mã nhận diện UUID 32 ký tự hợp lệ trong nội dung:', transferContent);
      return Response.json(
        { error: 'Không tìm thấy mã nhận diện HANDY hợp lệ trong nội dung chuyển khoản' },
        { status: 400 }
      );
    }

    // Kiểm tra số tiền chuyển khoản có đủ nâng cấp VIP hay không
    if (isNaN(amount) || amount < REQUIRED_VIP_AMOUNT) {
      console.warn(`[SePAY Webhook] Số tiền ${amount} chưa đủ mức ${REQUIRED_VIP_AMOUNT}`);
      return Response.json(
        { error: `Số tiền ${amount} chưa đủ mức tối thiểu ${REQUIRED_VIP_AMOUNT}` },
        { status: 400 }
      );
    }

    // Cập nhật User bằng .eq() với UUID chuẩn đã phục hồi
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_premium: true })
      .eq('id', formattedUuid)
      .select();

    if (error) {
      console.error('[SePAY Webhook] Lỗi database khi cập nhật profile:', {
        formattedUuid,
        error,
      });
      return Response.json(
        { error: `Lỗi cơ sở dữ liệu: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      console.error('[SePAY Webhook] Không tìm thấy user với UUID:', formattedUuid);
      return Response.json(
        { error: `Không tìm thấy tài khoản người dùng tương ứng với ID ${formattedUuid}` },
        { status: 404 }
      );
    }

    const updatedUser = data[0];
    const userId = updatedUser.id;

    // Ghi chép lịch sử thanh toán vào bảng transactions
    try {
      await supabase.from('transactions').insert({
        user_id: userId,
        amount: amount,
        status: 'SUCCESS',
        payment_method: 'VIETQR',
      });
    } catch (txError) {
      console.warn('[SePAY Webhook] Cảnh báo ghi nhận transactions:', txError);
    }

    console.log(`[SePAY Webhook] Đã nâng cấp VIP thành công cho User: ${userId}`);

    // CHỈ trả về status 200 SAU KHI lệnh update is_premium: true vào database Supabase thành công
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
    console.error('[SePAY Webhook] Lỗi ngoại lệ hệ thống:', error);
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
