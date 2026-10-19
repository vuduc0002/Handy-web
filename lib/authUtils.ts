import { supabase } from '@/lib/supabaseClient'

/**
 * Triệt để đăng xuất người dùng:
 * 1. Gọi Supabase Auth signOut (global và fallback local).
 * 2. Xóa sạch mọi key liên quan đến Supabase token trong localStorage & sessionStorage.
 * 3. Chuyển hướng cứng (hard redirect) về trang /login để xóa sạch mọi cache,
 *    in-memory auth session và React state trên toàn hệ thống.
 */
export async function logoutUser(redirectTo: string = '/login') {
  try {
    await supabase.auth.signOut()
  } catch (err) {
    console.warn('Lỗi khi gọi supabase.auth.signOut global:', err)
  }

  try {
    await supabase.auth.signOut({ scope: 'local' })
  } catch {
    // silent
  }

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

    // Dùng hard navigation để Next.js reset toàn bộ router cache và client state
    window.location.href = redirectTo
  }
}
