'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Lock, ChevronRight, Crown, BookOpen, AlertCircle } from 'lucide-react'

interface Topic {
  id: string
  title: string
  description: string | null
  is_free: boolean
  created_at: string
}

interface Profile {
  id: string
  email: string
  role: string
  is_premium: boolean
}

// Bảng màu rực rỡ, tươi sáng dành riêng cho trẻ em
const CARD_COLORS = [
  {
    bg: 'bg-red-50 hover:bg-red-100/80',
    border: 'border-red-300',
    icon: 'bg-red-400 text-white',
    badge: 'bg-red-400',
  },
  {
    bg: 'bg-amber-50 hover:bg-amber-100/80',
    border: 'border-amber-300',
    icon: 'bg-amber-400 text-white',
    badge: 'bg-amber-400',
  },
  {
    bg: 'bg-emerald-50 hover:bg-emerald-100/80',
    border: 'border-emerald-300',
    icon: 'bg-emerald-400 text-white',
    badge: 'bg-emerald-500',
  },
  {
    bg: 'bg-cyan-50 hover:bg-cyan-100/80',
    border: 'border-cyan-300',
    icon: 'bg-cyan-400 text-white',
    badge: 'bg-cyan-500',
  },
  {
    bg: 'bg-blue-50 hover:bg-blue-100/80',
    border: 'border-blue-300',
    icon: 'bg-blue-400 text-white',
    badge: 'bg-blue-400',
  },
  {
    bg: 'bg-purple-50 hover:bg-purple-100/80',
    border: 'border-purple-300',
    icon: 'bg-purple-400 text-white',
    badge: 'bg-purple-400',
  },
]

const TOPIC_EMOJIS = ['👋', '👨‍👩‍👧', '😊', '🍎', '🐶', '⭐', '🌈', '🎈']

function TopicCardSkeleton() {
  return (
    <div className="bg-white/90 rounded-3xl border-2 border-amber-200 p-6 shadow-sm animate-pulse">
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

export default function TopicsGrid() {
  const router = useRouter()
  const [topics, setTopics] = useState<Topic[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // 1. Fetch danh sách topics và auth user song song
        const [topicsRes, userRes] = await Promise.all([
          supabase.from('topics').select('*').order('created_at', { ascending: true }),
          supabase.auth.getUser(),
        ])

        if (topicsRes.error) {
          throw new Error(topicsRes.error.message)
        }

        if (isMounted) {
          setTopics(topicsRes.data ?? [])
        }

        // 2. Nếu đã đăng nhập, lấy profile với maybeSingle (an toàn không ném lỗi nếu chưa có row)
        const currentUser = userRes.data?.user
        if (currentUser) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, email, role, is_premium')
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
        {Array.from({ length: 3 }).map((_, i) => (
          <TopicCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl border-2 border-red-200 p-8 text-center max-w-lg mx-auto shadow-md">
        <p className="text-4xl mb-3">⚠️</p>
        <h3 className="font-extrabold text-gray-800 text-lg mb-1">Không thể tải chủ đề</h3>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 text-white font-bold text-sm shadow hover:from-orange-500 hover:to-amber-500 transition active:scale-95"
        >
          Tải lại trang
        </button>
      </div>
    )
  }

  // Nếu trong database chưa có topics hoặc bị chặn bởi RLS
  if (topics.length === 0) {
    return (
      <div className="bg-white/95 rounded-3xl border-2 border-amber-300 p-8 text-center max-w-xl mx-auto shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 text-3xl">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="font-extrabold text-gray-800 text-xl mb-2">
          Chưa có chủ đề nào hiển thị!
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          Nếu bạn đã tạo bảng và chèn dữ liệu mẫu trong Supabase, nguyên nhân là do <strong>Row Level Security (RLS)</strong> mặc định đang chặn quyền đọc từ ứng dụng.
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
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-md transition active:scale-95"
        >
          🔄 Đã chạy SQL, kiểm tra lại!
        </button>
      </div>
    )
  }

  const isPremium = profile?.is_premium === true

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {topics.map((topic, idx) => {
        const canAccess = topic.is_free || isPremium
        const color = CARD_COLORS[idx % CARD_COLORS.length]
        const emoji = TOPIC_EMOJIS[idx % TOPIC_EMOJIS.length]

        if (canAccess) {
          return (
            <Link
              key={topic.id}
              href={`/topics/${topic.id}`}
              className={`group relative flex flex-col justify-between p-6 rounded-3xl border-2 ${color.bg} ${color.border} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer bg-white`}
            >
              <div>
                {/* Badge miễn phí */}
                {topic.is_free && (
                  <span
                    className={`absolute top-4 right-4 text-xs font-bold text-white px-3 py-1 rounded-full shadow-sm ${color.badge}`}
                  >
                    Miễn phí
                  </span>
                )}

                <div className="flex items-center gap-4 mb-3">
                  <div
                    className={`w-14 h-14 rounded-2xl ${color.icon} flex items-center justify-center text-2xl shadow-md shrink-0`}
                  >
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0 pr-14">
                    <h3 className="font-extrabold text-gray-800 text-lg leading-snug line-clamp-2">
                      {topic.title}
                    </h3>
                  </div>
                </div>

                {topic.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {topic.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm font-extrabold text-orange-600 group-hover:gap-3 transition-all pt-2 border-t border-amber-100">
                <BookOpen className="w-4 h-4" />
                <span>Bắt đầu học</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </div>
            </Link>
          )
        }

        // Card bị khóa dành cho chủ đề VIP
        return (
          <div
            key={topic.id}
            className="relative flex flex-col justify-between p-6 rounded-3xl border-2 border-amber-200 bg-white/70 overflow-hidden shadow-sm"
          >
            {/* Lớp phủ mờ */}
            <div className="absolute inset-0 bg-amber-50/70 backdrop-blur-[2px] rounded-3xl z-10" />

            {/* Nội dung card (mờ phía sau) */}
            <div className="opacity-40">
              <div className="flex items-center gap-4 mb-3">
                <div
                  className={`w-14 h-14 rounded-2xl ${color.icon} flex items-center justify-center text-2xl shadow-md shrink-0`}
                >
                  {emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-gray-800 text-lg leading-snug line-clamp-2">
                    {topic.title}
                  </h3>
                </div>
              </div>
              {topic.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {topic.description}
                </p>
              )}
            </div>

            {/* Hộp thoại mở khóa VIP */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-xl border-2 border-amber-300 px-6 py-5 flex flex-col items-center gap-3 w-full max-w-[240px]">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-amber-500" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">
                    Chủ đề VIP
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Mở khóa toàn bộ nội dung</p>
                </div>
                <button
                  onClick={() => router.push('/checkout')}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm px-4 py-2.5 rounded-full shadow-md transition active:scale-95 w-full justify-center"
                >
                  <Crown className="w-4 h-4" />
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
