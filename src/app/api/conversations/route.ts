import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/authz'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 验证认证
    const user = await requireAuth()
    
    // 获取用户的对话列表（最近10个）
    const conversations = await prisma.conversation.findMany({
      where: {
        userId: user.id
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          },
          take: 1 // 只取第一条消息用于预览
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })
    
    const conversationsData = conversations.map(conv => ({
      id: conv.id,
      subject: conv.subject,
      grade: conv.grade,
      createdAt: conv.createdAt.toISOString(),
      firstMessage: conv.messages[0]?.content || null
    }))
    
    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        path: '/api/conversations',
        action: 'GET_CONVERSATIONS',
        detail: JSON.stringify({ conversationCount: conversationsData.length })
      }
    }).catch(console.error)
    
    return Response.json({
      ok: true,
      data: {
        conversations: conversationsData
      }
    })
    
  } catch (error: any) {
    console.error('[Conversations API] 错误:', error)
    
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
      message: '获取对话列表失败'
    }, { status: 500 })
  }
}



