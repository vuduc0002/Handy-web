'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Lock,
  Hand,
  Users,
  Smile,
  Sun,
  Package,
  BookOpen
} from 'lucide-react'

export interface RoadmapTopic {
  id?: string | number
  title: string
  description?: string
  is_free?: boolean
  group?: 'giao-tiep' | 'con-nguoi' | 'doi-song' | string
  grad?: string
  icon?: React.ReactNode
}

interface RoadmapSectionProps {
  initialTopics?: RoadmapTopic[]
}

const DEFAULT_TOPICS: RoadmapTopic[] = [
  {
    id: '01',
    title: 'Chào hỏi & Giao tiếp cơ bản',
    description: 'Làm quen với những ký hiệu đầu tiên để chào hỏi, giới thiệu và bắt đầu cuộc trò chuyện.',
    is_free: true,
    group: 'giao-tiep',
    grad: 'from-[#FFB36B] to-[#F0436A]',
    icon: <Hand className="w-6 h-6 stroke-[2]" />,
  },
  {
    id: '02',
    title: 'Gia đình & Người thân',
    description: 'Học các ký hiệu gọi tên thành viên trong gia đình và những người thân quen.',
    is_free: false,
    group: 'con-nguoi',
    grad: 'from-[#5CB0FF] to-[#1A6FE0]',
    icon: <Users className="w-6 h-6 stroke-[2]" />,
  },
  {
    id: '03',
    title: 'Cảm xúc & Trạng thái',
    description: 'Diễn tả niềm vui, nỗi buồn và những trạng thái quen thuộc bằng ký hiệu.',
    is_free: false,
    group: 'con-nguoi',
    grad: 'from-[#B48CF0] to-[#7B4FD0]',
    icon: <Smile className="w-6 h-6 stroke-[2]" />,
  },
  {
    id: '04',
    title: 'Hoạt động hằng ngày',
    description: 'Ký hiệu cho những việc làm quen thuộc trong ngày, từ thức dậy đến đi ngủ.',
    is_free: false,
    group: 'doi-song',
    grad: 'from-[#FFE066] to-[#F7A21B]',
    icon: <Sun className="w-6 h-6 stroke-[2]" />,
  },
  {
    id: '05',
    title: 'Đồ vật quen thuộc',
    description: 'Gọi tên những đồ vật gần gũi trong nhà, ở trường và xung quanh bé.',
    is_free: false,
    group: 'doi-song',
    grad: 'from-[#6FDDB0] to-[#17A673]',
    icon: <Package className="w-6 h-6 stroke-[2]" />,
  },
]

