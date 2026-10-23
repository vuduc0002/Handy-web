'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Lock, ChevronRight, Crown, BookOpen, AlertCircle, Sparkles } from 'lucide-react'

export interface Topic {
  id: string
  title: string
  description: string | null
  is_free: boolean
  created_at?: string
}

export interface TopicsGridProps {
  initialTopics?: Topic[]
}

interface Profile {
  id: string
  email: string
  role: string
  is_premium: boolean
  vip_until?: string | null
  plan_type?: string | null
}

// Module-level in-memory cache để load tức thì trên Client (< 100ms)
let cachedTopics: Topic[] | null = null
let cachedAt = 0
const CACHE_TTL_MS = 60 * 1000 // Cache 60s

// Bảng màu rực rỡ, tươi sáng
const CARD_COLORS = [
  {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'bg-red-400 text-white',
    accent: 'text-red-600',
    hover: 'hover:border-red-400 hover:shadow-red-100',
  },
  {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'bg-amber-400 text-white',
    accent: 'text-amber-700',
    hover: 'hover:border-amber-400 hover:shadow-amber-100',
  },
  {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: 'bg-emerald-500 text-white',
    accent: 'text-emerald-700',
    hover: 'hover:border-emerald-400 hover:shadow-emerald-100',
  },
  {
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    icon: 'bg-cyan-500 text-white',
    accent: 'text-cyan-700',
    hover: 'hover:border-cyan-400 hover:shadow-cyan-100',
  },
  {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'bg-blue-500 text-white',
    accent: 'text-blue-700',
    hover: 'hover:border-blue-400 hover:shadow-blue-100',
  },
  {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'bg-purple-500 text-white',
    accent: 'text-purple-700',
    hover: 'hover:border-purple-400 hover:shadow-purple-100',
  },
]

const TOPIC_EMOJIS = ['👋', '👨‍👩‍👧', '😊', '🍎', '🐶', '⭐', '🌈', '🎈']

function TopicCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="bg-white rounded-3xl border-2 border-amber-200 p-6 shadow-sm animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="h-5 bg-amber-200/70 rounded-full w-3/4" />
          <div className="h-3.5 bg-amber-100 rounded-full w-full" />
          <div className="h-3.5 bg-amber-100 rounded-full w-2/3" />
        </div>
      </div>
    </div>
  )
}

