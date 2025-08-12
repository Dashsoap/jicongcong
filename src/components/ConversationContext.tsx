'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface Conversation {
  id: string
  title: string
  lastMessage?: string
  createdAt: Date
  updatedAt: Date
  subject?: string | null
  grade?: string | null
}

interface ConversationContextType {
  conversations: Conversation[]
  conversationId: string | null
  setConversationId: (id: string | null) => void
  createConversation: (title?: string) => Promise<string>
  updateConversationTitle: (id: string, title: string) => void
  updateConversationId: (tempId: string, realId: string) => void
  deleteConversation: (id: string) => Promise<void>
  loadConversations: () => Promise<void>
  isLoading: boolean
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined)

interface ConversationProviderProps {
  children: ReactNode
}

export function ConversationProvider({ children }: ConversationProviderProps) {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 加载对话列表
  const loadConversations = useCallback(async () => {
    if (!session?.user) return
    
    try {
      setIsLoading(true)
      const response = await fetch('/api/conversations')
      const data = await response.json()
      
      if (data.ok && data.data.conversations) {
        const loadedConversations: Conversation[] = data.data.conversations.map((conv: any) => ({
          id: conv.id,
          title: conv.firstMessage ? 
            (conv.firstMessage.length > 30 ? conv.firstMessage.substring(0, 30) + '...' : conv.firstMessage) :
            '新对话',
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.createdAt),
          lastMessage: conv.firstMessage,
          subject: conv.subject,
          grade: conv.grade
        }))
        setConversations(loadedConversations)
      }
    } catch (error) {
      console.error('加载对话列表失败:', error)
      toast.error('加载对话列表失败')
    } finally {
      setIsLoading(false)
    }
  }, [session?.user])

  // 初始加载对话列表
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const createConversation = useCallback(async (title = '新对话') => {
    if (!session?.user) {
      toast.error('请先登录')
      throw new Error('未登录')
    }

    // 生成临时对话ID，等用户发送第一条消息时会被Dify的conversationId替换
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newConversation: Conversation = {
      id: tempId,
      title: title,
      createdAt: new Date(),
      updatedAt: new Date(),
      subject: null,
      grade: null
    }
    
    setConversations(prev => [newConversation, ...prev])
    setConversationId(tempId)
    
    return tempId
  }, [session?.user])

  const updateConversationTitle = useCallback((id: string, title: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === id 
          ? { ...conv, title, updatedAt: new Date() }
          : conv
      )
    )
  }, [])

  const updateConversationId = useCallback((tempId: string, realId: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === tempId 
          ? { ...conv, id: realId, updatedAt: new Date() }
          : conv
      )
    )
    if (conversationId === tempId) {
      setConversationId(realId)
    }
  }, [conversationId])

  const deleteConversation = useCallback(async (id: string) => {
    if (!session?.user) {
      toast.error('请先登录')
      return
    }

    try {
      // 如果是临时对话，直接从前端删除
      if (id.startsWith('temp_')) {
        setConversations(prev => prev.filter(conv => conv.id !== id))
        if (conversationId === id) {
          setConversationId(null)
        }
        return
      }

      // 调用后端API删除真实对话
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()
      
      if (data.ok) {
        // 删除成功，从前端状态中移除
        setConversations(prev => prev.filter(conv => conv.id !== id))
        if (conversationId === id) {
          setConversationId(null)
        }
        toast.success('对话删除成功')
      } else {
        throw new Error(data.message || '删除对话失败')
      }
    } catch (error: any) {
      console.error('删除对话失败:', error)
      toast.error(error.message || '删除对话失败')
    }
  }, [session?.user, conversationId])

  const value: ConversationContextType = {
    conversations,
    conversationId,
    setConversationId,
    createConversation,
    updateConversationTitle,
    updateConversationId,
    deleteConversation,
    loadConversations,
    isLoading,
  }

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  )
}

export function useConversation() {
  const context = useContext(ConversationContext)
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider')
  }
  return context
}