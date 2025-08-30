'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface HeaderProps {
  currentPage?: 'home' | 'ask' | 'practice' | 'parent-items' | 'teacher'
}

export default function Header({ currentPage }: HeaderProps = {}) {
  const { data: session } = useSession()
  const pathname = usePathname()

  // 自动检测当前页面
  const detectCurrentPage = () => {
    if (currentPage) return currentPage
    
    if (pathname === '/') return 'home'
    if (pathname.startsWith('/ask')) return 'ask'
    if (pathname.startsWith('/practice')) return 'practice'
    if (pathname.startsWith('/parent-items')) return 'parent-items'
    if (pathname.startsWith('/teacher')) return 'teacher'
    
    return 'home'
  }

  const current = detectCurrentPage()

  const navItems = [
    { key: 'home', label: '首页', href: '/' },
    { key: 'ask', label: 'AI问答', href: '/ask' },
    { key: 'practice', label: '智能练习', href: '/practice' },
    { key: 'parent-items', label: '母题系统', href: '/parent-items' }
  ]

  const getPageBadge = () => {
    const badges = {
      'home': { label: '首页', color: 'bg-blue-100 text-blue-800' },
      'ask': { label: 'AI问答', color: 'bg-purple-100 text-purple-800' },
      'practice': { label: '智能练习', color: 'bg-orange-100 text-orange-800' },
      'parent-items': { label: '母题系统', color: 'bg-green-100 text-green-800' },
      'teacher': { label: '教师控制台', color: 'bg-red-100 text-red-800' }
    }
    
    return badges[current] || badges['home']
  }

  const pageBadge = getPageBadge()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 左侧 - 品牌和页面标识 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
                岭鹿AI
              </h1>
            </Link>
            <span className={`ml-3 px-3 py-1 text-sm font-medium rounded-full ${pageBadge.color}`}>
              {pageBadge.label}
            </span>
          </div>
          
          {/* 右侧 - 导航链接和用户信息 */}
          <div className="flex items-center space-x-6">
            {/* 主导航 - 桌面端 */}
            <div className="hidden md:flex space-x-4">
              {navItems.map(item => (
                <Link 
                  key={item.key}
                  href={item.href}
                  className={`px-3 py-2 transition-colors ${
                    current === item.key
                      ? 'text-blue-600 font-medium border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* 教师控制台 - 仅教师和管理员可见 */}
              {session?.user?.role === 'TEACHER' || session?.user?.role === 'ADMIN' ? (
                <Link 
                  href="/teacher"
                  className={`px-3 py-2 transition-colors ${
                    current === 'teacher'
                      ? 'text-red-600 font-medium border-b-2 border-red-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  教师控制台
                </Link>
              ) : null}
            </div>

            {/* 用户信息 */}
            {session ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm">
                  <span className="text-gray-500">欢迎，</span>
                  <span className="font-medium text-gray-900">{session.user.name}</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  退出
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                登录
              </Link>
            )}

            {/* 移动端菜单按钮 */}
            <div className="md:hidden">
              <button className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}