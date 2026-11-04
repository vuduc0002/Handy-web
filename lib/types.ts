export interface Profile {
  id: string
  email: string | null
  role: string | null
  is_premium: boolean
  vip_until: string | null
  plan_type: string | null
  created_at?: string
}

export type PlanType = '3m' | '6m' | '1y' | 'lifetime'

/**
 * Kiểm tra trạng thái VIP còn hiệu lực:
 * - is_premium === true
 * - vip_until === null (gói trọn đời / lifetime) HOẶC vip_until > thời điểm hiện tại
 */
export function isVipProfile(profile: Partial<Profile> | null | undefined): boolean {
  if (!profile?.is_premium) return false
  if (profile.role === 'ADMIN') return true
  if (!profile.vip_until) return true
  return new Date(profile.vip_until) > new Date()
}

export type SupportStatus = 'pending' | 'in_progress' | 'resolved'

export interface SupportRequest {
  id: string
  full_name: string
  contact_info: string
  category: string
  content: string
  status: SupportStatus
  created_at: string
  updated_at?: string | null
}
