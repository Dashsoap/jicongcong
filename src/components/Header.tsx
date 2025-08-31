'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

interface HeaderProps {
  currentPage?: 'home' | 'ask' | 'practice' | 'parent-items' | 'teacher'
}

export default function Header({ currentPage }: HeaderProps = {}) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // 监听滚动状态
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
    { 
      key: 'home', 
      label: '首页', 
      href: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      key: 'ask', 
      label: 'AI问答', 
      href: '/ask',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: 'from-purple-500 to-pink-500'
    },
    { 
      key: 'practice', 
      label: '智能练习', 
      href: '/practice',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'from-emerald-500 to-teal-500'
    },
    { 
      key: 'parent-items', 
      label: '母题系统', 
      href: '/parent-items',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'from-orange-500 to-red-500'
    },
    { 
      key: 'placement-test', 
      label: '摸底考试', 
      href: '/placement-test',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'from-indigo-500 to-purple-500'
    }
  ]

  const getCurrentItem = () => navItems.find(item => item.key === current)
  const currentItem = getCurrentItem()

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20' 
        : 'bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 左侧 - 品牌Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse-glow"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  岭鹿AI
                </h1>
                <div className="text-xs text-gray-500 font-medium">智能学习平台</div>
              </div>
            </Link>
          </div>
          
          {/* 中间 - 当前页面指示器 */}
          {currentItem && (
            <div className="hidden md:flex items-center">
              <div 
                className="flex items-center px-4 py-2 rounded-full text-white shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${currentItem.color.replace('from-', '').replace(' to-', ', ')})`
                }}
              >
                <div className="mr-2">
                  {currentItem.icon}
                </div>
                <span className="font-medium">{currentItem.label}</span>
              </div>
            </div>
          )}
          
          {/* 右侧 - 导航和用户信息 */}
          <div className="flex items-center space-x-6">
            {/* 主导航 - 桌面端 */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map(item => (
                <Link 
                  key={item.key}
                  href={item.href}
                  className={`relative flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-300 group ${
                    current === item.key
                      ? 'text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                  }`}
                  style={current === item.key ? {
                    background: `linear-gradient(135deg, ${item.color.replace('from-', '').replace(' to-', ', ')})`,
                  } : {}}
                >
                  <div className={`mr-2 transition-transform duration-300 ${
                    current === item.key ? 'scale-110' : 'group-hover:scale-110'
                  }`}>
                    {item.icon}
                  </div>
                  <span className="text-sm">{item.label}</span>
                  {current !== item.key && (
                    <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300"
                         style={{background: `linear-gradient(135deg, ${item.color.replace('from-', '').replace(' to-', ', ')})`}}>
                    </div>
                  )}
                </Link>
              ))}
              
              {/* 教师控制台 */}
              {session?.user?.role === 'TEACHER' || session?.user?.role === 'ADMIN' ? (
                <Link 
                  href="/teacher"
                  className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-300 group ${
                    current === 'teacher'
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-sm">教师控制台</span>
                </Link>
              ) : null}
            </div>

            {/* 用户信息 */}
            {session ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 px-4 py-2 bg-gray-100/50 rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {session.user.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block text-sm">
                    <div className="font-medium text-gray-900">{session.user.name}</div>
                    <div className="text-gray-500 text-xs">在线</div>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-xl transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
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
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  立即注册
                </Link>
              </div>
            )}

            {/* 移动端菜单按钮 */}
            <div className="lg:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl transition-all duration-200"
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
          <div className="lg:hidden border-t border-gray-200/50 bg-white/80 backdrop-blur-sm animate-slide-up">
            <div className="px-4 py-4 space-y-2">
              {navItems.map(item => (
                <Link 
                  key={item.key}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    current === item.key
                      ? 'text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                  }`}
                  style={current === item.key ? {
                    background: `linear-gradient(135deg, ${item.color.replace('from-', '').replace(' to-', ', ')})`,
                  } : {}}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="mr-3">
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* 教师控制台 - 移动端 */}
              {(session?.user?.role === 'TEACHER' || session?.user?.role === 'ADMIN') && (
                <Link 
                  href="/teacher"
                  className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    current === 'teacher'
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  教师控制台
                </Link>
              )}

              {/* 用户信息 - 移动端 */}
              {session && (
                <div className="pt-3 border-t border-gray-200/50 mt-3">
                  <div className="flex items-center px-4 py-3 bg-gray-100/50 rounded-xl mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold">
                        {session.user.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{session.user.name}</div>
                      <div className="text-gray-500 text-sm">在线</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut({ callbackUrl: '/' })
                    }}
                    className="flex items-center w-full px-4 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-xl transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    退出登录
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