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
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 左侧 - 品牌和页面标识 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                岭鹿AI
              </h1>
            </Link>
          </div>
          
          {/* 右侧 - 导航链接和用户信息 */}
          <div className="flex items-center space-x-6">
            {/* 主导航 - 桌面端 */}
            <div className="hidden md:flex space-x-1">
              {navItems.map(item => (
                <Link 
                  key={item.key}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                    current === item.key
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* 教师控制台 - 仅教师和管理员可见 */}
              {session?.user?.role === 'TEACHER' || session?.user?.role === 'ADMIN' ? (
                <Link 
                  href="/teacher"
                  className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                    current === 'teacher'
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
                  <span className="text-gray-500">欢迎，</span>
                  <span className="font-medium text-gray-900">{session.user.name}</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  退出
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors"
                >
                  登录
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  注册
                </Link>
              </div>
            )}

            {/* 移动端菜单按钮 */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50 transition-colors"
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
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              {navItems.map(item => (
                <Link 
                  key={item.key}
                  href={item.href}
                  className={`block px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                    current === item.key
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
                  className={`block px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                    current === 'teacher'
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  教师控制台
                </Link>
              )}

              {/* 用户信息 - 移动端 */}
              {session && (
                <div className="pt-3 border-t border-gray-200 mt-3">
                  <div className="px-4 py-2 text-sm">
                    <span className="text-gray-500">欢迎，</span>
                    <span className="font-medium text-gray-900">{session.user.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut({ callbackUrl: '/' })
                    }}
                    className="block w-full text-left px-4 py-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
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