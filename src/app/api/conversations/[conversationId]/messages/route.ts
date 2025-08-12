import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/authz'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  try {
    // 验证认证
    const user = await requireAuth()
    
    const params = await context.params
    const conversationId = params.conversationId
    
    // 验证对话是否属于当前用户
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: user.id
      }
    })
    
    if (!conversation) {
      return Response.json({
        ok: false,
        code: 'CONVERSATION_NOT_FOUND',
        message: '对话不存在或无权访问'
      }, { status: 404 })
    }
    
    // 获取对话消息
    const messages = await prisma.message.findMany({
      where: {
        conversationId
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
    
    const messagesData = messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      meta: msg.meta ? JSON.parse(msg.meta) : null,
      createdAt: msg.createdAt.toISOString()
    }))
    
    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        path: `/api/conversations/${conversationId}/messages`,
        action: 'GET_CONVERSATION_MESSAGES',
        detail: JSON.stringify({ conversationId, messageCount: messagesData.length })
      }
    }).catch(console.error)
    
    return Response.json({
      ok: true,
      data: {
        messages: messagesData,
        conversation: {
          id: conversation.id,
          subject: conversation.subject,
          grade: conversation.grade,
          createdAt: conversation.createdAt.toISOString()
        }
      }
    })
    
  } catch (error: any) {
    console.error('[Conversation Messages API] 错误:', error)
    
    if (error.message === 'UNAUTHORIZED') {
      return Response.json({
        ok: false,
        code: 'UNAUTHORIZED',
        message: '请先登录'
      }, { status: 401 })
    }
    
    return Response.json({
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '获取对话消息失败'
    }, { status: 500 })
  }
}
