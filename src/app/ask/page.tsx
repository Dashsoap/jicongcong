'use client'

import { useSession, signOut } from 'next-auth/react'
import { Suspense } from 'react'
import Chat from '@/components/Chat'
import ConversationList from '@/components/ConversationList'
import { ConversationProvider, useConversation } from '@/components/ConversationContext'

function ChatWithSidebar() {
  const { conversationId, setConversationId } = useConversation()

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
  const appName = process.env.NEXT_PUBLIC_APP_NAME || '岭鹿AI'

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
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          {/* 移动端布局 */}
          <div className="flex flex-col space-y-3 sm:hidden">
            {/* 第一行：应用名称和用户信息 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-gray-900">{appName}</h1>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  问答
                </span>
              </div>
              
              {/* 移动端用户信息 */}
              {session && (
                <div className="flex items-center space-x-2">
                  <div className="text-xs">
                    <span className="text-gray-500">欢迎，</span>
                    <span className="font-medium text-gray-900">{session.user.name}</span>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    退出
                  </button>
                </div>
              )}
            </div>
            
            {/* 第二行：导航菜单 */}
            <nav className="flex space-x-6 border-t pt-3">
              <a 
                href="/ask" 
                className="px-3 py-2 text-blue-600 font-medium border-b-2 border-blue-600 text-sm"
              >
                问答
              </a>
              <a 
                href="/practice" 
                className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                练习
              </a>
            </nav>
          </div>

          {/* 桌面端布局 */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">{appName}</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                AI 问答助手
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* 导航菜单 */}
              <nav className="flex space-x-4">
                <a 
                  href="/ask" 
                  className="px-3 py-2 text-blue-600 font-medium border-b-2 border-blue-600"
                >
                  问答
                </a>
                <a 
                  href="/practice" 
                  className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  练习
                </a>
              </nav>

              {/* 用户信息 */}
              {session && (
                <div className="flex items-center space-x-3">
                  <div className="text-sm">
                    <span className="text-gray-500">欢迎，</span>
                    <span className="font-medium text-gray-900">{session.user.name}</span>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    退出
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

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
