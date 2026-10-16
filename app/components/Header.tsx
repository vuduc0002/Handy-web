'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Search, LogIn, LogOut, X, Loader2 } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface WordResult {
  id: string | number
  word: string
  meaning?: string
  [key: string]: unknown
}

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<WordResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auth state
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
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
          .select('id, word, meaning')
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
    router.push('/login')
  }

  const handleResultClick = (item: WordResult) => {
    setShowDropdown(false)
    setQuery('')
    router.push(`/vocabularies/${item.id}`)
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b-4 border-amber-300 shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/handy-logo.png"
            alt="HANDY"
            width={110}
            height={44}
            className="object-contain"
            style={{ height: 'auto' }}
            priority
          />
        </Link>

        {/* Search bar */}
        <div ref={searchRef} className="relative flex-1 max-w-lg mx-auto">
          <div className="flex items-center gap-2 bg-amber-50 border-2 border-amber-300 rounded-full px-4 py-2 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-200 transition">
            {searching
              ? <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
              : <Search className="w-4 h-4 text-amber-400 shrink-0" />
            }
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => results.length > 0 && setShowDropdown(true)}
              placeholder="Tìm từ vựng..."
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-amber-300 outline-none"
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); setShowDropdown(false) }}>
                <X className="w-4 h-4 text-amber-400 hover:text-orange-500 transition" />
              </button>
            )}
          </div>

          {/* Dropdown results */}
          {showDropdown && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border-2 border-amber-200 overflow-hidden z-50">
              {results.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-4">Không tìm thấy từ nào 😕</p>
              ) : (
                <ul>
                  {results.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => handleResultClick(item)}
                        className="w-full text-left px-4 py-3 hover:bg-amber-50 transition flex flex-col gap-0.5 border-b border-amber-100 last:border-0"
                      >
                        <span className="font-semibold text-gray-800 text-sm">{item.word}</span>
                        {item.meaning && (
                          <span className="text-xs text-gray-500 line-clamp-1">{item.meaning}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Auth button */}
        {user ? (
          <button
            onClick={handleLogout}
            className="shrink-0 flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 font-semibold text-sm px-4 py-2 rounded-full transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        ) : (
          <Link
            href="/login"
            className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-sm px-4 py-2 rounded-full shadow-md shadow-amber-200 transition"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Đăng nhập</span>
          </Link>
        )}
      </div>
    </header>
  )
}
