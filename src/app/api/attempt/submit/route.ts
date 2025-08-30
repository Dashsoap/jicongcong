import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/authz'
import { AttemptSchema } from '@/lib/schemas'
import { updateMasteryAfterAttempt } from '@/lib/elo'
import { updateMasteryWithWeights } from '@/lib/elo-precise'
import { prisma } from '@/lib/prisma'

// 模拟题目数据，用于获取题目难度
const itemDifficulties: Record<string, { difficulty: number; conceptId: string }> = {
  'math-001': { difficulty: -1, conceptId: 'algebra-equations' },
  'math-002': { difficulty: 0, conceptId: 'geometry-circle' },
  'physics-001': { difficulty: 1, conceptId: 'mechanics-motion' },
  'math-003': { difficulty: -0.5, conceptId: 'algebra-inequalities' },
  'physics-002': { difficulty: 0.5, conceptId: 'mechanics-laws' },
  'math-004': { difficulty: 1.5, conceptId: 'functions-quadratic' },
  'chemistry-001': { difficulty: -1.5, conceptId: 'basic-chemistry' },
  'math-005': { difficulty: 0.8, conceptId: 'trigonometry-basic' },
};

export async function POST(request: NextRequest) {
  try {
    // 验证认证
    const user = await requireAuth()

    // 解析请求体
    const body = await request.json()
    
    // 验证请求参数
    const { itemId, correct, timeMs } = AttemptSchema.parse(body)
    
    // 从数据库获取题目信息
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { 
        Concept: true,
        ParentItem: true 
      }
    })
    
    if (!item) {
      // 尝试从模拟数据获取
      const itemInfo = itemDifficulties[itemId]
      if (!itemInfo) {
        return Response.json(
          {
            ok: false,
            code: 'ITEM_NOT_FOUND',
            message: '题目不存在',
            details: `未找到题目 ID: ${itemId}`,
          },
          { status: 404 }
        )
      }
      
      // 获取当前掌握度（用于计算变化）
      const { getMastery } = await import('@/lib/elo')
      const currentTheta = await getMastery(user.id, itemInfo.conceptId)
      
      // 使用模拟数据更新掌握度
      const newTheta = await updateMasteryAfterAttempt(
        user.id, 
        itemInfo.conceptId, 
        correct, 
        itemInfo.difficulty
      )
      
      // 计算掌握度变化
      const deltaTheta = newTheta - (currentTheta || 0)
      
      console.log(`[Attempt] 用户 ${user.name} 答题: 题目=${itemId}, 正确=${correct}, 用时=${timeMs}ms（模拟数据）`)
      console.log(`  - 能力值: ${currentTheta.toFixed(2)} → ${newTheta.toFixed(2)} (变化: ${deltaTheta > 0 ? '+' : ''}${deltaTheta.toFixed(2)})`)
      
      // 记录审计日志
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          path: '/api/attempt/submit',
          action: 'SUBMIT_ATTEMPT',
          detail: JSON.stringify({ 
            itemId, 
            correct, 
            timeMs, 
            conceptId: itemInfo.conceptId,
            oldTheta: currentTheta,
            newTheta,
            source: 'mock' 
          }),
          latencyMs: timeMs
        }
      }).catch(console.error)
      
      return Response.json({
        ok: true,
        data: {
          theta: newTheta,
          previousTheta: currentTheta,
          deltaTheta,
          conceptId: itemInfo.conceptId,
          itemId,
          correct,
          timeMs,
        }
      })
    }
    
    // 使用数据库中的真实题目
    const oldMastery = await prisma.mastery.findUnique({
      where: {
        userId_conceptId: {
          userId: user.id,
          conceptId: item.conceptId
        }
      }
    })
    
    const currentTheta = oldMastery?.theta || 0
    
    // 优先使用精准ELO算法（基于知识点权重）
    let updateResult
    if (item.ParentItem || item.parentItemId) {
      // 使用精准ELO更新
      updateResult = await updateMasteryWithWeights(
        user.id,
        itemId,
        item.parentItemId || undefined,
        correct,
        item.difficulty
      )
      
      console.log(`[精准答题] 用户 ${user.name} 答题结果:`)
      console.log(`  - 题目: ${itemId} (${item.ParentItem?.title || '独立题目'})`)
      console.log(`  - 难度: ${item.difficulty}, 结果: ${correct ? '正确' : '错误'}, 用时: ${timeMs}ms`)
      
      if (updateResult.success) {
        updateResult.updates.forEach(update => {
          console.log(`  - ${update.conceptName}(权重${update.weight}): ${update.oldTheta.toFixed(2)} → ${update.newTheta.toFixed(2)}`)
        })
      }
    } else {
      // 回退到传统ELO算法
      const newTheta = await updateMasteryAfterAttempt(
        user.id, 
        item.conceptId, 
        correct, 
        item.difficulty
      )
      
      updateResult = {
        success: true,
        updates: [{
          conceptId: item.conceptId,
          conceptName: item.Concept.name,
          oldTheta: currentTheta,
          newTheta,
          weight: 1.0
        }]
      }
      
      console.log(`[传统答题] 用户 ${user.name} 在概念 ${item.Concept.name} 上的表现:`)
      console.log(`  - 题目: ${itemId} (难度: ${item.difficulty})`)
      console.log(`  - 结果: ${correct ? '正确' : '错误'}, 用时: ${timeMs}ms`)
      console.log(`  - 能力值: ${currentTheta.toFixed(2)} → ${newTheta.toFixed(2)}`)
    }
    
    // 记录答题记录
    await prisma.attempt.create({
      data: {
        userId: user.id,
        itemId,
        correct,
        timeMs
      }
    })
    
    // 获取主要更新结果（第一个或权重最高的）
    const primaryUpdate = updateResult.success && updateResult.updates.length > 0
      ? updateResult.updates.reduce((max, curr) => 
          curr.weight > max.weight ? curr : max
        )
      : { conceptId: item.conceptId, oldTheta: currentTheta, newTheta: currentTheta, weight: 0 }
    
    const deltaTheta = primaryUpdate.newTheta - primaryUpdate.oldTheta
    
    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        path: '/api/attempt/submit',
        action: 'SUBMIT_ATTEMPT',
        detail: JSON.stringify({ 
          itemId, 
          correct, 
          timeMs, 
          parentItemId: item.parentItemId,
          parentItemTitle: item.ParentItem?.title,
          updateMode: (item.ParentItem || item.parentItemId) ? 'precise' : 'traditional',
          conceptUpdates: updateResult.updates.length,
          primaryUpdate: {
            conceptId: primaryUpdate.conceptId,
            oldTheta: primaryUpdate.oldTheta,
            newTheta: primaryUpdate.newTheta,
            weight: primaryUpdate.weight
          },
          source: 'database'
        }),
        latencyMs: timeMs
      }
    }).catch(console.error)
    
    return Response.json({
      ok: true,
      data: {
        // 主要掌握度信息（向后兼容）
        theta: primaryUpdate.newTheta,
        previousTheta: primaryUpdate.oldTheta,
        deltaTheta,
        conceptId: primaryUpdate.conceptId,
        
        // 精准ELO的详细结果
        updateMode: (item.ParentItem || item.parentItemId) ? 'precise' : 'traditional',
        allUpdates: updateResult.updates,
        parentItem: item.ParentItem ? {
          id: item.ParentItem.id,
          code: item.ParentItem.code,
          title: item.ParentItem.title
        } : null,
        
        // 基础信息
        itemId,
        correct,
        timeMs,
      }
    })
    
  } catch (error: unknown) {
    console.error('[Attempt Submit] 错误:', error)
    
    // 参数验证错误
    if (error instanceof Error && error.name === 'ZodError') {
      return Response.json(
        {
          ok: false,
          code: 'INVALID_PARAMS',
          message: '请求参数不正确',
          details: error.message
        },
        { status: 400 }
      )
    }
    
    return Response.json(
      {
        ok: false,
        code: 'INTERNAL_ERROR',
        message: '提交答题结果失败，请稍后重试',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    )
  }
}
