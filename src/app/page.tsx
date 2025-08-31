'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import Header from '@/components/Header'

function HomeContent() {
  const { data: session, status } = useSession()
  const [showPlacementBanner, setShowPlacementBanner] = useState(false)
  const [checkingPlacement, setCheckingPlacement] = useState(false)

  useEffect(() => {
    document.title = '首页 | 岭鹿AI'
  }, [])

  // 检查用户是否需要摸底考试
  useEffect(() => {
    if (session?.user) {
      checkPlacementStatus()
    }
  }, [session])

  const checkPlacementStatus = async () => {
    try {
      setCheckingPlacement(true)
      const response = await fetch('/api/placement-test')
      
      if (response.status === 400) {
        // 用户已完成摸底考试
        setShowPlacementBanner(false)
      } else if (response.ok) {
        // 用户需要摸底考试
        setShowPlacementBanner(true)
      }
    } catch (error) {
      console.error('检查摸底考试状态失败:', error)
    } finally {
      setCheckingPlacement(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* 科技背景效果 */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        {/* 科技网格背景 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>
      
      <Header currentPage="home" />

      {/* 主要内容 */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 摸底考试引导横幅 */}
        {session && showPlacementBanner && (
          <div className="relative bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-3xl shadow-2xl p-6 mb-12 text-white border border-cyan-400/20 backdrop-blur-sm">
            <div className="absolute inset-0 bg-white/5 rounded-3xl"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-sm">
                    <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold mb-1">开启智能学习之旅</h3>
                  <p className="text-cyan-100 leading-relaxed">
                    AI驱动的个性化摸底测试，精准定位您的知识水平，开启专属学习路径
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPlacementBanner(false)}
                  className="text-white/60 hover:text-white transition-colors p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <Link
                  href="/placement-test"
                  className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                >
                  立即开始测试
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <div className="relative">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-6">
              岭鹿AI
            </h1>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full blur-sm"></div>
          </div>
          <p className="mt-8 text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            下一代AI驱动的智能学习平台 · 个性化适应 · 精准诊断 · 智能推荐
          </p>
          
          <div className="mt-6 flex justify-center space-x-8 text-sm text-gray-400">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></div>
              <span>AI智能分析</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
              <span>自适应学习</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
              <span>精准推荐</span>
            </div>
          </div>
          
          {session ? (
            <div className="mt-16">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <Link
                  href="/placement-test"
                  className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 text-white hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 border border-cyan-400/20"
                >
                  <div className="absolute inset-0 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-lg mb-2">摸底考试</h3>
                    <p className="text-cyan-100 text-sm">AI精准评估</p>
                  </div>
                </Link>
                
                <Link
                  href="/ask"
                  className="group relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 border border-blue-400/20"
                >
                  <div className="absolute inset-0 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-lg mb-2">AI问答</h3>
                    <p className="text-blue-100 text-sm">智能对话</p>
                  </div>
                </Link>
                
                <Link
                  href="/practice"
                  className="group relative bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 border border-purple-400/20"
                >
                  <div className="absolute inset-0 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-lg mb-2">智能练习</h3>
                    <p className="text-purple-100 text-sm">自适应训练</p>
                  </div>
                </Link>
                
                <Link
                  href="/parent-items"
                  className="group relative bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1 border border-emerald-400/20"
                >
                  <div className="absolute inset-0 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-lg mb-2">母题系统</h3>
                    <p className="text-emerald-100 text-sm">精准推荐</p>
                  </div>
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-16">
              <Link
                href="/login"
                className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 border border-cyan-400/20"
              >
                <div className="absolute inset-0 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors"></div>
                <span className="relative">立即开始学习</span>
              </Link>
            </div>
          )}
        </div>

        {/* 功能特性 */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">核心技术特性</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">基于先进AI算法，提供全方位智能学习解决方案</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-800/70 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI智能问答</h3>
              <p className="text-gray-400 leading-relaxed">
                自然语言理解，个性化答疑解惑，24/7智能助教服务
              </p>
            </div>
            
            <div className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-800/70 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">自适应练习</h3>
              <p className="text-gray-400 leading-relaxed">
                ELO算法驱动，动态调整难度，最优化学习路径规划
              </p>
            </div>
            
            <div className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-800/70 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">智能评估</h3>
              <p className="text-gray-400 leading-relaxed">
                多维度能力分析，精准定位知识薄弱点，个性化诊断报告
              </p>
            </div>
            
            <div className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-800/70 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">精准推荐</h3>
              <p className="text-gray-400 leading-relaxed">
                500+核心母题智能推荐，知识点权重映射，高效提升
              </p>
            </div>
          </div>
        </div>

        {!session && (
          <div className="mt-20 relative bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-3xl"></div>
            <div className="relative">
              <h3 className="text-2xl font-semibold text-white mb-6 text-center">体验演示账号</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700/30 rounded-2xl p-6 border border-gray-600/30">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-white text-lg">学生账号</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">用户名:</span>
                      <span className="text-cyan-400 font-mono">demo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">密码:</span>
                      <span className="text-cyan-400 font-mono">password</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700/30 rounded-2xl p-6 border border-gray-600/30">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-white text-lg">教师账号</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">用户名:</span>
                      <span className="text-purple-400 font-mono">teacher</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">密码:</span>
                      <span className="text-purple-400 font-mono">teacher123</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
