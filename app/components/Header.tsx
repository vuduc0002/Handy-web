'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  ChevronDown,
  Home,
  BookOpen,
  BrainCircuit,
  ClipboardCheck,
  Lock,
  Play,
  Volume2
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { getEmbedYoutubeUrl } from '@/lib/utils'
import { logoutUser } from '@/lib/authUtils'

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
  vip_until?: string | null
  plan_type?: string | null
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
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedModalVocab, setSelectedModalVocab] = useState<WordResult | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const isVip = Boolean(
    profile?.is_premium && (!profile?.vip_until || new Date(profile.vip_until) > new Date())
  )
  const isAdmin = profile?.role === 'ADMIN'

  const searchRef = useRef<HTMLDivElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auth state & Profile fetching
  useEffect(() => {
    let isMounted = true
    const profileCache = new Map<string, Profile>()

    const fetchUserAndProfile = (currentUser: User | null) => {
      if (!isMounted) return
      setUser(currentUser)

      if (!currentUser) {
        setProfile(null)
        return
      }

      const cached = profileCache.get(currentUser.id)
      if (cached) {
        setProfile(cached)
        return
      }

      Promise.resolve(
        supabase
          .from('profiles')
          .select('id, role, is_premium, vip_until, plan_type, email')
          .eq('id', currentUser.id)
          .maybeSingle()
      )
        .then(({ data: profileData }) => {
          if (isMounted && profileData) {
            profileCache.set(currentUser.id, profileData)
            setProfile(profileData)
          }
        })
        .catch(() => {
          // Silent fail
        })
    }

    supabase.auth.getUser().then(({ data }) => fetchUserAndProfile(data.user))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserAndProfile(session?.user ?? null)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Close dropdowns on outside click & keyboard shortcuts
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false)
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setShowAccountMenu(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        const input = searchRef.current?.querySelector('input')
        input?.focus()
      } else if (e.key === 'Escape') {
        setShowSearchDropdown(false)
        setShowAccountMenu(false)
        setSelectedModalVocab(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on navigate
  useEffect(() => {
    setMobileMenuOpen(false)
    setShowAccountMenu(false)
    setShowSearchDropdown(false)
  }, [pathname])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  // Search with debounce
  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value.trim()) {
      setResults([])
      setShowSearchDropdown(false)
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
          setShowSearchDropdown(true)
        }
      } catch {
        // silent fail
      } finally {
        setSearching(false)
      }
    }, 300)
  }, [])

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    setShowAccountMenu(false)
    setMobileMenuOpen(false)
    setUser(null)
    setProfile(null)
    await logoutUser('/login')
  }

  const handleResultClick = (item: WordResult) => {
    setShowSearchDropdown(false)
    setQuery('')
    setSelectedModalVocab(item)
  }

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
    { label: 'Chủ đề', href: '/topics', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Luyện tập', href: '/practice', icon: <BrainCircuit className="w-4 h-4" /> },
    { label: 'Kiểm tra', href: '/quiz', icon: <ClipboardCheck className="w-4 h-4" /> },
  ]

  const userDisplayName =
    profile?.email?.split('@')[0] || (user?.email ? user.email.split('@')[0] : 'Bạn')
  const userInitial = (userDisplayName.charAt(0) || 'U').toUpperCase()

  const isMp4 = selectedModalVocab?.video_url?.toLowerCase().endsWith('.mp4')

  // Hide header on admin pages (admin layout has its own header)
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 font-sans ${
          isScrolled
            ? 'shadow-[0_8px_24px_rgba(15,42,92,0.08)] backdrop-blur-md'
            : ''
        }`}
        style={{
          background:
            'radial-gradient(30% 260% at 0% 50%,rgba(240,67,106,0.16) 0%,rgba(240,67,106,0) 100%),radial-gradient(30% 260% at 100% 50%,rgba(26,140,255,0.22) 0%,rgba(26,140,255,0) 100%),linear-gradient(90deg,#FFE6EC 0%,#D9EAFF 45%,#C9E2FF 100%)',
        }}
      >
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between gap-3 md:gap-4">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-3 lg:gap-5 shrink-0">
            <Link
              href="/"
              aria-label="HANDY"
              className="flex items-center shrink-0 hover:opacity-90 transition-opacity"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/logo-handy-sm.png"
                alt="HANDY"
                className="h-10 sm:h-11 w-auto block object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 text-[15px] font-medium">
              {navLinks.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? 'bg-[#EAF4FF] text-[#0B6FE0] font-semibold shadow-[inset_0_0_0_1px_#CFE3FB]'
                        : 'text-[#1E1E1E] hover:text-[#1A8CFF] hover:bg-[#F4F9FF]'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Center/Right: Search bar (Desktop) */}
          <div
            ref={searchRef}
            className="relative flex-1 max-w-[280px] xl:max-w-[340px] hidden md:block"
          >
            <div className="flex items-center gap-2.5 h-[42px] px-4 rounded-full border-[1.5px] border-[#9CCBFF] bg-[#F4F9FF] text-[#4F86C6] focus-within:border-[#1A8CFF] focus-within:bg-[#EAF4FF] focus-within:ring-4 focus-within:ring-[rgba(26,140,255,0.14)] transition-all">
              {searching ? (
                <Loader2 className="w-4 h-4 text-[#1A8CFF] animate-spin shrink-0" />
              ) : (
                <Search className="w-4 h-4 text-[#1A8CFF] shrink-0" />
              )}
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => results.length > 0 && setShowSearchDropdown(true)}
                placeholder="Tìm kiếm từ vựng..."
                className="flex-1 bg-transparent text-[14.5px] text-[#1E1E1E] placeholder-[#4F86C6]/80 outline-none min-w-0"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setResults([])
                    setShowSearchDropdown(false)
                  }}
                  className="shrink-0 p-1 text-[#4F86C6] hover:text-[#1E1E1E]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden xl:inline-block text-[11px] font-semibold text-[#4F86C6]/70 bg-white/70 px-1.5 py-0.5 rounded border border-[#9CCBFF]/60">
                  Ctrl K
                </kbd>
              )}
            </div>

            {/* Search Dropdown Results */}
            {showSearchDropdown && (
              <div className="absolute top-full mt-2 left-0 right-0 max-h-[380px] overflow-y-auto bg-white rounded-2xl shadow-[0_18px_40px_rgba(15,42,92,0.16)] border border-[#DCEBFC] p-2 z-50 animate-slide-down">
                {results.length === 0 ? (
                  <div className="py-6 px-4 text-center text-sm text-[#6B6B6B]">
                    Không tìm thấy từ vựng phù hợp 😕
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {results.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => handleResultClick(item)}
                          className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-[#F4F9FF] transition flex items-center justify-between gap-2 group cursor-pointer"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-[#1E1E1E] text-sm group-hover:text-[#1A8CFF] transition-colors">
                              {item.word}
                            </span>
                            {item.meaning && (
                              <span className="text-xs text-[#6B6B6B] block truncate">
                                {item.meaning}
                              </span>
                            )}
                          </div>
                          <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EAF4FF] text-[#1A8CFF] group-hover:bg-[#1A8CFF] group-hover:text-white transition">
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

          {/* Right Controls: Auth & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* If Logged in */}
            {user ? (
              <div className="flex items-center gap-2" ref={accountRef}>
                {/* Admin button for admins */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    title="Trang quản trị"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-[1.5px] border-[#FBD58A] bg-[#FFF6E5] text-[#B26A00] hover:bg-[#F7A21B] hover:text-white hover:border-[#F7A21B] text-xs sm:text-sm font-bold transition shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Quản trị</span>
                  </Link>
                )}

                {/* Account Button with dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                    className="flex items-center gap-2 p-1 pr-3 rounded-full border-[1.5px] border-[#E3E7EE] bg-white text-[#1E1E1E] hover:border-[#1A8CFF] hover:shadow-[0_6px_16px_rgba(26,140,255,0.15)] transition cursor-pointer"
                  >
                    {/* Avatar circle */}
                    <span
                      className={`w-[34px] h-[34px] rounded-full text-white flex items-center justify-center font-bold text-sm shrink-0 ${
                        isAdmin
                          ? 'bg-gradient-to-tr from-[#E08A00] to-[#FFC94D]'
                          : 'bg-gradient-to-tr from-[#1A6FE0] to-[#5CB0FF]'
                      } ${isVip ? 'ring-2 ring-white shadow-[0_0_0_2px_#F7A21B]' : ''}`}
                    >
                      {userInitial}
                    </span>

                    {/* Username */}
                    <span className="hidden sm:inline-block max-w-[100px] truncate font-semibold text-sm text-[#1E1E1E]">
                      {userDisplayName}
                    </span>

                    {/* VIP / Free Badge */}
                    {isVip ? (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FFC94D] to-[#F7931E] text-white">
                        <Crown className="w-2.5 h-2.5" /> VIP
                      </span>
                    ) : (
                      <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F1F3F7] text-[#4A4A4A]">
                        Miễn phí
                      </span>
                    )}

                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#6B6B6B] transition-transform duration-200 ${
                        showAccountMenu ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Account Dropdown Menu */}
                  {showAccountMenu && (
                    <div className="absolute right-0 top-full mt-2 w-[260px] p-2 bg-white rounded-2xl border border-[#ECEEF3] shadow-[0_20px_44px_rgba(20,30,60,0.14)] z-50 flex flex-col gap-1 animate-slide-down">
                      {/* User Info Header */}
                      <div className="p-3 border-b border-[#F1F3F7] mb-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-sm text-[#1E1E1E] truncate">
                            {userDisplayName}
                          </span>
                          {isAdmin && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF6E5] text-[#B26A00] shrink-0">
                              Admin
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-[#6B6B6B] truncate block">
                          {profile?.email || user.email}
                        </span>
                      </div>

                      {/* Admin link */}
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-[#B26A00] hover:bg-[#FFF6E5] transition"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#B26A00]" />
                          <span>Trang quản trị</span>
                        </Link>
                      )}

                      {/* My profile */}
                      <Link
                        href="/profile"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-[#1E1E1E] hover:bg-[#F4F9FF] hover:text-[#1A8CFF] transition"
                      >
                        <UserIcon className="w-4 h-4 text-[#6B6B6B]" />
                        <span>Tài khoản của tôi</span>
                      </Link>

                      {/* VIP upgrade / status */}
                      {isVip ? (
                        <Link
                          href="/pricing"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#FFF6E5] to-[#FFEFD6] text-[#B26A00] hover:opacity-95 transition"
                        >
                          <Crown className="w-4 h-4 text-[#F7931E]" />
                          <div className="flex flex-col">
                            <span>Gói VIP đang dùng</span>
                            {profile?.vip_until && (
                              <span className="text-[11px] font-normal text-[#8A6A2A]">
                                Hạn: {new Date(profile.vip_until).toLocaleDateString('vi-VN')}
                              </span>
                            )}
                          </div>
                        </Link>
                      ) : (
                        <Link
                          href="/pricing"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-[#1E1E1E] hover:bg-[#FFF6E5] hover:text-[#B26A00] transition"
                        >
                          <Crown className="w-4 h-4 text-[#F7931E]" />
                          <span>Nâng cấp VIP</span>
                        </Link>
                      )}

                      {/* Logout */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-[#C8284F] hover:bg-[#FFF0F3] transition cursor-pointer"
                      >
                        {isLoggingOut ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#C8284F]" />
                        ) : (
                          <LogOut className="w-4 h-4 text-[#C8284F]" />
                        )}
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* If Not logged in: Đăng nhập & Đăng ký buttons */
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 sm:px-5 py-2 rounded-full font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-[#0050B3] to-[#1A8CFF] hover:brightness-105 shadow-sm transition-all"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex px-4 sm:px-5 py-2 rounded-full font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-[#B0173C] to-[#F0436A] hover:brightness-105 shadow-sm transition-all"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-[#E3E7EE] bg-white text-[#1E1E1E] hover:bg-[#F4F9FF] transition"
              aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[#1E1E1E]" />
              ) : (
                <Menu className="w-5 h-5 text-[#1E1E1E]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/98 backdrop-blur-md border-t border-[#F1F3F7] shadow-xl px-4 py-4 space-y-3 animate-slide-down">
            {/* Mobile search bar */}
            <div className="relative">
              <div className="flex items-center gap-2.5 h-11 px-4 rounded-xl border border-[#9CCBFF] bg-[#F4F9FF]">
                <Search className="w-4 h-4 text-[#1A8CFF] shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Tìm kiếm từ vựng..."
                  className="flex-1 bg-transparent text-sm text-[#1E1E1E] placeholder-[#4F86C6]/80 outline-none"
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery('')
                      setResults([])
                    }}
                    className="p-1 text-[#6B6B6B]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Mobile search results */}
              {results.length > 0 && query && (
                <div className="mt-2 max-h-56 overflow-y-auto bg-white rounded-xl border border-[#DCEBFC] p-2 space-y-1">
                  {results.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleResultClick(item)}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-[#F4F9FF] flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-[#1E1E1E]">{item.word}</span>
                      <span className="text-[#1A8CFF] font-semibold">Xem video</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-1 pt-1">
              {navLinks.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-base font-semibold transition ${
                      isActive
                        ? 'bg-[#EAF4FF] text-[#0B6FE0]'
                        : 'text-[#1E1E1E] hover:bg-[#F4F9FF] hover:text-[#1A8CFF]'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Mobile Auth Bottom Bar */}
            <div className="pt-3 border-t border-[#F1F3F7]">
              {user ? (
                <div className="space-y-1">
                  <div className="px-3 py-1.5 text-xs text-[#6B6B6B]">
                    Đăng nhập: <b className="text-[#1E1E1E]">{userDisplayName}</b>
                  </div>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-[#B26A00] hover:bg-[#FFF6E5]"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#B26A00]" />
                      <span>Trang quản trị</span>
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-[#1E1E1E] hover:bg-[#F4F9FF]"
                  >
                    <UserIcon className="w-4 h-4 text-[#6B6B6B]" />
                    <span>Tài khoản của tôi</span>
                  </Link>
                  <Link
                    href="/pricing"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-[#B26A00] hover:bg-[#FFF6E5]"
                  >
                    <Crown className="w-4 h-4 text-[#F7931E]" />
                    <span>{isVip ? 'Gói VIP đang dùng' : 'Nâng cấp VIP'}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-[#C8284F] hover:bg-[#FFF0F3]"
                  >
                    <LogOut className="w-4 h-4 text-[#C8284F]" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <Link
                    href="/login"
                    className="flex justify-center items-center py-2.5 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-[#0050B3] to-[#1A8CFF]"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/login"
                    className="flex justify-center items-center py-2.5 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-[#B0173C] to-[#F0436A]"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ================================================================
          MODAL XEM VIDEO KÝ HIỆU KHI TÌM KIẾM
          ================================================================ */}
      {selectedModalVocab && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#DCEBFC] animate-scale-in">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#EAF4FF] to-white border-b border-[#DCEBFC]">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-[#1A8CFF] text-white flex items-center justify-center shadow-md">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </span>
                <div>
                  <h3 className="font-bold text-xl text-[#1E1E1E]">
                    {selectedModalVocab.word}
                  </h3>
                  {selectedModalVocab.meaning && (
                    <p className="text-xs text-[#4A4A4A]">
                      {selectedModalVocab.meaning}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => speakWord(selectedModalVocab.word)}
                  className="p-2 rounded-xl text-[#1A8CFF] hover:bg-[#EAF4FF] transition"
                  title="Nghe phát âm tiếng Việt"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedModalVocab(null)}
                  className="p-2 rounded-xl text-[#6B6B6B] hover:text-[#1E1E1E] hover:bg-[#F1F3F7] transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Content */}
            <div className="p-6 space-y-4">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner flex items-center justify-center">
                {selectedModalVocab.video_url ? (
                  isMp4 ? (
                    <video
                      src={selectedModalVocab.video_url}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={getEmbedYoutubeUrl(selectedModalVocab.video_url)}
                      title={selectedModalVocab.word}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                ) : (
                  <div className="text-center text-white/70 p-6">
                    <p className="font-semibold text-sm">Chưa có video minh họa cho từ này</p>
                  </div>
                )}
              </div>

              {selectedModalVocab.description && (
                <div className="p-4 rounded-2xl bg-[#F4F9FF] border border-[#DCEBFC] text-sm text-[#4A4A4A] leading-relaxed">
                  <span className="font-bold text-[#1A8CFF] block mb-1">
                    Hướng dẫn thực hiện:
                  </span>
                  {selectedModalVocab.description}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-[#F8FAFC] border-t border-[#ECEEF3] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedModalVocab(null)}
                className="px-5 py-2 rounded-full bg-[#1A8CFF] hover:bg-[#0B6FE0] text-white font-semibold text-sm transition shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
