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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header currentPage="ask" />

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* 页面标题和描述 */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
            <h2 className="text-3xl font-bold mb-2">AI 智能问答</h2>
            <p className="text-blue-100">
              向我提问任何学习相关的问题，我会根据您的年级和学科提供个性化的解答
            </p>
          </div>

          {/* 聊天界面 */}
          <div className="h-[600px]">
            <ConversationProvider>
              <ChatWithSidebar />
            </ConversationProvider>
          </div>
        </div>

        {/* 使用提示 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="ml-3 font-semibold text-gray-900">选择学科年级</h3>
            </div>
            <p className="text-gray-600 text-sm">
              先选择合适的学科和年级，这样我能提供更精准的解答
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="ml-3 font-semibold text-gray-900">提出问题</h3>
            </div>
            <p className="text-gray-600 text-sm">
              输入您的问题，支持数学公式和复杂概念的询问
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="ml-3 font-semibold text-gray-900">获得解答</h3>
            </div>
            <p className="text-gray-600 text-sm">
              AI 会实时流式回答，提供详细的解释和步骤
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
