'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
// import { createParser } from 'eventsource-parser'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import MessageBubble, { Message } from './MessageBubble'
import { fetchWithRetry } from '@/lib/fetcher'
import { useConversation } from './ConversationContext'

interface ChatProps {
  className?: string
  conversationId?: string | null
}

export default function Chat({ className = '', conversationId }: ChatProps) {
  const { data: session } = useSession()
  const { setConversationId, updateConversationId } = useConversation()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [subject, setSubject] = useState('数学')
  const [grade, setGrade] = useState('高一')
  const [isClient, setIsClient] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isComposing, setIsComposing] = useState(false) // 处理中文输入法
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // 智能滚动到底部（只在用户没有手动滚动时自动滚动）
  const scrollToBottom = useCallback((force = false) => {
    if (force || !isUserScrolling) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setShowScrollToBottom(false)
    }
  }, [isUserScrolling])

  // 检测用户是否在滚动
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

    setIsUserScrolling(!isNearBottom)
    setShowScrollToBottom(!isNearBottom && messages.length > 0)
  }, [messages.length])

  // 客户端挂载后从 localStorage 恢复设置
  useEffect(() => {
    setIsClient(true)
    
    const savedSubject = localStorage.getItem('tutorAI_subject')
    const savedGrade = localStorage.getItem('tutorAI_grade')
    
    // 验证保存的学科是否有效
    const validSubjects = ['数学', '语文', '英语', '物理', '化学', '生物', '政治', '历史', '地理']
    if (savedSubject && validSubjects.includes(savedSubject)) {
      setSubject(savedSubject)
    }
    // 验证保存的年级是否有效
    if (savedGrade && ['高一', '高二', '高三'].includes(savedGrade)) {
      setGrade(savedGrade)
    }
  }, [])

  // 持久化设置到 localStorage (只在客户端)
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('tutorAI_subject', subject)
    }
  }, [subject, isClient])

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('tutorAI_grade', grade)
    }
  }, [grade, isClient])

  // 消息变化时自动滚动
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // 自动聚焦输入框
  useEffect(() => {
    if (inputRef.current && !isStreaming) {
      inputRef.current.focus()
    }
  }, [isStreaming])

  // 当conversationId变化时加载历史消息
  useEffect(() => {
    if (conversationId && !conversationId.startsWith('temp_')) {
      loadConversationMessages(conversationId)
    } else {
      // 新对话或临时对话，清空消息
      setMessages([])
    }
  }, [conversationId])

  // 加载对话历史消息
  const loadConversationMessages = async (convId: string) => {
    try {
      const response = await fetch(`/api/conversations/${convId}/messages`)
      const data = await response.json()
      
      if (data.ok && data.data.messages) {
        const loadedMessages: Message[] = data.data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.createdAt),
          status: 'completed'
        }))
        setMessages(loadedMessages)
      }
    } catch (error) {
      console.error('加载对话历史失败:', error)
      toast.error('加载对话历史失败')
    }
  }

  // 发送消息（支持重试机制）
  const handleSend = useCallback(async (messageContent?: string, isRetry = false) => {
    const content = messageContent || input.trim()
    if (!content || isStreaming) return

    // 如果不是重试，添加用户消息并清空输入
    if (!isRetry) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
        status: 'completed'
      }

      setMessages(prev => [...prev, userMessage])
      setInput('')
    }

    setIsStreaming(true)
    setRetryCount(isRetry ? retryCount + 1 : 0)

    // 创建助手消息占位符
    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      status: 'pending'
    }

    setMessages(prev => [...prev, assistantMessage])

    try {
      // 更新消息状态为 streaming
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, status: 'streaming' }
          : msg
      ))

      // 使用带重试的 fetch
      const requestBody: any = {
        query: content,
        subject,
        grade,
      }
      
      // 只有在conversationId不为null且不是临时ID时才添加
      if (conversationId && !conversationId.startsWith('temp_')) {
        requestBody.conversationId = conversationId
      }
      
      const response = await fetchWithRetry('/api/qa/stream', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }, 3, 1000)

      if (!response.body) {
        throw new Error('响应体为空')
      }

      // 超时保护
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }
      }, 30000) // 30秒超时

      // 简化的SSE流处理
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let hasReceivedData = false

      // 读取流数据
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              hasReceivedData = true
              clearTimeout(timeoutId)
              
              const data = line.slice(6).trim()
              
              if (data === '[DONE]') {
                // 标记消息为完成状态
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, status: 'completed' }
                    : msg
                ))
                setIsStreaming(false)
                return
              }

              try {
                const parsed = JSON.parse(data)
                
                // 提取对话ID（如果是新对话）
                if (parsed.conversation_id) {
                  if (conversationId && conversationId.startsWith('temp_')) {
                    // 如果当前是临时ID，用真实ID替换
                    updateConversationId(conversationId, parsed.conversation_id)
                  } else if (!conversationId) {
                    // 如果没有conversationId，直接设置
                    setConversationId(parsed.conversation_id)
                  }
                }
                
                // 处理聊天应用的回答内容
                if (parsed.answer) {
                  // 更新助手消息内容
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: msg.content + parsed.answer, status: 'streaming' }
                      : msg
                  ))
                }
                
                // 检查是否是结束事件
                if (parsed.event === 'message_end' || parsed.event === 'workflow_finished') {
                  // 标记消息为完成状态
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, status: 'completed' }
                      : msg
                  ))
                  setIsStreaming(false)
                  clearTimeout(timeoutId)
                  return
                }
              } catch (e) {
                console.warn('解析 SSE 数据失败:', e)
              }
            }
          }
        }

        // 如果没有收到任何数据，标记为完成
        if (!hasReceivedData) {
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, status: 'completed' }
              : msg
          ))
        }
      } finally {
        clearTimeout(timeoutId)
      }

    } catch (error: any) {
      console.error('聊天请求失败:', error)
      
      let errorMessage = '抱歉，发生了一个错误。'
      let canRetry = false
      
      if (error.name === 'AbortError') {
        errorMessage = '请求已取消'
      } else if (error.status === 501) {
        errorMessage = '服务未配置，请联系管理员'
      } else if (error.status === 429) {
        errorMessage = '请求过于频繁，请稍后重试'
        canRetry = true
      } else if (error.status >= 500) {
        errorMessage = '服务器错误，请稍后重试'
        canRetry = true
      } else if (error.message) {
        errorMessage = error.message
        canRetry = retryCount < 3
      }

      // 更新助手消息为错误状态
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: errorMessage, status: 'error' }
          : msg
      ))

      // 显示错误通知
      toast.error('发送失败', {
        description: errorMessage,
        action: canRetry ? {
          label: '重试',
          onClick: () => handleSend(content, true)
        } : undefined,
      })
    } finally {
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }, [input, subject, grade, session?.user?.id, isStreaming, retryCount])

  // 处理键盘事件（支持中文输入法）
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // 中文输入法合成状态下不处理 Enter 键
    if (isComposing) return

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [isComposing, handleSend])

  // 处理中文输入法
  const handleCompositionStart = () => setIsComposing(true)
  const handleCompositionEnd = () => setIsComposing(false)

  // 停止当前请求
  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsStreaming(false)
      toast.info('已取消请求')
    }
  }, [])

  // 重新生成回答
  const handleRegenerate = useCallback((messageId: string) => {
    // 找到对应的用户消息
    const messageIndex = messages.findIndex(m => m.id === messageId)
    if (messageIndex === -1) return

    // 找到前一条用户消息
    const userMessageIndex = messageIndex - 1
    if (userMessageIndex < 0 || messages[userMessageIndex].role !== 'user') return

    const userMessage = messages[userMessageIndex]
    
    // 删除当前助手消息
    setMessages(prev => prev.filter(m => m.id !== messageId))
    
    // 重新发送
    handleSend(userMessage.content, false)
  }, [messages, handleSend])

  // 重试失败的消息
  const handleRetry = useCallback((messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (!message || message.role !== 'assistant') return

    // 删除失败的消息
    setMessages(prev => prev.filter(m => m.id !== messageId))
    
    // 找到对应的用户消息并重试
    const messageIndex = messages.findIndex(m => m.id === messageId)
    const userMessageIndex = messageIndex - 1
    if (userMessageIndex >= 0 && messages[userMessageIndex].role === 'user') {
      const userMessage = messages[userMessageIndex]
      handleSend(userMessage.content, true)
    }
  }, [messages, handleSend])

  return (
    <div className={`flex flex-col h-full max-w-4xl mx-auto ${className}`}>
      {/* 设置面板 */}
      <div className="flex gap-4 p-4 bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <label htmlFor="subject-select" className="text-sm font-medium">学科:</label>
          <select 
            id="subject-select"
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isStreaming}
          >
            <option value="数学">数学</option>
            <option value="语文">语文</option>
            <option value="英语">英语</option>
            <option value="物理">物理</option>
            <option value="化学">化学</option>
            <option value="生物">生物</option>
            <option value="政治">政治</option>
            <option value="历史">历史</option>
            <option value="地理">地理</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="grade-select" className="text-sm font-medium">年级:</label>
          <select 
            id="grade-select"
            value={grade} 
            onChange={(e) => setGrade(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isStreaming}
          >
            <option value="高一">高一</option>
            <option value="高二">高二</option>
            <option value="高三">高三</option>
          </select>
        </div>
        {isStreaming && (
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></span>
            <span className="text-sm text-green-600">正在回答...</span>
            <button 
              onClick={handleStop}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="停止生成回答"
            >
              停止
            </button>
          </div>
        )}
      </div>

      {/* 消息列表 */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="聊天消息列表"
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg font-medium mb-2">欢迎使用 AI 家教助手！</p>
            <p className="text-sm">请输入您的问题，我会根据您选择的学科和年级提供相应的解答。</p>
          </div>
        )}
        
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onRegenerate={() => handleRegenerate(message.id)}
            onRetry={() => handleRetry(message.id)}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 回到底部按钮 */}
      {showScrollToBottom && (
        <div className="absolute bottom-20 right-6">
          <button
            onClick={() => scrollToBottom(true)}
            className="p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="滚动到底部"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      )}

      {/* 输入区域 */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="输入您的问题... (按 Enter 发送，Shift+Enter 换行)"
            className="flex-1 px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            rows={1}
            disabled={isStreaming}
            aria-label="输入消息"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="发送消息"
          >
            {isStreaming ? '发送中...' : '发送'}
          </button>
        </div>
      </div>
    </div>
  )
}