export default function TopicsGrid({ initialTopics }: TopicsGridProps = {}) {
  const router = useRouter()
  // Sử dụng initialTopics từ Server Component ngay lập tức để render trong 0s
  const [topics, setTopics] = useState<Topic[]>(() => {
    if (initialTopics && initialTopics.length > 0) {
      cachedTopics = initialTopics
      cachedAt = Date.now()
      return initialTopics
    }
    if (cachedTopics && Date.now() - cachedAt < CACHE_TTL_MS) {
      return cachedTopics
    }
    return []
  })

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState<boolean>(() => {
    if (initialTopics && initialTopics.length > 0) return false
    if (cachedTopics && Date.now() - cachedAt < CACHE_TTL_MS) return false
    return true
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        if (!topics || topics.length === 0) {
          setLoading(true)
        }
        setError(null)

        // Tối ưu hóa: Chỉ select các trường cần thiết (không select('*'))
        const topicsPromise =
          initialTopics && initialTopics.length > 0
            ? Promise.resolve({ data: initialTopics, error: null })
            : supabase
                .from('topics')
                .select('id, title, description, is_free')
                .order('created_at', { ascending: true })

        const [topicsRes, userRes] = await Promise.all([
          topicsPromise,
          supabase.auth.getUser(),
        ])

        if (topicsRes.error) {
          throw new Error(topicsRes.error.message)
        }

        if (isMounted && topicsRes.data) {
          cachedTopics = topicsRes.data
          cachedAt = Date.now()
          setTopics(topicsRes.data)
        }

        // Tải profile người dùng ở chế độ nền không chặn hiển thị danh sách chủ đề
        const currentUser = userRes.data?.user
        if (currentUser) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, email, role, is_premium, vip_until, plan_type')
            .eq('id', currentUser.id)
            .maybeSingle()

          if (isMounted && profileData) {
            setProfile(profileData)
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadData()
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <TopicCardSkeleton key={i} delay={i * 80} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl border-2 border-red-200 p-8 text-center max-w-lg mx-auto shadow-md animate-fade-in">
        <p className="text-4xl mb-3">⚠️</p>
        <h3 className="font-extrabold text-gray-800 text-lg mb-1">Không thể tải chủ đề</h3>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 text-white font-bold text-sm shadow hover:from-orange-500 hover:to-amber-500 transition-all duration-200 active:scale-95"
        >
          Tải lại trang
        </button>
      </div>
    )
  }

  if (topics.length === 0) {
    return (
      <div className="bg-white/95 rounded-3xl border-2 border-amber-300 p-8 text-center max-w-xl mx-auto shadow-lg animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 text-3xl">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="font-extrabold text-gray-800 text-xl mb-2">
          Chưa có chủ đề nào hiển thị!
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          Nếu bạn đã tạo bảng và chèn dữ liệu mẫu trong Supabase, nguyên nhân là do{' '}
          <strong>Row Level Security (RLS)</strong> mặc định đang chặn quyền đọc từ ứng dụng.
        </p>
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 text-left text-xs text-amber-900 font-mono mb-4">
          <p className="font-bold font-sans text-amber-950 mb-1">Cách khắc phục nhanh trên Supabase SQL Editor:</p>
          <pre className="whitespace-pre-wrap">
{`-- Cho phép xem danh sách chủ đề:
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cho phép đọc topics" ON public.topics FOR SELECT USING (true);

-- Cho phép xem từ vựng:
ALTER TABLE public.vocabularies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cho phép đọc vocabularies" ON public.vocabularies FOR SELECT USING (is_deleted = false);`}
          </pre>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-md transition-all duration-200 active:scale-95"
        >
          🔄 Đã chạy SQL, kiểm tra lại!
        </button>
      </div>
    )
  }

  const isPremium = (() => {
    if (profile?.role === 'ADMIN') return true
    return Boolean(profile?.is_premium && (!profile?.vip_until || new Date(profile.vip_until) > new Date()))
  })()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
      {topics.map((topic, idx) => {
        const canAccess = topic.is_free || isPremium
        const color = CARD_COLORS[idx % CARD_COLORS.length]
        const emoji = TOPIC_EMOJIS[idx % TOPIC_EMOJIS.length]
        // Stagger animation delay
        const animDelay = Math.min(idx * 80, 480)

        if (canAccess) {
          return (
            <Link
              key={topic.id}
              href={`/topics/${topic.id}`}
              style={{ animationDelay: `${animDelay}ms` }}
              className={`
                group relative flex flex-col justify-between p-5 sm:p-6
                rounded-3xl border-2 bg-white
                ${color.border} ${color.hover}
                shadow-sm hover:shadow-xl hover:-translate-y-1.5
                transition-all duration-300 ease-in-out
                animate-slide-up
                cursor-pointer
              `}
            >
              <div>
                {/* Khu vực Card Header: Icon + Tiêu đề + Nhãn */}
                <div className="flex justify-between items-start gap-3 mb-3">
                  {/* Khối chứa Icon + Text */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Icon emoji */}
                    <div
                      className={`w-13 h-13 min-w-[52px] min-h-[52px] rounded-2xl ${color.icon} flex items-center justify-center text-2xl shadow-md shrink-0 group-hover:scale-110 transition-transform duration-300`}
                    >
                      {emoji}
                    </div>

                    {/* Tiêu đề — tự do rớt dòng tự nhiên, không bị cắt ngắn */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug break-words whitespace-normal">
                        {topic.title}
                      </h3>
                    </div>
                  </div>

                  {/* Nhãn Miễn phí / VIP neo cố định góc trên bên phải, không co bóp */}
                  {topic.is_free ? (
                    <span className="shrink-0 text-[11px] font-bold text-white px-2.5 py-1 rounded-full shadow-sm bg-gradient-to-r from-rose-500 to-pink-500">
                      Miễn phí
                    </span>
                  ) : (
                    <span className="shrink-0 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-600" /> VIP
                    </span>
                  )}
                </div>

                {/* Mô tả — tối đa 2 dòng */}
                {topic.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                    {topic.description}
                  </p>
                )}
              </div>

              {/* Footer CTA */}
              <div className={`flex items-center gap-2 text-sm font-bold ${color.accent} pt-3 border-t border-gray-100 group-hover:gap-3 transition-all duration-200`}>
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>Bắt đầu học</span>
                <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </Link>
          )
        }

        // Locked VIP card
        return (
          <div
            key={topic.id}
            style={{ animationDelay: `${animDelay}ms` }}
            className="relative flex flex-col justify-between p-5 sm:p-6 rounded-3xl border-2 border-amber-200 bg-white/80 overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-in-out animate-slide-up"
          >
            {/* Overlay mờ */}
            <div className="absolute inset-0 bg-amber-50/60 backdrop-blur-[1.5px] rounded-3xl z-10" />

            {/* Nội dung mờ phía sau */}
            <div className="opacity-35 pointer-events-none">
              <div className="flex justify-between items-start gap-3 mb-3">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className={`w-13 h-13 min-w-[52px] min-h-[52px] rounded-2xl ${color.icon} flex items-center justify-center text-2xl shadow-md shrink-0`}>
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug break-words whitespace-normal">
                      {topic.title}
                    </h3>
                  </div>
                </div>
                <span className="shrink-0 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-600" /> VIP
                </span>
              </div>
              {topic.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{topic.description}</p>
              )}
            </div>

            {/* Hộp thoại mở khóa VIP */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl border-2 border-amber-300 px-5 py-4 flex flex-col items-center gap-3 w-full max-w-[220px]">
                <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-500 border border-amber-300 flex items-center justify-center shadow-inner">
                  <Lock className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide flex items-center justify-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    Chủ đề VIP
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Mở khóa toàn bộ nội dung</p>
                </div>
                <button
                  onClick={() => router.push('/checkout')}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-full shadow-md shadow-amber-200 transition-all duration-200 active:scale-95 w-full justify-center cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Nâng cấp VIP
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
