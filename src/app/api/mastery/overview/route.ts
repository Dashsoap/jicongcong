import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/authz'
import { prisma } from '@/lib/prisma'
import { getUserMasteryOverview } from '@/lib/elo-precise'

// 获取用户掌握度概览API
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const subject = searchParams.get('subject') || '数学'
    
    console.log(`[掌握度概览] 用户 ${user.name} 请求 ${subject} 掌握度概览`)

    // 获取总体掌握情况
    const overview = await getUserMasteryOverview(user.id, subject)
    
    // 获取最近的答题记录
    const recentAttempts = await prisma.attempt.findMany({
      where: {
        userId: user.id,
        Item: {
          Concept: { subject }
        }
      },
      include: {
        Item: {
          include: {
            Concept: true,
            ParentItem: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // 获取母题相关的掌握度统计
    const parentItemStats = await prisma.parentItem.findMany({
      where: { subject },
      include: {
        mappings: {
          include: {
            Concept: {
              include: {
                mastery: {
                  where: { userId: user.id }
                }
              }
            }
          }
        }
      }
    })

    // 计算母题掌握度分布
    const parentItemMastery = parentItemStats.map(parentItem => {
      const relatedMasteries = parentItem.mappings
        .map(m => m.Concept.mastery[0])
        .filter(Boolean)
      
      const weightedTheta = relatedMasteries.length > 0
        ? parentItem.mappings.reduce((sum, mapping) => {
            const mastery = mapping.Concept.mastery[0]
            return sum + (mastery ? mastery.theta * mapping.knowledgeWeight : 0)
          }, 0) / parentItem.mappings.reduce((sum, m) => sum + m.knowledgeWeight, 0)
        : 0
      
      const totalAttempts = relatedMasteries.reduce((sum, m) => sum + m.attempts, 0)
      const totalCorrect = relatedMasteries.reduce((sum, m) => sum + m.correct, 0)

      return {
        parentItem: {
          id: parentItem.id,
          code: parentItem.code,
          title: parentItem.title,
          priority: parentItem.priority
        },
        weightedTheta,
        totalAttempts,
        accuracy: totalAttempts > 0 ? totalCorrect / totalAttempts : 0,
        status: weightedTheta > 50 ? 'strong' : 
                weightedTheta > 0 ? 'medium' : 
                weightedTheta > -50 ? 'weak' : 'very_weak'
      }
    })

    // 按掌握度排序
    parentItemMastery.sort((a, b) => a.weightedTheta - b.weightedTheta)

    const result = {
      overview,
      recentActivity: {
        totalAttempts: recentAttempts.length,
        recentAttempts: recentAttempts.map(attempt => ({
          id: attempt.id,
          itemId: attempt.itemId,
          correct: attempt.correct,
          timeMs: attempt.timeMs,
          createdAt: attempt.createdAt,
          concept: attempt.Item.Concept.name,
          parentItem: attempt.Item.ParentItem ? {
            code: attempt.Item.ParentItem.code,
            title: attempt.Item.ParentItem.title
          } : null
        }))
      },
      parentItemMastery: {
        total: parentItemMastery.length,
        strong: parentItemMastery.filter(p => p.status === 'strong').length,
        medium: parentItemMastery.filter(p => p.status === 'medium').length,
        weak: parentItemMastery.filter(p => p.status === 'weak').length,
        veryWeak: parentItemMastery.filter(p => p.status === 'very_weak').length,
        items: parentItemMastery
      },
      subject
    }

    console.log(`[掌握度概览] 返回概览数据: 总概念${overview.totalConcepts}, 母题${parentItemMastery.length}道`)

    return Response.json({
      ok: true,
      data: result
    })

  } catch (error) {
    console.error('[掌握度概览] 错误:', error)
    
    return Response.json({
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '获取掌握度概览失败',
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 })
  }
}