'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import SimpleMathRenderer from './SimpleMathRenderer'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  status?: 'pending' | 'streaming' | 'completed' | 'error'
}

interface MessageBubbleProps {
  message: Message
  onRegenerate?: () => void
  onRetry?: () => void
}

export default function MessageBubble({ message, onRegenerate, onRetry }: MessageBubbleProps) {
  const [isCopying, setIsCopying] = useState(false)

  // 复制消息内容
  const handleCopy = async () => {
    if (isCopying) return

    setIsCopying(true)
    try {
      await navigator.clipboard.writeText(message.content)
      toast.success('已复制到剪贴板')
    } catch (error) {
      console.error('复制失败:', error)
      toast.error('复制失败')
    } finally {
      setTimeout(() => setIsCopying(false), 1000)
    }
  }

  // 渲染数学公式
  const renderMathContent = (content: string) => {
    return content
      .replace(/\$\$(.*?)\$\$/g, '<div class="math-block my-2 p-2 bg-gray-50 rounded font-mono text-center">$1</div>')
      .replace(/\$(.*?)\$/g, '<span class="math-inline font-mono bg-gray-100 px-1 rounded">$1</span>')
  }

  // 获取状态指示器
  const getStatusIndicator = () => {
    switch (message.status) {
      case 'pending':
        return (
          <div className="flex items-center space-x-1 text-gray-400">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-xs">思考中...</span>
          </div>
        )
      case 'streaming':
        return (
          <div className="flex items-center space-x-1 text-blue-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs">正在输入...</span>
          </div>
        )
      case 'error':
        return (
          <div className="flex items-center space-x-1 text-red-500">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs">发送失败</span>
          </div>
        )
      case 'completed':
        return (
          <div className="flex items-center space-x-1 text-green-500">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs">已完成</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 shadow-sm ${
          message.role === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-white border border-gray-200 text-gray-800'
        }`}
      >
        {/* 消息内容 */}
        <SimpleMathRenderer 
          content={message.content}
          className="whitespace-pre-wrap break-words message-math"
        />

        {/* 底部信息栏 */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-opacity-20 border-gray-300">
          <div className="flex items-center space-x-2">
            {/* 时间戳 */}
            <span className={`text-xs opacity-70 ${
              message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {message.timestamp.toLocaleTimeString()}
            </span>

            {/* 状态指示器 */}
            {getStatusIndicator()}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* 复制按钮 */}
            <button
              onClick={handleCopy}
              disabled={isCopying}
              className={`p-1 rounded hover:bg-opacity-20 hover:bg-gray-500 transition-colors ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}
              title="复制内容"
              aria-label="复制消息内容"
            >
              {isCopying ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>

            {/* AI 消息的重新生成按钮 */}
            {message.role === 'assistant' && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1 rounded hover:bg-opacity-20 hover:bg-gray-500 transition-colors text-gray-500"
                title="重新生成回答"
                aria-label="重新生成此回答"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}

            {/* 错误状态的重试按钮 */}
            {message.status === 'error' && onRetry && (
              <button
                onClick={onRetry}
                className="p-1 rounded hover:bg-opacity-20 hover:bg-gray-500 transition-colors text-red-500"
                title="重试发送"
                aria-label="重试发送此消息"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

