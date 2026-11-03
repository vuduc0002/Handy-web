'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import {
  Lock,
  ArrowRight,
  Crown,
  Search,
  BookOpen,
  Sparkles,
  Layers,
  Heart,
  Smile,
  Users,
  Compass,
} from 'lucide-react'
import { isVipProfile, Profile } from '@/lib/types'
import { toast } from '@/lib/toast'

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

const GRADIENTS = [
  'linear-gradient(135deg,#FFB36B 0%,#F0436A 100%)',
  'linear-gradient(135deg,#5CB0FF 0%,#1A6FE0 100%)',
  'linear-gradient(135deg,#FAD961 0%,#F76B1C 100%)',
  'linear-gradient(135deg,#6FDDB0 0%,#17A673 100%)',
  'linear-gradient(135deg,#B993D6 0%,#8CA6DB 100%)',
  'linear-gradient(135deg,#FFA7A6 0%,#FF5858 100%)',
]

const ICONS = [Users, Smile, Heart, Compass, BookOpen, Sparkles]

function TopicCardSkeleton() {
  return (
    <div className="bg-white rounded-[20px] border border-[#ECEEF3] p-6 shadow-sm animate-pulse space-y-4">
      <div className="flex justify-between items-start">
        <div className="w-13 h-13 rounded-2xl bg-[#EAF4FF] shrink-0" />
        <div className="w-16 h-6 rounded-full bg-[#EAF4FF]" />
      </div>
      <div className="h-4 bg-[#F1F3F7] rounded w-1/3" />
      <div className="h-6 bg-[#EAF4FF] rounded w-3/4" />
      <div className="h-4 bg-[#F1F3F7] rounded w-full" />
      <div className="w-28 h-9 rounded-full bg-[#EAF4FF] mt-4" />
    </div>
  )
}

