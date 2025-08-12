import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/authz'
import { prisma } from '@/lib/prisma'

// 删除对话
export async function DELETE(
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
    
    // 删除对话及其所有消息（级联删除）
    await prisma.conversation.delete({
      where: {
        id: conversationId
      }
    })
    
    console.log(`[Conversations API] 用户 ${user.name} 删除了对话: ${conversationId}`)
    
    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        path: `/api/conversations/${conversationId}`,
        action: 'DELETE_CONVERSATION',
        detail: JSON.stringify({ conversationId })
      }
    }).catch(console.error)
    
    return Response.json({
      ok: true,
      data: {
        message: '对话删除成功'
      }
    })
    
  } catch (error: any) {
    console.error('[Conversations API] 删除对话失败:', error)
    
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
      message: '删除对话失败'
    }, { status: 500 })
  }
}
