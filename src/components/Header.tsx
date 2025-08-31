'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface HeaderProps {
  currentPage?: 'home' | 'ask' | 'practice' | 'parent-items' | 'teacher'
}

export default function Header({ currentPage }: HeaderProps = {}) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 自动检测当前页面
  const detectCurrentPage = () => {
    if (currentPage) return currentPage
    
    if (pathname === '/') return 'home'
    if (pathname.startsWith('/ask')) return 'ask'
    if (pathname.startsWith('/practice')) return 'practice'
    if (pathname.startsWith('/parent-items')) return 'parent-items'
    if (pathname.startsWith('/placement-test')) return 'placement-test'
    if (pathname.startsWith('/teacher')) return 'teacher'
    
    return 'home'
  }

  const current = detectCurrentPage()

  const navItems = [
    { key: 'home', label: '首页', href: '/' },
    { key: 'ask', label: 'AI问答', href: '/ask' },
    { key: 'practice', label: '智能练习', href: '/practice' },
    { key: 'parent-items', label: '母题系统', href: '/parent-items' },
    { key: 'placement-test', label: '摸底考试', href: '/placement-test' }
  ]

  const getPageBadge = () => {
    const badges = {
      'home': { label: '首页', color: 'bg-blue-100 text-blue-800' },
      'ask': { label: 'AI问答', color: 'bg-purple-100 text-purple-800' },
      'practice': { label: '智能练习', color: 'bg-orange-100 text-orange-800' },
      'parent-items': { label: '母题系统', color: 'bg-green-100 text-green-800' },
      'placement-test': { label: '摸底考试', color: 'bg-indigo-100 text-indigo-800' },
      'teacher': { label: '教师控制台', color: 'bg-red-100 text-red-800' }
    }
    
    return badges[current] || badges['home']
  }

  const pageBadge = getPageBadge()

  return (
    <nav className="bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 左侧 - 品牌和页面标识 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                岭鹿AI
              </h1>
            </Link>
            <span className={`ml-4 px-3 py-1 text-xs font-medium rounded-full border ${
              current === 'home' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-400/30' :
              current === 'ask' ? 'bg-purple-500/10 text-purple-400 border-purple-400/30' :
              current === 'practice' ? 'bg-pink-500/10 text-pink-400 border-pink-400/30' :
              current === 'parent-items' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/30' :
              current === 'placement-test' ? 'bg-blue-500/10 text-blue-400 border-blue-400/30' :
              'bg-red-500/10 text-red-400 border-red-400/30'
            }`}>
              {pageBadge.label}
            </span>
          </div>
          
          {/* 右侧 - 导航链接和用户信息 */}
          <div className="flex items-center space-x-6">
            {/* 主导航 - 桌面端 */}
            <div className="hidden md:flex space-x-1">
              {navItems.map(item => (
                <Link 
                  key={item.key}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                    current === item.key
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-400/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* 教师控制台 - 仅教师和管理员可见 */}
              {session?.user?.role === 'TEACHER' || session?.user?.role === 'ADMIN' ? (
                <Link 
                  href="/teacher"
                  className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                    current === 'teacher'
                      ? 'bg-red-500/10 text-red-400 border border-red-400/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  教师控制台
                </Link>
              ) : null}
            </div>

            {/* 用户信息 */}
            {session ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="text-gray-400">欢迎，</span>
                  <span className="font-medium text-white">{session.user.name}</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200"
                >
                  退出
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-200 border border-cyan-400/20"
              >
                登录
              </Link>
            )}

            {/* 移动端菜单按钮 */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 移动端导航菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700/50 bg-gray-900/95 backdrop-blur-md">
            <div className="px-4 py-2 space-y-1">
              {navItems.map(item => (
                <Link 
                  key={item.key}
                  href={item.href}
                  className={`block px-4 py-3 rounded-xl transition-all duration-200 ${
                    current === item.key
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-400/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* 教师控制台 - 移动端 */}
              {(session?.user?.role === 'TEACHER' || session?.user?.role === 'ADMIN') && (
                <Link 
                  href="/teacher"
                  className={`block px-4 py-3 rounded-xl transition-all duration-200 ${
                    current === 'teacher'
                      ? 'bg-red-500/10 text-red-400 border border-red-400/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  教师控制台
                </Link>
              )}

              {/* 用户信息 - 移动端 */}
              {session && (
                <div className="pt-3 border-t border-gray-700/50 mt-3">
                  <div className="px-4 py-2 text-sm">
                    <span className="text-gray-400">欢迎，</span>
                    <span className="font-medium text-white">{session.user.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut({ callbackUrl: '/' })
                    }}
                    className="block w-full text-left px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200"
                  >
                    退出
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}