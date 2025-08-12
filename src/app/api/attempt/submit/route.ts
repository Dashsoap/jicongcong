import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/authz'
import { AttemptSchema } from '@/lib/schemas'
import { updateMasteryAfterAttempt } from '@/lib/elo'
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
      include: { Concept: true }
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
    
    // 更新掌握度
    const newTheta = await updateMasteryAfterAttempt(
      user.id, 
      item.conceptId, 
      correct, 
      item.difficulty
    )
    
    // 记录答题记录
    await prisma.attempt.create({
      data: {
        userId: user.id,
        itemId,
        correct,
        timeMs
      }
    })
    
    // 计算掌握度变化
    const deltaTheta = newTheta - currentTheta
    
    console.log(`[Attempt] 用户 ${user.name} 在概念 ${item.Concept.name} 上的表现:`)
    console.log(`  - 题目: ${itemId} (难度: ${item.difficulty})`)
    console.log(`  - 结果: ${correct ? '正确' : '错误'}`)
    console.log(`  - 用时: ${timeMs}ms`)
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
          conceptId: item.conceptId,
          oldTheta: currentTheta,
          newTheta,
          source: 'database'
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
        conceptId: item.conceptId,
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
