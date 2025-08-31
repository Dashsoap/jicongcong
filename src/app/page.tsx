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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header currentPage="home" />

      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 摸底考试引导横幅 */}
        {session && showPlacementBanner && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">开始您的学习之旅</h3>
                  <p className="text-blue-100">
                    为了给您推荐最合适的学习内容，我们建议您先完成数学摸底考试
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPlacementBanner(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <Link
                  href="/placement-test"
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  开始摸底考试
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            岭鹿AI
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            智能家教系统 - 个性化学习，智能辅导
          </p>
          
          {session ? (
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/placement-test"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg"
              >
                🎯 摸底考试
              </Link>
              <Link
                href="/ask"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                💬 AI 问答
              </Link>
              <Link
                href="/practice"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                📚 智能练习
              </Link>
              <Link
                href="/parent-items"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                🎯 母题系统
              </Link>
            </div>
          ) : (
            <div className="mt-10">
              <Link
                href="/login"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                立即开始学习
              </Link>
            </div>
          )}
        </div>

        {/* 功能介绍 */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI 问答</h3>
            <p className="text-gray-600">
              与AI老师实时对话，获得个性化的学习指导和答疑解惑
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">智能练习</h3>
            <p className="text-gray-600">
              基于ELO算法的自适应练习系统，根据你的能力水平推荐合适的题目
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">摸底考试</h3>
            <p className="text-gray-600">
              智能摸底考试，精准评估您的数学基础，为个性化学习提供依据
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">母题系统</h3>
            <p className="text-gray-600">
              500道高频母题精准推荐，基于知识点权重的个性化训练
            </p>
          </div>
        </div>

        {!session && (
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">演示账号</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">学生账号：</p>
                <p className="text-gray-600">用户名：demo</p>
                <p className="text-gray-600">密码：password</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">教师账号：</p>
                <p className="text-gray-600">用户名：teacher</p>
                <p className="text-gray-600">密码：teacher123</p>
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
