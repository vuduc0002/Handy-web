import { supabase } from '@/lib/supabaseClient'

/**
 * Tối ưu hóa Đăng xuất siêu tốc (< 50ms):
 * 1. Dọn sạch ngay lập tức mọi key liên quan đến Supabase token trong localStorage & sessionStorage (0ms).
 * 2. Thực hiện local signOut đồng bộ không chờ server roundtrip.
 * 3. Bắn yêu cầu revoke global lên Supabase ngầm (không chặn blocking UI).
 * 4. Chuyển hướng cứng (hard redirect) về trang đăng nhập để reset toàn bộ in-memory state.
 */
export async function logoutUser(redirectTo: string = '/login') {
  // 1. Dọn dẹp storage ngay lập tức
  if (typeof window !== 'undefined') {
    try {
      const localKeys: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth-token'))) {
          localKeys.push(key)
        }
      }
      localKeys.forEach((k) => localStorage.removeItem(k))

      const sessionKeys: string[] = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth-token'))) {
          sessionKeys.push(key)
        }
      }
      sessionKeys.forEach((k) => sessionStorage.removeItem(k))
    } catch (e) {
      console.warn('Lỗi khi dọn dẹp storage:', e)
    }
  }

  // 2. Local signOut tức thì không phụ thuộc network
  try {
    supabase.auth.signOut({ scope: 'local' }).catch(() => {})
  } catch {
    // silent
  }

  // 3. Global signOut chạy nền (fire-and-forget, không await làm trễ UI)
  supabase.auth.signOut({ scope: 'global' }).catch(() => {})

  // 4. Chuyển hướng ngay lập tức (dưới 50ms)
  if (typeof window !== 'undefined') {
    window.location.href = redirectTo
  }
}
