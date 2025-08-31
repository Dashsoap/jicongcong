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
    <div className="min-h-screen bg-gradient-primary">
      <Header currentPage="home" />

      {/* 主要内容 */}
      <main className="relative overflow-hidden">
        {/* 科技背景效果 */}
        <div className="absolute inset-0 overflow-hidden">
          {/* 动态几何背景 */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl animate-float"></div>
            <div className="absolute top-32 right-16 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
          </div>
          
          {/* 网格背景 */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>

        {/* 摸底考试引导横幅 */}
        {session && showPlacementBanner && (
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-gradient-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                    <div className="text-2xl animate-bounce">🚀</div>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">开启你的个性化学习之旅</h3>
                    <p className="text-white/90">通过5分钟智能摸底考试，AI将为你定制专属学习方案</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowPlacementBanner(false)}
                    className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <Link
                    href="/placement-test"
                    className="bg-white text-orange-600 px-6 py-3 rounded-2xl font-bold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  >
                    立即开始
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="relative z-10 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* 左侧内容 */}
              <div className="space-y-8 animate-slide-up">
                <div className="inline-flex items-center px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/20 shadow-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">AI智能学习助手</span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                  <span className="block text-gray-900">AI驱动的</span>
                  <span className="block text-gradient bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                    个性化学习
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  基于先进的自适应算法和个性化推荐系统，为每位学生量身定制最优学习路径。
                  让AI成为你的专属学习伙伴，开启智能教育新时代。
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/placement-test"
                    className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-2xl hover:shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-2 transition-all duration-300 border border-white/20"
                  >
                    <div className="absolute inset-0 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors"></div>
                    <span className="relative flex items-center">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      开始智能评估
                    </span>
                  </Link>
                  
                  <button className="group relative inline-flex items-center justify-center px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 font-semibold text-lg rounded-2xl hover:bg-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-200/50">
                    <span className="flex items-center">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-10V3m0 18v-5" />
                      </svg>
                      了解更多
                    </span>
                  </button>
                </div>
                
                {/* 数据统计 */}
                <div className="grid grid-cols-3 gap-6 pt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">10k+</div>
                    <div className="text-sm text-gray-600">活跃用户</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">95%</div>
                    <div className="text-sm text-gray-600">满意度</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600">24/7</div>
                    <div className="text-sm text-gray-600">AI助教</div>
                  </div>
                </div>
              </div>
              
              {/* 右侧3D效果区域 */}
              <div className="relative lg:pl-8">
                <div className="relative">
                  {/* 主卡片 */}
                  <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364-.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">AI学习助手</h3>
                        <p className="text-gray-600 text-sm">智能分析 · 个性推荐</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl">
                        <span className="text-gray-700 font-medium">数学能力</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{width: '85%'}}></div>
                          </div>
                          <span className="text-blue-600 font-bold text-sm">85%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl">
                        <span className="text-gray-700 font-medium">学习进度</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full" style={{width: '72%'}}></div>
                          </div>
                          <span className="text-emerald-600 font-bold text-sm">72%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl">
                        <span className="text-gray-700 font-medium">掌握程度</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{width: '91%'}}></div>
                          </div>
                          <span className="text-purple-600 font-bold text-sm">91%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 浮动装饰元素 */}
                  <div className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl opacity-80 animate-pulse-glow"></div>
                  <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl opacity-70 animate-float"></div>
                  <div className="absolute top-1/2 -right-4 w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg opacity-60 animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
              </div>
            </div>
          </div>
        </section>
          
        {/* 核心功能模块 */}
        <section className="relative z-10 py-24 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-200/50 mb-6">
                <span className="text-blue-600 font-semibold">核心功能</span>
              </div>
              <h2 className="text-5xl font-black text-gray-900 mb-6">
                四大智能模块
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                基于先进AI技术打造的智能学习生态系统，为每位学生提供个性化学习体验
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* 摸底考试 */}
              <Link href="/placement-test" className="group">
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3 overflow-hidden">
                  {/* 渐变背景 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* 图标 */}
                  <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">摸底考试</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      AI智能分析学习基础，生成详细的个性化能力评估报告
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                        开始评估
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                      <div className="text-blue-500/60 text-sm font-medium">θ算法</div>
                    </div>
                  </div>
                  
                  {/* 装饰元素 */}
                  <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                </div>
              </Link>

              {/* 母题系统 */}
              <Link href="/parent-items" className="group">
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3 overflow-hidden">
                  {/* 渐变背景 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* 图标 */}
                  <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">母题系统</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      精选核心题型，透明化推荐算法，针对薄弱点精准练习
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-emerald-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                        探索题库
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                      <div className="text-emerald-500/60 text-sm font-medium">智能推荐</div>
                    </div>
                  </div>
                  
                  {/* 装饰元素 */}
                  <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                </div>
              </Link>

              {/* AI问答 */}
              <Link href="/ask" className="group">
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3 overflow-hidden">
                  {/* 渐变背景 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* 图标 */}
                  <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">AI问答</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      24/7智能助教在线服务，实时答疑解惑，学习无障碍
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-purple-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                        开始对话
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                      <div className="text-purple-500/60 text-sm font-medium">实时对话</div>
                    </div>
                  </div>
                  
                  {/* 装饰元素 */}
                  <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                </div>
              </Link>

              {/* 智能练习 */}
              <Link href="/practice" className="group">
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3 overflow-hidden">
                  {/* 渐变背景 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* 图标 */}
                  <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">智能练习</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      ELO自适应算法，动态调整难度，精准推荐练习题目
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-orange-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                        开始练习
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                      <div className="text-orange-500/60 text-sm font-medium">ELO算法</div>
                    </div>
                  </div>
                  
                  {/* 装饰元素 */}
                  <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* 为什么选择岭鹿AI */}
        <section className="relative z-10 py-24 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-full border border-emerald-200/50 mb-6">
                <span className="text-emerald-600 font-semibold">技术优势</span>
              </div>
              <h2 className="text-5xl font-black text-gray-900 mb-6">为什么选择岭鹿AI</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                先进的AI技术驱动，为每位学生打造专属的个性化学习体验
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* 精准诊断 */}
              <div className="group text-center">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full group-hover:animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">精准诊断</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  通过θ值计算和概念掌握度分析，精确识别学习薄弱点，为后续学习提供科学依据
                </p>
              </div>
              
              {/* 自适应学习 */}
              <div className="group text-center">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full group-hover:animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">自适应学习</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  基于ELO算法的智能推荐系统，动态调整学习难度和内容，确保最佳学习效果
                </p>
              </div>
              
              {/* 可视化分析 */}
              <div className="group text-center">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full group-hover:animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">可视化分析</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  详细的学习报告和进步追踪图表，让学习成果和改进方向一目了然
                </p>
              </div>
            </div>
            
            {/* 特色数据展示 */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-black text-blue-600 mb-2">AI</div>
                <div className="text-gray-600 font-medium">智能算法</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-emerald-600 mb-2">θ</div>
                <div className="text-gray-600 font-medium">能力评估</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-purple-600 mb-2">ELO</div>
                <div className="text-gray-600 font-medium">自适应匹配</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-orange-600 mb-2">24/7</div>
                <div className="text-gray-600 font-medium">在线服务</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white py-20 overflow-hidden">
          {/* 科技背景效果 */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-20 right-20 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {/* 品牌信息 */}
              <div className="md:col-span-2">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-3xl font-black bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">岭鹿AI</span>
                    <div className="text-cyan-300 text-sm font-medium">智能学习平台</div>
                  </div>
                </div>
                <p className="text-gray-300 mb-8 leading-relaxed text-lg max-w-md">
                  致力于用AI技术革新教育，为每位学生提供个性化的学习体验，开启智能教育新时代。
                </p>
                <div className="flex space-x-4">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                    <svg className="w-6 h-6 text-cyan-300 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </div>
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                    <svg className="w-6 h-6 text-cyan-300 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </div>
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                    <svg className="w-6 h-6 text-cyan-300 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 产品功能 */}
              <div>
                <h3 className="text-xl font-bold mb-6 text-cyan-300">产品功能</h3>
                <ul className="space-y-3">
                  <li><Link href="/placement-test" className="text-gray-300 hover:text-cyan-300 transition-colors flex items-center group">
                    <svg className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    摸底考试
                  </Link></li>
                  <li><Link href="/parent-items" className="text-gray-300 hover:text-cyan-300 transition-colors flex items-center group">
                    <svg className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    母题系统
                  </Link></li>
                  <li><Link href="/ask" className="text-gray-300 hover:text-cyan-300 transition-colors flex items-center group">
                    <svg className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    AI问答
                  </Link></li>
                  <li><Link href="/practice" className="text-gray-300 hover:text-cyan-300 transition-colors flex items-center group">
                    <svg className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    智能练习
                  </Link></li>
                </ul>
              </div>

              {/* 联系我们 */}
              <div>
                <h3 className="text-xl font-bold mb-6 text-cyan-300">联系我们</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 mr-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    400-888-0123
                  </div>
                  <div className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 mr-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    support@linglu-ai.com
                  </div>
                  <div className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 mr-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    北京市海淀区中关村
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 mt-16 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400 text-center md:text-left">
                  &copy; 2024 岭鹿AI智能学习平台. 保留所有权利.
                </p>
                <div className="flex items-center mt-4 md:mt-0 space-x-6">
                  <Link href="#" className="text-gray-400 hover:text-cyan-300 transition-colors text-sm">隐私政策</Link>
                  <Link href="#" className="text-gray-400 hover:text-cyan-300 transition-colors text-sm">服务条款</Link>
                  <Link href="#" className="text-gray-400 hover:text-cyan-300 transition-colors text-sm">帮助中心</Link>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* 演示账号 - 仅未登录用户显示 */}
        {!session && (
          <div className="fixed bottom-6 right-6 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 max-w-sm animate-slide-up z-50">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">快速体验</h4>
                <p className="text-xs text-gray-500">立即试用无需注册</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-blue-700 font-semibold text-sm">学生账号</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="text-xs">
                  <span className="text-gray-600">用户名：</span>
                  <span className="text-blue-600 font-mono font-semibold">demo</span>
                </div>
                <div className="text-xs">
                  <span className="text-gray-600">密码：</span>
                  <span className="text-blue-600 font-mono font-semibold">password</span>
                </div>
              </div>
              
              <div className="bg-purple-50/50 rounded-2xl p-3 border border-purple-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-purple-700 font-semibold text-sm">教师账号</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="text-xs">
                  <span className="text-gray-600">用户名：</span>
                  <span className="text-purple-600 font-mono font-semibold">teacher</span>
                </div>
                <div className="text-xs">
                  <span className="text-gray-600">密码：</span>
                  <span className="text-purple-600 font-mono font-semibold">teacher123</span>
                </div>
              </div>
            </div>
            
            <Link
              href="/login"
              className="block w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-3 rounded-2xl font-semibold text-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
            >
              立即登录体验
            </Link>
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
