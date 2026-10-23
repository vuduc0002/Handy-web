export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Mức tiền tối thiểu hợp lệ (gói thấp nhất 3 tháng = 199.000đ; test thì dùng 6.000đ)
const MIN_VIP_AMOUNT = Number(process.env.VIP_AMOUNT || process.env.NEXT_PUBLIC_VIP_AMOUNT) || 6000;

// ============================================================================
// Ánh xạ số tiền → plan_type (fallback khi không parse được từ content)
// ============================================================================
const AMOUNT_TO_PLAN: Record<number, string> = {
  199000: '3m',
  349000: '6m',
  599000: '1y',
  999000: 'lifetime',
};

/**
 * Tính toán ngày hết hạn VIP dựa vào plan_type.
 * 'lifetime' → null (vĩnh viễn)
 */
function computeVipUntil(planType: string): string | null {
  const now = new Date();
  switch (planType) {
    case '3m': {
      now.setMonth(now.getMonth() + 3);
      return now.toISOString();
    }
    case '6m': {
      now.setMonth(now.getMonth() + 6);
      return now.toISOString();
    }
    case '1y': {
      now.setFullYear(now.getFullYear() + 1);
      return now.toISOString();
    }
    case 'lifetime':
    default:
      return null;
  }
}

/**
 * Trích xuất plan_type từ nội dung chuyển khoản.
 * Hỗ trợ các cú pháp:
 * - "HD3M", "HD6M", "HD1Y", "HDLIFETIME" (hoặc HD_3M, HD-3M, HD 3M)
 * - "HANDYVIP 3m", "HANDYVIP 6m", "HANDYVIP 1y", "HANDYVIP lifetime"
 * - Từ khóa độc lập: "3M", "6M", "1Y", "LIFETIME"
 */
function parsePlanFromContent(content: string): string | null {
  const normalized = content.toUpperCase();

  // 1. Tiền tố HD: HD3M, HD6M, HD1Y, HDLIFETIME
  const hdMatch = normalized.match(/HD(?:_|-|\s)?(3M|6M|1Y|LIFETIME)/i);
  if (hdMatch) return hdMatch[1].toLowerCase();

  // 2. Tiền tố HANDY / HANDYVIP
  const handyMatch = normalized.match(/HANDY(?:VIP)?(?:_|-|\s)*(3M|6M|1Y|LIFETIME)/i);
  if (handyMatch) return handyMatch[1].toLowerCase();

  // 3. Từ khóa độc lập
  if (/\b3M\b/.test(normalized)) return '3m';
  if (/\b6M\b/.test(normalized)) return '6m';
  if (/\b1Y\b/.test(normalized)) return '1y';
  if (/LIFETIME/.test(normalized)) return 'lifetime';

  return null;
}

/**
 * Fallback: suy ra plan_type từ số tiền chuyển khoản.
 */
function parsePlanFromAmount(amount: number): string | null {
  return AMOUNT_TO_PLAN[amount] ?? null;
}

// ============================================================================
// ✅ Security: In-memory Rate Limiting cho các request không hợp lệ / brute-force
// ============================================================================
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 phút

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfterSec };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

function cleanupRateLimitMap() {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}

