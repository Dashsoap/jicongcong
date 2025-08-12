import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/authz'
import { getWeakConcepts } from '@/lib/elo'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 验证认证
    const user = await requireAuth()
    
    // 获取用户的薄弱概念
    const weakConcepts = await getWeakConcepts(user.id, 10)
    
    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        path: '/api/mastery/me',
        action: 'GET_MASTERY',
        detail: JSON.stringify({ conceptCount: weakConcepts.length })
      }
    }).catch(console.error)
    
    return Response.json({
      ok: true,
      data: {
        weakConcepts: weakConcepts.map(item => ({
          conceptId: item.conceptId,
          subject: item.concept.subject,
          name: item.concept.name,
          grade: item.concept.grade,
          weight: item.concept.weight,
          theta: item.theta,
          weightedScore: item.weightedScore
        }))
      }
    })
    
  } catch (error: any) {
    console.error('[Mastery API] 错误:', error)
    
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
      message: '获取掌握度数据失败'
    }, { status: 500 })
  }
}

