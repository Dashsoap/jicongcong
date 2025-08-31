'use client'

import { useSession, signOut } from 'next-auth/react'
import { Suspense, useEffect } from 'react'
import Chat from '@/components/Chat'
import ConversationList from '@/components/ConversationList'
import { ConversationProvider, useConversation } from '@/components/ConversationContext'
import Header from '@/components/Header'

function ChatWithSidebar() {
  const { conversationId, setConversationId } = useConversation()

  useEffect(() => {
    document.title = 'AI对话 | 岭鹿AI'
  }, [])

  return (
    <div className="h-full flex">
      {/* 对话列表侧边栏 */}
      <div className="w-64 border-r border-gray-200 bg-gray-50">
        <ConversationList 
          onSelectConversation={setConversationId}
          selectedConversationId={conversationId || undefined}
        />
      </div>
      {/* 主聊天区域 */}
      <div className="flex-1">
        <Chat conversationId={conversationId} />
      </div>
    </div>
  )
}

function AskPageContent() {
  const { data: session, status } = useSession()

  useEffect(() => {
    document.title = 'AI对话 | 岭鹿AI'
  }, [])

  // 显示加载状态
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
    <div className="min-h-screen bg-gradient-primary relative overflow-hidden">
      {/* 科技感背景效果 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-32 left-1/3 w-72 h-72 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>
      
      <Header currentPage="ask" />

      {/* 主要内容 */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-dark border border-white/20 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
          {/* 页面标题和描述 */}
          <div className="bg-gradient-to-r from-cyan-500/90 to-blue-600/90 backdrop-blur-sm text-white p-8">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-6 animate-pulse-glow">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-black mb-2">AI 智能问答</h2>
                <p className="text-white/90">
                  24/7智能助教，向我提问任何学习相关的问题，我会根据您的年级和学科提供个性化的解答
                </p>
              </div>
            </div>
          </div>

          {/* 聊天界面 */}
          <div className="h-[600px]">
            <ConversationProvider>
              <ChatWithSidebar />
            </ConversationProvider>
          </div>
        </div>

        {/* 使用提示 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-slide-up">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h3 className="ml-4 font-bold text-gray-900">选择学科年级</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              先选择合适的学科和年级，这样AI能够提供更加精准和个性化的解答
            </p>
          </div>

          <div className="group bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-slide-up" style={{animationDelay: '150ms'}}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h3 className="ml-4 font-bold text-gray-900">提出问题</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              输入您的问题，支持数学公式和复杂概念的询问，AI会实时理解并回答
            </p>
          </div>

          <div className="group bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-slide-up" style={{animationDelay: '300ms'}}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <h3 className="ml-4 font-bold text-gray-900">获得解答</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              AI会实时流式回答，提供详细的解释和步骤，帮助您深入理解
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AskPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <AskPageContent />
    </Suspense>
  )
}