export default function RoadmapSection({ initialTopics }: RoadmapSectionProps) {
  const [activeTab, setActiveTab] = useState('all')
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [activeDot, setActiveDot] = useState(0)

  // Use provided topics or fallback to high-fidelity defaults
  const topicsList = initialTopics && initialTopics.length > 0
    ? initialTopics.map((t, idx) => ({
        ...t,
        group: t.group || (idx % 3 === 0 ? 'giao-tiep' : idx % 3 === 1 ? 'con-nguoi' : 'doi-song'),
        grad: t.grad || (DEFAULT_TOPICS[idx % DEFAULT_TOPICS.length].grad),
        icon: t.icon || (DEFAULT_TOPICS[idx % DEFAULT_TOPICS.length].icon),
      }))
    : DEFAULT_TOPICS

  const tabGroups = [
    { key: 'all', label: 'Tất cả' },
    { key: 'giao-tiep', label: 'Giao tiếp' },
    { key: 'con-nguoi', label: 'Con người & cảm xúc' },
    { key: 'doi-song', label: 'Đời sống hằng ngày' },
  ]

  const filteredTopics = topicsList.filter(
    (t) => activeTab === 'all' || t.group === activeTab
  )

  const checkScroll = () => {
    const el = scrollContainerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
    const cardWidth = 300
    const dotIndex = Math.min(
      Math.round(el.scrollLeft / cardWidth),
      Math.max(0, filteredTopics.length - 1)
    )
    setActiveDot(dotIndex)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollContainerRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true })
      return () => el.removeEventListener('scroll', checkScroll)
    }
  }, [filteredTopics])

  const scrollBy = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  return (
    <div
      className="relative overflow-hidden font-sans py-24"
      style={{
        background: 'linear-gradient(180deg,#EEF6FF 0%,#F6FAFF 55%,#FFF5F7 100%)',
      }}
    >
      {/* Background radial glows & decorative icons */}
      <span
        aria-hidden="true"
        className="absolute -left-44 top-[30%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(closest-side,rgba(240,67,106,0.1) 0%,rgba(240,67,106,0) 100%)',
        }}
      />
      <span
        aria-hidden="true"
        className="absolute -right-60 -top-20 w-[560px] h-[560px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(closest-side,rgba(26,140,255,0.1) 0%,rgba(26,140,255,0) 100%)',
        }}
      />

      <section id="lo-trinh" className="relative z-10 max-w-[1240px] mx-auto px-6 flex flex-col gap-12">
        {/* Section Heading */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-bold text-3xl sm:text-4xl lg:text-[40px] text-[#1E1E1E] tracking-tight">
            Bắt đầu từ những điều <span className="text-[#1A8CFF]">gần gũi</span>
          </h2>
          <p className="text-base text-[#4A4A4A] max-w-[640px] leading-relaxed">
            Mỗi chủ đề là một bước nhỏ giúp bạn làm quen với ngôn ngữ ký hiệu và ứng dụng vào những tình huống giao tiếp quen thuộc.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-2.5">
          {tabGroups.map((tab) => {
            const count =
              tab.key === 'all'
                ? topicsList.length
                : topicsList.filter((t) => t.group === tab.key).length
            const isActive = activeTab === tab.key

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key)
                  if (scrollContainerRef.current) scrollContainerRef.current.scrollLeft = 0
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#1A8CFF] bg-[#1A8CFF] text-white shadow-[0_10px_22px_rgba(26,140,255,0.28)]'
                    : 'border-[#E3E7EE] bg-white text-[#1E1E1E] hover:border-[#1A8CFF]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`min-w-[22px] h-[22px] px-1.5 rounded-full text-xs flex items-center justify-center font-bold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-[#F1F3F7] text-[#4A4A4A]'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Slider with Arrows */}
        <div className="relative">
          {/* Scroll Left Button */}
          <button
            type="button"
            aria-label="Chủ đề trước"
            onClick={() => scrollBy(-320)}
            disabled={!canScrollLeft}
            className={`hidden md:flex absolute top-1/2 -left-5 z-20 -translate-y-1/2 w-11 h-11 rounded-full bg-white border border-[#ECEEF3] text-[#1E1E1E] items-center justify-center shadow-[0_10px_24px_rgba(20,30,60,0.12)] hover:bg-[#1A8CFF] hover:text-white transition-all cursor-pointer ${
              !canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.4]" />
          </button>

          {/* Scroll Right Button */}
          <button
            type="button"
            aria-label="Chủ đề tiếp theo"
            onClick={() => scrollBy(320)}
            disabled={!canScrollRight}
            className={`hidden md:flex absolute top-1/2 -right-5 z-20 -translate-y-1/2 w-11 h-11 rounded-full bg-white border border-[#ECEEF3] text-[#1E1E1E] items-center justify-center shadow-[0_10px_24px_rgba(20,30,60,0.12)] hover:bg-[#1A8CFF] hover:text-white transition-all cursor-pointer ${
              !canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <ChevronRight className="w-5 h-5 stroke-[2.4]" />
          </button>

          {/* Cards Carousel Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory py-4 px-1 no-scrollbar"
            style={{ scrollBehavior: 'smooth' }}
          >
            {filteredTopics.map((topic, i) => (
              <article
                key={topic.id || i}
                className="min-w-[280px] max-w-[320px] sm:min-w-[300px] flex-1 shrink-0 snap-start flex flex-col justify-between p-6 bg-white border border-[#ECEEF3] rounded-3xl shadow-sm hover:shadow-[0_16px_32px_rgba(26,140,255,0.16)] hover:-translate-y-1.5 transition-all duration-300"
              >
                <div>
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div
                      className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${topic.grad} text-white flex items-center justify-center shadow-[0_10px_22px_rgba(20,30,60,0.14)]`}
                    >
                      {topic.icon || <BookOpen className="w-6 h-6 stroke-[2]" />}
                    </div>

                    {topic.is_free ? (
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#E3F7EE] text-[#0C8558]">
                        Miễn phí
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#F3F4F7] text-[#6B6B6B]">
                        <Lock className="w-3 h-3 stroke-[2.4]" />
                        <span>Đang khóa</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-lg text-[#1E1E1E] leading-snug mb-2">
                    {topic.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[#4A4A4A] leading-relaxed line-clamp-3">
                    {topic.description || 'Khám phá các ký hiệu thực tế theo chủ đề.'}
                  </p>
                </div>

                {/* Bottom CTA Button */}
                <div className="pt-6">
                  {topic.is_free ? (
                    <Link
                      href={topic.id ? `/topics/${topic.id}` : '/topics'}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EAF4FF] text-[#1A8CFF] hover:bg-[#1A8CFF] hover:text-white text-sm font-semibold shadow-sm hover:shadow-[0_8px_18px_rgba(26,140,255,0.3)] transition-all"
                    >
                      <span>Bắt đầu học</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.4]" />
                    </Link>
                  ) : (
                    <Link
                      href="/checkout"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF3E0] text-[#C96A00] hover:bg-[#F7931E] hover:text-white text-sm font-semibold shadow-sm hover:shadow-[0_8px_18px_rgba(247,147,30,0.32)] transition-all"
                    >
                      <span>Mở khóa chủ đề</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.4]" />
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* View All Topics Button */}
        <div className="flex justify-center pt-2">
          <Link
            href="/topics"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full border-[1.5px] border-[#1A8CFF] text-[#1A8CFF] hover:bg-[#1A8CFF] hover:text-white font-semibold text-sm transition-all shadow-sm"
          >
            <span>Xem toàn bộ chủ đề</span>
            <ArrowRight className="w-4 h-4 stroke-[2.6]" />
          </Link>
        </div>
      </section>
    </div>
  )
}
