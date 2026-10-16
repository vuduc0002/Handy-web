'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import {
  Search,
  LogIn,
  LogOut,
  X,
  Loader2,
  ShieldCheck,
  Menu,
  Crown,
  User as UserIcon,
  BookOpen,
  BrainCircuit,
  Home,
  Layers,
  Sparkles,
  Volume2
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { getEmbedYoutubeUrl } from '@/lib/utils'

interface WordResult {
  id: string | number
  word: string
  meaning?: string
  description?: string | null
  video_url?: string
  [key: string]: unknown
}

interface Profile {
  id: string
  role?: string
  is_premium?: boolean
  email?: string
}

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<WordResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedModalVocab, setSelectedModalVocab] = useState<WordResult | null>(null)

  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auth state & Profile fetching
  useEffect(() => {
    const fetchUserAndProfile = async (currentUser: User | null) => {
      setUser(currentUser)
      if (currentUser) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, role, is_premium, email')
          .eq('id', currentUser.id)
          .maybeSingle()
        setProfile(profileData ?? null)
      } else {
        setProfile(null)
      }
    }

    supabase.auth.getUser().then(({ data }) => fetchUserAndProfile(data.user))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserAndProfile(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Search with debounce
  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value.trim()) {
      setResults([])
      setShowDropdown(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const { data, error } = await supabase
          .from('vocabularies')
          .select('id, word, meaning, description, video_url')
          .ilike('word', `%${value.trim()}%`)
          .eq('is_deleted', false)
          .limit(8)

        if (!error && data) {
          setResults(data as WordResult[])
          setShowDropdown(true)
        }
      } catch {
        // silent fail
      } finally {
        setSearching(false)
      }
    }, 350)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push('/login')
  }

  // Click vào từ vựng: Mở Modal Popup trực tiếp xem video nhúng
  const handleResultClick = (item: WordResult) => {
    setShowDropdown(false)
    setQuery('')
    setSelectedModalVocab(item)
  }

  // Phát âm thử từ vựng
  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'vi-VN'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  const navLinks = [
    { label: 'Trang chủ', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Chủ đề', href: '/topics', icon: <Layers className="w-4 h-4" /> },
    { label: 'Luyện tập', href: '/quiz', icon: <BrainCircuit className="w-4 h-4" /> },
  ]

  const isMp4 = selectedModalVocab?.video_url?.toLowerCase().endsWith('.mp4')

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-4 border-amber-300 shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* Logo & Navigation Links */}
          <div className="flex items-center gap-6">
            <Link href="/" className="shrink-0 flex items-center">
              <Image
                src="/handy-logo.png"
                alt="HANDY"
                width={105}
                height={42}
                className="object-contain hover:scale-105 transition-transform"
                style={{ height: 'auto' }}
                priority
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-sm font-extrabold transition-all duration-150 ${
                      isActive
                        ? 'bg-amber-100 text-orange-600 shadow-sm'
                        : 'text-gray-700 hover:text-orange-600 hover:bg-amber-50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Search bar */}
          <div ref={searchRef} className="relative flex-1 max-w-xs sm:max-w-sm hidden sm:block">
            <div className="flex items-center gap-2 bg-amber-50 border-2 border-amber-300 rounded-full px-4 py-1.5 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-200 transition">
              {searching ? (
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
              ) : (
                <Search className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => results.length > 0 && setShowDropdown(true)}
                placeholder="Tìm từ vựng..."
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-amber-400/80 outline-none"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('')
                    setResults([])
                    setShowDropdown(false)
                  }}
                >
                  <X className="w-4 h-4 text-amber-400 hover:text-orange-500 transition" />
                </button>
              )}
            </div>

            {/* Dropdown results */}
            {showDropdown && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border-2 border-amber-200 overflow-hidden z-50">
                {results.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-4">
                    Không tìm thấy từ nào 😕
                  </p>
                ) : (
                  <ul>
                    {results.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => handleResultClick(item)}
                          className="w-full text-left px-4 py-3 hover:bg-amber-50 transition flex items-center justify-between border-b border-amber-100 last:border-0 group cursor-pointer"
                        >
                          <div>
                            <span className="font-extrabold text-gray-800 text-sm group-hover:text-orange-600 transition-colors">
                              {item.word}
                            </span>
                            {item.meaning && (
                              <span className="text-xs text-gray-500 block line-clamp-1">
                                {item.meaning}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md">
                            Xem video
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Right Controls: Trang Quản Trị, VIP Badge, Profile, Auth */}
          <div className="flex items-center gap-2">
            {/* Admin button if role === ADMIN */}
            {user && profile?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="hidden lg:flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-amber-300 font-extrabold text-xs px-3.5 py-2 rounded-2xl transition shadow-sm active:scale-95"
                title="Trang quản trị"
              >
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                <span>Quản trị</span>
              </Link>
            )}

            {/* User Profile / Status */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 transition shadow-sm active:scale-95"
                  title="Thông tin cá nhân"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-400 to-amber-300 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black text-gray-800 truncate max-w-[90px]">
                        {profile?.email?.split('@')[0] || 'Cá nhân'}
                      </span>
                      {profile?.is_premium ? (
                        <span className="text-[10px] font-extrabold bg-gradient-to-r from-amber-400 to-orange-400 text-white px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shadow-xs">
                          <Crown className="w-2.5 h-2.5" /> VIP
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="hidden md:flex p-2 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 transition"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-2xl shadow-md shadow-amber-200 transition active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-2xl border-2 border-amber-300 text-gray-700 hover:bg-amber-50 transition"
              aria-label="Mở Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t-2 border-amber-200 px-4 pt-3 pb-5 space-y-3 shadow-xl">
            {/* Mobile search bar */}
            <div className="relative w-full">
              <div className="flex items-center gap-2 bg-amber-50 border-2 border-amber-300 rounded-2xl px-3 py-2">
                <Search className="w-4 h-4 text-amber-400 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Tìm từ vựng..."
                  className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                />
              </div>
            </div>

            <nav className="flex flex-col gap-1.5 pt-1">
              {navLinks.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-extrabold transition ${
                      isActive
                        ? 'bg-amber-100 text-orange-600'
                        : 'text-gray-700 hover:bg-amber-50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )
              })}

              {user && (
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-extrabold text-gray-700 hover:bg-amber-50"
                >
                  <UserIcon className="w-4 h-4 text-orange-500" />
                  <span>Trang cá nhân ({profile?.is_premium ? 'VIP' : 'Miễn phí'})</span>
                </Link>
              )}

              {user && profile?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-extrabold text-amber-900 bg-amber-50"
                >
                  <ShieldCheck className="w-4 h-4 text-orange-600" />
                  <span>Trang quản trị (Admin)</span>
                </Link>
              )}

              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-extrabold text-red-600 hover:bg-red-50 text-left w-full"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* MODAL POPUP HIỆN VIDEO TỪ VỰNG KHI CLICK VÀO TỪ (FIX LỖI 404) */}
      {selectedModalVocab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl border-2 border-amber-300 p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedModalVocab(null)}
              className="w-9 h-9 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 flex items-center justify-center absolute top-4 right-4 transition z-10"
              title="Đóng popup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Video Iframe / Video tag */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-md border-2 border-amber-200 mb-4">
              {selectedModalVocab.video_url ? (
                isMp4 ? (
                  <video
                    src={selectedModalVocab.video_url}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <iframe
                    src={getEmbedYoutubeUrl(selectedModalVocab.video_url)}
                    title={selectedModalVocab.word}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full aspect-video rounded-xl border-0 h-full"
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  Chưa có video cho từ này
                </div>
              )}
            </div>

            {/* Thông tin từ vựng */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-orange-500">
                      {selectedModalVocab.word}
                    </h3>
                    <button
                      onClick={() => speakWord(selectedModalVocab.word)}
                      className="w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 flex items-center justify-center transition active:scale-95"
                      title="Phát âm tiếng Việt"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  {selectedModalVocab.meaning && (
                    <p className="text-sm font-bold text-gray-700 mt-1">
                      {selectedModalVocab.meaning}
                    </p>
                  )}
                </div>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full shrink-0">
                  Thủ ngữ
                </span>
              </div>

              {selectedModalVocab.description && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 text-xs text-gray-700 leading-relaxed">
                  <span className="font-bold text-amber-900 block mb-1">
                    Hướng dẫn động tác tay:
                  </span>
                  {selectedModalVocab.description}
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedModalVocab(null)}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 text-white font-extrabold text-xs shadow-md transition active:scale-95"
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
