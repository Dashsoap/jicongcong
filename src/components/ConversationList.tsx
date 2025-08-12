'use client'

import React from 'react'
import { useConversation } from './ConversationContext'

interface ConversationListProps {
  onSelectConversation: (id: string | null) => void
  selectedConversationId?: string
}

export default function ConversationList({ onSelectConversation, selectedConversationId }: ConversationListProps) {
  const { conversations, createConversation, deleteConversation, isLoading } = useConversation()

  const handleNewConversation = async () => {
    try {
      const newId = await createConversation()
      onSelectConversation(newId)
    } catch (error) {
      // 错误已在createConversation中处理
      console.error('创建新对话失败:', error)
    }
  }

  const handleDeleteConversation = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    
    // 确认删除
    if (!window.confirm('确定要删除这个对话吗？此操作无法撤销。')) {
      return
    }
    
    try {
      await deleteConversation(id)
    } catch (error) {
      console.error('删除对话失败:', error)
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={handleNewConversation}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '创建中...' : '+ 新对话'}
        </button>
      </div>

      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            暂无对话历史
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConversationId === conversation.id
                    ? 'bg-blue-100 text-blue-900'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="pr-8">
                  <div className="font-medium text-sm truncate">
                    {conversation.title}
                  </div>
                  {conversation.lastMessage && (
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      {conversation.lastMessage}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {conversation.updatedAt.toLocaleDateString()}
                  </div>
                </div>
                
                {/* 删除按钮 */}
                <button
                  onClick={(e) => handleDeleteConversation(conversation.id, e)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}