export async function POST(req: NextRequest) {
  try {
    // =========================================================================
    // 1. Xác thực Request từ SePAY & Chống Brute-Force Rate Limiting
    // =========================================================================
    const rawAuth =
      req.headers.get('authorization') ||
      req.headers.get('x-sepay-api-key') ||
      '';

    const token = rawAuth.replace(/^(Apikey|Bearer)\s+/i, '').trim();
    const expectedKey = process.env.SEPAY_API_KEY?.trim();

    // Nếu không khớp API Key, áp dụng Rate Limiting chặt chẽ cho IP lạ
    if (!expectedKey || token !== expectedKey) {
      cleanupRateLimitMap();
      const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        'unknown';

      const { allowed, retryAfterSec } = checkRateLimit(ip);
      if (!allowed) {
        console.warn(`[SePAY Webhook] Rate limit exceeded for unauthorized IP: ${ip}`);
        return Response.json(
          { error: `Too Many Requests. Thử lại sau ${retryAfterSec} giây.` },
          {
            status: 429,
            headers: { 'Retry-After': String(retryAfterSec) },
          }
        );
      }

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

    console.log('[SePAY Webhook] Nhận giao dịch hợp lệ:', {
      referenceCode,
      amount,
      content: transferContent,
    });

    // =========================================================================
    // 4. Trích xuất mã nhận diện UUID linh hoạt (Xử lý mọi định dạng ngân hàng)
    // =========================================================================
    let formattedUuid: string | null = null;

    // Cách 1: Quét toàn chuỗi tìm UUID chuẩn có dấu gạch ngang (8-4-4-4-12)
    const matchUuid = transferContent.match(/([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})/i);
    if (matchUuid) {
      formattedUuid = matchUuid[1].toLowerCase();
    }

    // Cách 2: Tìm 32 ký tự hex liền kề (ngân hàng bỏ dấu gạch ngang)
    if (!formattedUuid) {
      const matchRaw32 = transferContent.match(/\b([a-fA-F0-9]{32})\b/i);
      if (matchRaw32) {
        const raw = matchRaw32[1].toLowerCase();
        formattedUuid = `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
      }
    }

    // Cách 3: Sau tiền tố HD... hoặc HANDY..., gom 32 ký tự hex (bỏ qua khoảng cách, gạch)
    if (!formattedUuid) {
      const prefixIndex = transferContent.search(/(?:HD(?:3M|6M|1Y|LIFETIME)?|HANDY(?:VIP)?)/i);
      if (prefixIndex !== -1) {
        const afterPrefix = transferContent.slice(prefixIndex);
        const hexCandidate = afterPrefix.replace(/[^a-fA-F0-9]/g, '');
        if (hexCandidate.length >= 32) {
          const raw32 = hexCandidate.slice(-32).toLowerCase();
          formattedUuid = `${raw32.slice(0, 8)}-${raw32.slice(8, 12)}-${raw32.slice(12, 16)}-${raw32.slice(16, 20)}-${raw32.slice(20)}`;
        }
      }
    }

    if (!formattedUuid) {
      console.warn('[SePAY Webhook] Không tìm thấy mã nhận diện hợp lệ trong nội dung:', transferContent);
      return Response.json(
        { error: 'Không tìm thấy mã nhận diện người dùng hợp lệ trong nội dung chuyển khoản' },
        { status: 400 }
      );
    }

    // Kiểm tra số tiền chuyển khoản (tối thiểu bằng gói thấp nhất hoặc giá trị test)
    if (isNaN(amount) || amount < MIN_VIP_AMOUNT) {
      console.warn(`[SePAY Webhook] Số tiền ${amount} chưa đủ mức ${MIN_VIP_AMOUNT}`);
      return Response.json(
        { error: `Số tiền ${amount} chưa đủ mức tối thiểu ${MIN_VIP_AMOUNT}` },
        { status: 400 }
      );
    }

    // =========================================================================
    // 4b. Xác định plan_type từ nội dung hoặc số tiền
    // =========================================================================
    const planType = parsePlanFromContent(transferContent) ?? parsePlanFromAmount(amount) ?? 'lifetime';
    const vipUntil = computeVipUntil(planType);

    console.log('[SePAY Webhook] Plan xác định:', { planType, vipUntil });

    // =========================================================================
    // 5. Cập nhật User bằng .eq() với UUID chuẩn đã phục hồi
    // =========================================================================
    let userId = formattedUuid;
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_premium: true, vip_until: vipUntil, plan_type: planType })
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

    // Cơ chế an toàn (Failsafe): Nếu chưa có row trong profiles (trigger lỗi lúc đăng ký),
    // tra cứu qua auth.users và tự động tạo profile VIP dự phòng cho user
    if (!data || data.length === 0) {
      console.warn('[SePAY Webhook] Profile chưa có trong bảng profiles, kiểm tra auth.users...', formattedUuid);
      try {
        const { data: authUserData } = await supabase.auth.admin.getUserById(formattedUuid);
        if (authUserData?.user) {
          const { data: insertedProfile, error: insertError } = await supabase
            .from('profiles')
            .upsert({
              id: authUserData.user.id,
              email: authUserData.user.email || '',
              role: 'USER',
              is_premium: true,
              vip_until: vipUntil,
              plan_type: planType,
            })
            .select();

          if (insertError || !insertedProfile || insertedProfile.length === 0) {
            console.error('[SePAY Webhook] Không thể tạo profile dự phòng:', insertError);
            return Response.json(
              { error: 'Không thể tạo profile dự phòng cho người dùng' },
              { status: 500 }
            );
          }
          userId = insertedProfile[0].id;
        } else {
          console.error('[SePAY Webhook] Không tìm thấy user với UUID:', formattedUuid);
          return Response.json(
            { error: `Không tìm thấy tài khoản người dùng tương ứng với ID ${formattedUuid}` },
            { status: 404 }
          );
        }
      } catch (authErr) {
        console.error('[SePAY Webhook] Lỗi tra cứu auth.users:', authErr);
        return Response.json(
          { error: `Không tìm thấy tài khoản người dùng tương ứng với ID ${formattedUuid}` },
          { status: 404 }
        );
      }
    } else {
      userId = data[0].id;
    }

    // =========================================================================
    // 6. Ghi chép lịch sử thanh toán vào bảng transactions
    // =========================================================================
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

    // CHỈ trả về status 200 SAU KHI nâng cấp VIP thành công
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