export default function TopicsGrid({ initialTopics }: TopicsGridProps = {}) {
  const router = useRouter()
  const [topics, setTopics] = useState<Topic[]>(initialTopics || [])
  const [profile, setProfile] = useState<Partial<Profile> | null>(null)
  const [loading, setLoading] = useState<boolean>(!initialTopics || initialTopics.length === 0)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'free' | 'vip'>('all')

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        if (!topics || topics.length === 0) {
          setLoading(true)
        }

        const [topicsRes, userRes] = await Promise.all([
          supabase
            .from('topics')
            .select('id, title, description, is_free')
            .order('created_at', { ascending: true }),
          supabase.auth.getUser(),
        ])

        if (isMounted && topicsRes.data) {
          setTopics(topicsRes.data)
        }

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
        } else if (isMounted) {
          setProfile(null)
        }
      } catch (err: unknown) {
        console.error('Error loading topics:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadData()
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const isVip = isVipProfile(profile)

  // Filter topics based on active tab and search query
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      // Tab filter
      if (activeTab === 'free' && !t.is_free) return false
      if (activeTab === 'vip' && t.is_free) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = t.title.toLowerCase().includes(q)
        const matchDesc = t.description?.toLowerCase().includes(q) || false
        if (!matchTitle && !matchDesc) return false
      }
      return true
    })
  }, [topics, activeTab, searchQuery])

  const freeCount = topics.filter((t) => t.is_free).length
  const vipCount = topics.filter((t) => !t.is_free).length

  return (
    <div className="w-full">
      {/* 01 BANNER CHỦ ĐỀ CHUẨN HANDY V2 */}
      <section className="relative overflow-hidden bg-[radial-gradient(45%_70%_at_100%_0%,#E2F0FF_0%,rgba(226,240,255,0)_70%),radial-gradient(40%_70%_at_0%_100%,#FFEAF0_0%,rgba(255,234,240,0)_70%),#F7FAFF] border-b border-[#E8EFF8]">
        {/* Decorative elements */}
        <span
          aria-hidden="true"
          className="absolute left-[6%] top-[70px] w-4 h-4 rounded-full bg-[#F9C31F] pointer-events-none opacity-80"
        />
        <span
          aria-hidden="true"
          className="absolute right-[8%] top-[60px] w-8 h-8 rounded-full border-4 border-[#F0436A] pointer-events-none opacity-75"
        />
        <span
          aria-hidden="true"
          className="absolute right-[5%] bottom-[50px] w-3.5 h-3.5 rounded-full bg-[#17A673] pointer-events-none opacity-80"
        />
        <svg
          aria-hidden="true"
          className="absolute left-[10%] bottom-[40px] w-6 h-6 pointer-events-none opacity-80"
          viewBox="0 0 40 40"
        >
          <path
            d="M20 0 C21.5 13 27 18.5 40 20 C27 21.5 21.5 27 20 40 C18.5 27 13 21.5 0 20 C13 18.5 18.5 13 20 0Z"
            fill="#7B5BB5"
          />
        </svg>

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-10 pb-16 flex flex-col items-center gap-4 text-center">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[#6B6B6B]">
            <Link href="/" className="hover:text-[#1A8CFF] transition-colors">
              Trang chủ
            </Link>
            <span className="text-[#A0A0A0]">/</span>
            <span className="text-[#1A8CFF] font-semibold">Chủ đề</span>
          </nav>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1E1E1E] tracking-tight leading-tight">
            Học ký hiệu theo <span className="text-[#1A8CFF]">chủ đề</span> gần gũi
          </h1>

          <p className="text-base md:text-lg text-[#4A4A4A] max-w-2xl leading-relaxed">
            Mỗi chủ đề là một bước nhỏ giúp bạn làm quen với ngôn ngữ ký hiệu và ứng dụng vào những tình huống giao tiếp quen thuộc.
          </p>

          {/* Search Box */}
          <div className="w-full max-w-xl mt-3">
            <div className="flex items-center gap-3 bg-white rounded-full p-2 pl-6 shadow-[0_14px_40px_rgba(20,30,60,0.08)] border border-[#E6ECF5] focus-within:border-[#1A8CFF] transition-all">
              <Search className="w-5 h-5 text-[#1A8CFF] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm chủ đề, ví dụ: gia đình, chào hỏi..."
                className="flex-1 bg-transparent text-sm md:text-base text-[#1E1E1E] placeholder-[#8A8F99] outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[#8A8F99] hover:text-[#1E1E1E] px-2"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 02 DANH SÁCH CHỦ ĐỀ CHUẨN HANDY V2 */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-16 flex flex-col gap-8">
        {/* Filter bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div role="tablist" aria-label="Nhóm chủ đề" className="flex flex-wrap gap-2.5">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'border-[#1A8CFF] bg-[#1A8CFF] text-white shadow-[0_4px_12px_rgba(26,140,255,0.25)]'
                  : 'border-[#E3E7EE] bg-white text-[#4A4A4A] hover:border-[#1A8CFF] hover:text-[#1A8CFF]'
              }`}
            >
              <span>Tất cả</span>
              <span
                className={`min-w-[20px] h-5 px-1.5 rounded-full text-xs flex items-center justify-center font-bold ${
                  activeTab === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#F1F3F7] text-[#6B6B6B]'
                }`}
              >
                {topics.length}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'free'}
              onClick={() => setActiveTab('free')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all cursor-pointer ${
                activeTab === 'free'
                  ? 'border-[#17A673] bg-[#17A673] text-white shadow-[0_4px_12px_rgba(23,166,115,0.25)]'
                  : 'border-[#E3E7EE] bg-white text-[#4A4A4A] hover:border-[#17A673] hover:text-[#17A673]'
              }`}
            >
              <span>Miễn phí</span>
              <span
                className={`min-w-[20px] h-5 px-1.5 rounded-full text-xs flex items-center justify-center font-bold ${
                  activeTab === 'free'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#E3F7EE] text-[#0C8558]'
                }`}
              >
                {freeCount}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'vip'}
              onClick={() => setActiveTab('vip')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all cursor-pointer ${
                activeTab === 'vip'
                  ? 'border-[#F7A21B] bg-[#F7A21B] text-white shadow-[0_4px_12px_rgba(247,162,27,0.25)]'
                  : 'border-[#E3E7EE] bg-white text-[#4A4A4A] hover:border-[#F7A21B] hover:text-[#B26A00]'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Gói VIP</span>
              <span
                className={`min-w-[20px] h-5 px-1.5 rounded-full text-xs flex items-center justify-center font-bold ${
                  activeTab === 'vip'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#FFF1C9] text-[#9A5B00]'
                }`}
              >
                {vipCount}
              </span>
            </button>
          </div>

          <span className="text-sm text-[#6B6B6B] font-medium">
            Hiển thị {filteredTopics.length} / {topics.length} chủ đề
          </span>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <TopicCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty Search Result */}
        {!loading && filteredTopics.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 px-6 rounded-[24px] bg-[#F7FAFF] text-center border border-[#E3ECF8]">
            <div className="w-16 h-16 rounded-2xl bg-[#EAF4FF] text-[#1A8CFF] flex items-center justify-center shadow-inner">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#1E1E1E]">Chưa có chủ đề phù hợp</h3>
            <p className="text-sm text-[#6B6B6B] max-w-md leading-relaxed">
              Thử tìm kiếm với từ khóa khác hoặc bấm xem toàn bộ các chủ đề đang có trên hệ thống.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setActiveTab('all')
              }}
              className="mt-2 px-6 py-2.5 rounded-full border border-[#1A8CFF] text-[#1A8CFF] font-semibold text-sm hover:bg-[#1A8CFF] hover:text-white transition-all cursor-pointer"
            >
              Xem tất cả chủ đề
            </button>
          </div>
        )}

        {/* Topics Cards Grid */}
        {!loading && filteredTopics.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic, idx) => {
              const canAccess = topic.is_free || isVip
              const grad = GRADIENTS[idx % GRADIENTS.length]
              const IconComp = ICONS[idx % ICONS.length]

              return (
                <article
                  key={topic.id}
                  className="flex flex-col justify-between p-6 sm:p-7 rounded-[22px] bg-white border border-[#ECEEF3] hover:border-[#1A8CFF] hover:shadow-[0_18px_40px_rgba(26,140,255,0.12)] hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex flex-col gap-3.5">
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div
                        style={{ background: grad }}
                        className="w-13 h-13 min-w-[52px] min-h-[52px] rounded-2xl text-white flex items-center justify-center shadow-[0_10px_22px_rgba(20,30,60,0.14)] group-hover:scale-105 transition-transform"
                      >
                        <IconComp className="w-6 h-6 stroke-[2.2]" />
                      </div>

                      {topic.is_free ? (
                        <span className="shrink-0 text-xs font-semibold px-3 py-1 rounded-full bg-[#E3F7EE] text-[#0C8558]">
                          Miễn phí
                        </span>
                      ) : isVip ? (
                        <span className="shrink-0 text-xs font-bold px-3 py-1 rounded-full bg-[#FFF1C9] text-[#9A5B00] flex items-center gap-1 shadow-xs">
                          <Crown className="w-3.5 h-3.5 fill-[#F7A21B] text-[#F7A21B]" /> VIP
                        </span>
                      ) : (
                        <span className="shrink-0 text-xs font-semibold px-3 py-1 rounded-full bg-[#F3F4F7] text-[#6B6B6B] flex items-center gap-1">
                          <Lock className="w-3 h-3 text-[#8A8F99]" /> Đang khóa
                        </span>
                      )}
                    </div>

                    {/* Topic Number Tag */}
                    <span className="text-xs font-semibold text-[#8A8F99] tracking-wide uppercase">
                      Chủ đề {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-bold text-[#1E1E1E] group-hover:text-[#1A8CFF] transition-colors leading-snug">
                      {topic.title}
                    </h3>

                    {/* Description */}
                    {topic.description && (
                      <p className="text-sm text-[#4A4A4A] leading-relaxed line-clamp-2">
                        {topic.description}
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="pt-6">
                    {canAccess ? (
                      <Link
                        href={`/topics/${topic.id}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EAF4FF] text-[#1A8CFF] hover:bg-[#1A8CFF] hover:text-white text-sm font-semibold transition-all duration-200 shadow-sm"
                      >
                        <span>Bắt đầu học</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.4]" />
                      </Link>
                    ) : (
                      <Link
                        href="/pricing"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFF3E0] text-[#C96A00] hover:bg-[#F7931E] hover:text-white text-sm font-semibold transition-all duration-200 shadow-sm"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Mở khóa chủ đề</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.4]" />
                      </Link>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
