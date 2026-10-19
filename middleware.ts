import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return NextResponse.next()
}

/**
 * Cấu hình matcher siêu tinh gọn để tối ưu hóa RTT (< 1ms):
 * TUYỆT ĐỐI BỎ QUA:
 * - Trang chủ ('/')
 * - Trang đăng nhập / khôi phục mật khẩu ('/login', '/forgot-password', '/reset-password')
 * - Toàn bộ static assets (_next/static, _next/image, favicon.ico, file media...)
 * - Public API (/api/sepay...)
 * CHỈ áp dụng trên các route bảo vệ: /admin và /quiz
 */
export const config = {
  matcher: [
    '/admin/:path*',
    '/quiz/:path*',
  ],
}
