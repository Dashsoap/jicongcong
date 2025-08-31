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
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="home" />

      {/* 主要内容 */}
      <main>
        {/* 摸底考试引导横幅 */}
        {session && showPlacementBanner && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">开启你的个性化学习之旅</h3>
                  <p className="text-sm text-gray-600">通过5分钟摸底考试，AI将为你定制专属学习方案</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowPlacementBanner(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <Link
                  href="/placement-test"
                  className="bg-orange-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-orange-600 transition-colors"
                >
                  立即开始
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* 左侧内容 */}
              <div className="space-y-8">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  AI驱动的<span className="text-blue-600">个性化学习</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  通过智能摸底考试和自适应练习，为每位学生量身定制最适合的学
                  习路径。让AI成为你的专属学习伙伴。
                </p>
                <div className="flex space-x-4">
                  <Link
                    href="/placement-test"
                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    开始摸底考试
                  </Link>
                  <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-50 transition-colors">
                    了解更多
                  </button>
                </div>
              </div>
              
              {/* 右侧图片 */}
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-8 h-96 flex items-center justify-center">
                  <div className="text-6xl">🎓</div>
                </div>
              </div>
            </div>
          </div>
        </section>
          
        {/* 核心功能模块 */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">核心功能模块</h2>
              <p className="text-xl text-gray-600">四大智能功能，全方位提升学习效果</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* 摸底考试 */}
              <Link href="/placement-test" className="group">
                <div className="bg-blue-50 rounded-3xl p-8 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">摸底考试</h3>
                  <p className="text-gray-600 mb-4">智能分析学习基础，生成个性化能力报告</p>
                  <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                    开始测试 <span className="ml-2">→</span>
                  </div>
                </div>
              </Link>

              {/* 母题系统 */}
              <Link href="/parent-items" className="group">
                <div className="bg-green-50 rounded-3xl p-8 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">母题系统</h3>
                  <p className="text-gray-600 mb-4">精选核心题型，透明推荐算法</p>
                  <div className="flex items-center text-green-600 font-medium group-hover:translate-x-1 transition-transform">
                    查看题库 <span className="ml-2">→</span>
                  </div>
                </div>
              </Link>

              {/* AI问答 */}
              <Link href="/ask" className="group">
                <div className="bg-purple-50 rounded-3xl p-8 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">AI问答</h3>
                  <p className="text-gray-600 mb-4">24/7智能助教，实时答疑解惑</p>
                  <div className="flex items-center text-purple-600 font-medium group-hover:translate-x-1 transition-transform">
                    开始对话 <span className="ml-2">→</span>
                  </div>
                </div>
              </Link>

              {/* 智能练习 */}
              <Link href="/practice" className="group">
                <div className="bg-orange-50 rounded-3xl p-8 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">智能练习</h3>
                  <p className="text-gray-600 mb-4">自适应算法，精准推荐练习题目</p>
                  <div className="flex items-center text-orange-600 font-medium group-hover:translate-x-1 transition-transform">
                    开始练习 <span className="ml-2">→</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* 为什么选择岭鹿AI */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">为什么选择岭鹿AI</h2>
              <p className="text-xl text-gray-600">先进的AI技术，个性化的学习体验</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* 精准诊断 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">精准诊断</h3>
                <p className="text-gray-600 leading-relaxed">
                  通过θ值计算和概念掌握度分析，精确识别学习薄弱点
                </p>
              </div>
              
              {/* 自适应学习 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">自适应学习</h3>
                <p className="text-gray-600 leading-relaxed">
                  基于ELO算法的智能推荐，动态调整学习难度和内容
                </p>
              </div>
              
              {/* 可视化分析 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">可视化分析</h3>
                <p className="text-gray-600 leading-relaxed">
                  详细的学习报告和进步追踪，让学习成果一目了然
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* 品牌信息 */}
              <div className="md:col-span-2">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold">岭鹿AI</span>
                </div>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  致力于用AI技术革新教育，为每位学生提供个性化的学习体验
                </p>
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </div>
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* 产品功能 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">产品功能</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/placement-test" className="hover:text-white transition-colors">摸底考试</Link></li>
                  <li><Link href="/parent-items" className="hover:text-white transition-colors">母题系统</Link></li>
                  <li><Link href="/ask" className="hover:text-white transition-colors">AI问答</Link></li>
                  <li><Link href="/practice" className="hover:text-white transition-colors">智能练习</Link></li>
                </ul>
              </div>

              {/* 联系我们 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">联系我们</h3>
                <div className="space-y-2 text-gray-400">
                  <p>客服热线：400-888-0123</p>
                  <p>邮箱：support@linglu-ai.com</p>
                  <p>地址：北京市海淀区中关村</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
              <p>&copy; 2024 岭鹿AI智能学习平台. 保留所有权利.</p>
            </div>
          </div>
        </footer>

        {/* 演示账号 - 仅未登录用户显示 */}
        {!session && (
          <div className="fixed bottom-4 right-4 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 max-w-xs">
            <h4 className="font-semibold text-gray-900 mb-3">快速体验</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">学生：</span>
                <span className="text-blue-600 font-mono">demo / password</span>
              </div>
              <div>
                <span className="text-gray-500">教师：</span>
                <span className="text-purple-600 font-mono">teacher / teacher123</span>
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
