'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowLeft,
  ShieldCheck,
  User,
  Sparkles,
  LogOut,
} from 'lucide-react'
import { logoutUser } from '@/lib/authUtils'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    {
      label: 'Thống kê',
      href: '/admin/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      active: pathname.startsWith('/admin/dashboard'),
    },
    {
      label: 'Nội dung',
      href: '/admin',
      icon: <BookOpen className="w-4 h-4" />,
      active: pathname === '/admin',
    },
    {
      label: 'Người dùng',
      href: '/admin/users',
      icon: <Users className="w-4 h-4" />,
      active: pathname.startsWith('/admin/users'),
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* ========================================================================= */}
      {/* UNIFIED PLANHAT SAAS ADMIN HEADER (Modern Luxury Glassmorphism)           */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand + Navigation Pills */}
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-sm ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-200">
                H
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-slate-900 block leading-none">
                  HANDY
                </span>
                <span className="text-[10px] uppercase font-bold text-indigo-600/80 tracking-wider">
                  Admin Console
                </span>
              </div>
            </Link>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            {/* Navigation Tabs with Luxury Indigo-to-Violet Gradients */}
            <nav className="flex items-center gap-1.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                    item.active
                      ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Quick actions + Admin badge */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xem trang người dùng</span>
            </Link>

            <div className="h-4 w-px bg-slate-200" />

            {/* Admin Badge */}
            <div className="flex items-center gap-2 pl-1">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-900 to-indigo-950 text-white flex items-center justify-center text-xs font-bold shadow-xs ring-1 ring-slate-900/10">
                  A
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className="hidden md:block text-left leading-tight">
                <span className="text-xs font-bold text-slate-900 block">
                  Administrator
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  Super Admin
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => logoutUser('/login')}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
              title="Đăng xuất quản trị"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <div className="w-full">
        {children}
      </div>
    </div>
  )
}
