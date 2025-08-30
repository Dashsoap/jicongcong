'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Suspense, useEffect } from 'react'
import Header from '@/components/Header'

function HomeContent() {
  const { data: session, status } = useSession()

  useEffect(() => {
    document.title = '首页 | 岭鹿AI'
  }, [])

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
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
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
