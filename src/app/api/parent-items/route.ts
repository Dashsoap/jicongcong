import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/authz'
import { prisma } from '@/lib/prisma'

// 获取母题列表API
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    
    const subject = searchParams.get('subject') || '数学'
    const grade = searchParams.get('grade') || '高一'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    
    console.log(`[母题列表] 用户 ${user.name} 请求第${page}页，每页${limit}条`)

    const whereClause = {
      subject,
      grade,
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { code: { contains: search } }
        ]
      })
    }

    const [parentItems, total] = await Promise.all([
      prisma.parentItem.findMany({
        where: whereClause,
        include: {
          mappings: {
            include: {
              Concept: true,
              Skill: true
            }
          },
          variants: {
            take: 2, // 预览2个变式
            include: {
              Concept: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { difficulty: 'asc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.parentItem.count({ where: whereClause })
    ])

    // 获取用户掌握度信息
    const conceptIds = [...new Set(
      parentItems.flatMap(item => item.mappings.map(m => m.conceptId))
    )]
    
    const userMasteries = await prisma.mastery.findMany({
      where: {
        userId: user.id,
        conceptId: { in: conceptIds }
      }
    })
    
    const masteryMap = new Map(userMasteries.map(m => [m.conceptId, m]))

    // 格式化返回数据
    const formattedItems = parentItems.map(item => {
      // 计算该母题的掌握度统计
      const relatedMasteries = item.mappings
        .map(m => masteryMap.get(m.conceptId))
        .filter(Boolean)
      
      const avgTheta = relatedMasteries.length > 0
        ? relatedMasteries.reduce((sum, m) => sum + m!.theta, 0) / relatedMasteries.length
        : 0
      
      const totalAttempts = relatedMasteries.reduce((sum, m) => sum + m!.attempts, 0)
      const totalCorrect = relatedMasteries.reduce((sum, m) => sum + m!.correct, 0)

      return {
        id: item.id,
        code: item.code,
        title: item.title,
        description: item.description,
        difficulty: item.difficulty,
        priority: item.priority,
        createdAt: item.createdAt,
        
        // 知识点映射（简化版）
        concepts: item.mappings.map(m => ({
          name: m.Concept.name,
          weight: m.knowledgeWeight
        })),
        
        // 能力映射（简化版）
        skills: [...new Set(item.mappings.map(m => m.Skill.name))],
        
        // 变式预览
        variantCount: item.variants.length,
        variantPreview: item.variants.map(v => ({
          id: v.id,
          difficulty: v.difficulty
        })),
        
        // 用户掌握度概览
        masteryOverview: {
          averageTheta: Math.round(avgTheta * 100) / 100,
          totalAttempts,
          accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
          status: avgTheta > 50 ? 'strong' : avgTheta > 0 ? 'medium' : avgTheta > -50 ? 'weak' : 'very_weak'
        }
      }
    })

    console.log(`[母题列表] 返回 ${formattedItems.length}/${total} 道母题`)

    return Response.json({
      ok: true,
      data: {
        parentItems: formattedItems,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        filters: {
          subject,
          grade,
          search
        }
      }
    })

  } catch (error) {
    console.error('[母题列表] 错误:', error)
    
    return Response.json({
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '获取母题列表失败',
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 })
  }
}