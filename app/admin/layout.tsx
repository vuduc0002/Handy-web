'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
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
      label: 'Dashboard & Doanh thu',
      href: '/admin/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      active: pathname === '/admin/dashboard',
    },
    {
      label: 'Quản lý Nội dung',
      href: '/admin',
      icon: <BookOpen className="w-4 h-4" />,
      active: pathname === '/admin',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
      {/* ========================================================================= */}
      {/* UNIFIED SAAS ADMIN HEADER (Vercel / Stripe Clean Architecture)            */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand + Navigation Pills */}
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:bg-gray-800 transition-colors">
                H
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-gray-900 block leading-none">
                  HANDY
                </span>
                <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
                  Admin Console
                </span>
              </div>
            </Link>

            <div className="h-5 w-px bg-gray-200 hidden sm:block" />

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    item.active
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xem trang người dùng</span>
            </Link>

            <div className="h-4 w-px bg-gray-200" />

            {/* Admin Badge */}
            <div className="flex items-center gap-2 pl-1">
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  A
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className="hidden md:block text-left leading-tight">
                <span className="text-xs font-semibold text-gray-900 block">
                  Administrator
                </span>
                <span className="text-[10px] text-gray-400 block font-mono">
                  Super Admin
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => logoutUser('/login')}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition active:scale-95 cursor-pointer"
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
