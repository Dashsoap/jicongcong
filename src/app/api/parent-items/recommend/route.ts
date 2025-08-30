import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/authz'
import { prisma } from '@/lib/prisma'
import { getWeakConcepts } from '@/lib/elo-precise'

// 母题推荐API
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { 
      subject = '数学', 
      grade = '高一', 
      limit = 5,
      mode = 'weak' // 'weak' | 'all' | 'strong'
    } = body

    console.log(`[母题推荐] 用户 ${user.name} 请求 ${subject} ${grade} 母题，模式: ${mode}`)

    // 获取用户薄弱概念
    const weakConcepts = await getWeakConcepts(user.id, subject, limit * 2)
    const weakConceptIds = weakConcepts.map(w => w.conceptId)

    let parentItems = []

    if (mode === 'weak' && weakConceptIds.length > 0) {
      // 基于薄弱概念推荐母题
      parentItems = await prisma.parentItem.findMany({
        where: {
          subject,
          grade,
          mappings: {
            some: {
              conceptId: {
                in: weakConceptIds
              }
            }
          }
        },
        include: {
          mappings: {
            include: {
              Concept: true,
              Skill: true
            }
          },
          variants: {
            take: 3, // 每个母题最多展示3个变式
            include: {
              Concept: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { difficulty: 'asc' }
        ],
        take: limit
      })
    } else {
      // 获取所有母题或强项母题
      const orderBy = mode === 'strong' 
        ? [{ difficulty: 'desc' as const }] 
        : [{ priority: 'desc' as const }, { difficulty: 'asc' as const }]
      
      parentItems = await prisma.parentItem.findMany({
        where: { subject, grade },
        include: {
          mappings: {
            include: {
              Concept: true,
              Skill: true
            }
          },
          variants: {
            take: 3,
            include: {
              Concept: true
            }
          }
        },
        orderBy,
        take: limit
      })
    }

    // 格式化返回数据
    const formattedItems = await Promise.all(
      parentItems.map(async (item) => {
        // 计算该母题关联概念的平均掌握度
        const conceptIds = item.mappings.map(m => m.conceptId)
        const masteries = await prisma.mastery.findMany({
          where: {
            userId: user.id,
            conceptId: { in: conceptIds }
          },
          include: { Concept: true }
        })

        const avgTheta = masteries.length > 0
          ? masteries.reduce((sum, m) => sum + m.theta, 0) / masteries.length
          : 0

        const totalAttempts = masteries.reduce((sum, m) => sum + m.attempts, 0)
        const totalCorrect = masteries.reduce((sum, m) => sum + m.correct, 0)
        const avgAccuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : 0

        return {
          id: item.id,
          code: item.code,
          title: item.title,
          description: item.description,
          subject: item.subject,
          grade: item.grade,
          difficulty: item.difficulty,
          priority: item.priority,
          
          // 知识点权重映射
          knowledgeMappings: item.mappings.map(m => ({
            conceptId: m.conceptId,
            conceptName: m.Concept.name,
            knowledgeWeight: m.knowledgeWeight,
            skillId: m.skillId,
            skillName: m.Skill.name,
            skillWeight: m.skillWeight
          })),
          
          // 变式题目
          variants: item.variants.map(v => ({
            id: v.id,
            difficulty: v.difficulty,
            stem: JSON.parse(v.stem),
            conceptName: v.Concept.name
          })),
          
          // 用户在该母题相关概念上的掌握情况
          masteryStats: {
            averageTheta: avgTheta,
            totalAttempts,
            totalCorrect,
            accuracy: avgAccuracy,
            relatedConcepts: masteries.map(m => ({
              conceptId: m.conceptId,
              conceptName: m.Concept.name,
              theta: m.theta,
              attempts: m.attempts,
              accuracy: m.attempts > 0 ? m.correct / m.attempts : 0
            }))
          },
          
          // 推荐理由
          recommendation: {
            reason: mode === 'weak' && weakConceptIds.some(id => conceptIds.includes(id))
              ? '基于薄弱概念推荐'
              : mode === 'strong'
              ? '挑战性题目'
              : '综合推荐',
            weakConcepts: weakConceptIds.filter(id => conceptIds.includes(id))
          }
        }
      })
    )

    console.log(`[母题推荐] 为用户 ${user.name} 推荐了 ${formattedItems.length} 道母题`)

    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        path: '/api/parent-items/recommend',
        action: 'RECOMMEND_PARENT_ITEMS',
        detail: JSON.stringify({ 
          subject, 
          grade, 
          mode, 
          limit, 
          returnedCount: formattedItems.length 
        })
      }
    }).catch(console.error)

    return Response.json({
      ok: true,
      data: {
        parentItems: formattedItems,
        total: formattedItems.length,
        subject,
        grade,
        mode,
        userWeakConcepts: weakConcepts.map(w => ({
          conceptId: w.conceptId,
          conceptName: w.concept.name,
          theta: w.theta,
          weightedScore: w.weightedScore
        }))
      }
    })

  } catch (error) {
    console.error('[母题推荐] 错误:', error)
    
    return Response.json({
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '获取母题推荐失败，请稍后重试',
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 })
  }
}