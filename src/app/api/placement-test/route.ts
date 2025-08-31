import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/authz'
import { prisma } from '@/lib/prisma'

// 摸底考试题库 - 覆盖不同难度和知识点
const PLACEMENT_TEST_ITEMS = [
  // 基础题 (难度 -2 到 -1)
  {
    id: 'placement-math-001',
    stem: { text: '计算：$2 + 3 \\times 4 = ?$', latex: '2 + 3 \\times 4' },
    correctAnswer: '14',
    difficulty: -2,
    conceptId: 'basic-arithmetic',
    conceptName: '四则运算',
    weight: 1
  },
  {
    id: 'placement-math-002', 
    stem: { text: '解方程：$x + 5 = 12$', latex: 'x + 5 = 12' },
    correctAnswer: '7',
    difficulty: -1.5,
    conceptId: 'basic-equations',
    conceptName: '一元一次方程',
    weight: 2
  },
  {
    id: 'placement-math-003',
    stem: { text: '化简：$3x + 2x = ?$', latex: '3x + 2x' },
    correctAnswer: '5x',
    difficulty: -1,
    conceptId: 'algebraic-simplification', 
    conceptName: '代数化简',
    weight: 2
  },
  
  // 中等题 (难度 -0.5 到 0.5)
  {
    id: 'placement-math-004',
    stem: { text: '解不等式：$2x - 3 > 7$', latex: '2x - 3 > 7' },
    correctAnswer: 'x > 5',
    difficulty: 0,
    conceptId: 'inequalities',
    conceptName: '不等式',
    weight: 3
  },
  {
    id: 'placement-math-005',
    stem: { text: '函数$f(x) = 2x + 1$，求$f(3)$的值', latex: 'f(x) = 2x + 1, f(3)' },
    correctAnswer: '7',
    difficulty: 0.5,
    conceptId: 'function-evaluation',
    conceptName: '函数求值',
    weight: 3
  },
  
  // 较难题 (难度 1 到 1.5)
  {
    id: 'placement-math-006',
    stem: { text: '因式分解：$x^2 - 5x + 6$', latex: 'x^2 - 5x + 6' },
    correctAnswer: '(x-2)(x-3)',
    difficulty: 1,
    conceptId: 'factorization',
    conceptName: '因式分解',
    weight: 4
  },
  {
    id: 'placement-math-007',
    stem: { text: '求函数$y = x^2 - 4x + 3$的最小值', latex: 'y = x^2 - 4x + 3' },
    correctAnswer: '-1',
    difficulty: 1.5,
    conceptId: 'quadratic-optimization',
    conceptName: '二次函数最值',
    weight: 4
  },
  
  // 高难度题 (难度 2+)
  {
    id: 'placement-math-008',
    stem: { text: '已知$\\sin\\theta = \\frac{3}{5}$，$\\theta$在第一象限，求$\\cos\\theta$', latex: '\\sin\\theta = \\frac{3}{5}' },
    correctAnswer: '4/5',
    difficulty: 2,
    conceptId: 'trigonometry',
    conceptName: '三角函数',
    weight: 5
  }
]

// 获取摸底考试题目
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    // 检查用户是否已完成摸底考试
    const existingMastery = await prisma.mastery.findMany({
      where: { userId: user.id },
      select: { conceptId: true }
    })
    
    const hasCompletedPlacement = existingMastery.length > 0
    
    if (hasCompletedPlacement) {
      return Response.json({
        ok: false,
        code: 'ALREADY_COMPLETED',
        message: '您已完成摸底考试'
      }, { status: 400 })
    }
    
    // 返回摸底考试题目（去除正确答案）
    const testItems = PLACEMENT_TEST_ITEMS.map(item => ({
      id: item.id,
      stem: item.stem,
      difficulty: item.difficulty,
      conceptId: item.conceptId,
      conceptName: item.conceptName
    }))
    
    console.log(`[摸底考试] 为新用户 ${user.name} 生成摸底考试`)
    
    return Response.json({
      ok: true,
      data: {
        items: testItems,
        total: testItems.length,
        isPlacementTest: true
      }
    })
    
  } catch (error) {
    console.error('[摸底考试] 获取题目错误:', error)
    return Response.json({
      ok: false,
      code: 'INTERNAL_ERROR', 
      message: '获取摸底考试失败'
    }, { status: 500 })
  }
}

// 提交摸底考试结果
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { answers } = body // { itemId: answer, ... }
    
    console.log(`[摸底考试] 用户 ${user.name} 提交答案:`, answers)
    
    // 评分并计算初始能力值
    const results = PLACEMENT_TEST_ITEMS.map(item => {
      const userAnswer = answers[item.id]?.trim().toLowerCase()
      const correctAnswer = item.correctAnswer.toLowerCase()
      const isCorrect = userAnswer === correctAnswer ||
                       userAnswer === correctAnswer.replace(/[()]/g, '') || // 去括号比较
                       (userAnswer.includes('/') && correctAnswer.includes('/') && 
                        eval(userAnswer) === eval(correctAnswer)) // 分数比较
      
      return {
        itemId: item.id,
        conceptId: item.conceptId,
        conceptName: item.conceptName,
        difficulty: item.difficulty,
        weight: item.weight,
        userAnswer,
        correctAnswer: item.correctAnswer,
        isCorrect,
        points: isCorrect ? item.weight : 0
      }
    })
    
    // 按概念统计分数
    const conceptScores = new Map()
    results.forEach(result => {
      if (!conceptScores.has(result.conceptId)) {
        conceptScores.set(result.conceptId, {
          conceptName: result.conceptName,
          totalPoints: 0,
          maxPoints: 0,
          correctCount: 0,
          totalCount: 0
        })
      }
      
      const score = conceptScores.get(result.conceptId)
      score.totalPoints += result.points
      score.maxPoints += result.weight
      score.correctCount += result.isCorrect ? 1 : 0
      score.totalCount += 1
    })
    
    // 为每个概念创建 Mastery 记录
    const masteryPromises = Array.from(conceptScores.entries()).map(async ([conceptId, score]) => {
      // 根据正确率计算初始theta值
      const accuracy = score.correctCount / score.totalCount
      const initialTheta = (accuracy - 0.5) * 100 // -50 到 +50 的初始范围
      
      // 确保概念存在
      await prisma.concept.upsert({
        where: { id: conceptId },
        create: {
          id: conceptId,
          name: score.conceptName,
          subject: '数学',
          grade: '高一',
          weight: 1
        },
        update: {}
      })
      
      // 创建掌握度记录
      return prisma.mastery.upsert({
        where: {
          userId_conceptId: {
            userId: user.id,
            conceptId: conceptId
          }
        },
        create: {
          userId: user.id,
          conceptId: conceptId,
          theta: initialTheta,
          attempts: score.totalCount,
          correct: score.correctCount
        },
        update: {
          theta: initialTheta,
          attempts: score.totalCount,
          correct: score.correctCount
        }
      })
    })
    
    await Promise.all(masteryPromises)
    
    // 计算总体统计
    const totalScore = results.reduce((sum, r) => sum + r.points, 0)
    const maxScore = results.reduce((sum, r) => sum + r.weight, 0)
    const accuracy = results.filter(r => r.isCorrect).length / results.length
    const overallTheta = (accuracy - 0.5) * 100
    
    console.log(`[摸底考试] 用户 ${user.name} 完成摸底考试，总体准确率: ${(accuracy * 100).toFixed(1)}%, 初始θ: ${overallTheta.toFixed(1)}`)
    
    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        path: '/api/placement-test',
        action: 'COMPLETE_PLACEMENT_TEST',
        detail: JSON.stringify({
          totalScore,
          maxScore,
          accuracy,
          overallTheta,
          conceptCount: conceptScores.size
        })
      }
    }).catch(console.error)
    
    return Response.json({
      ok: true,
      data: {
        results: results.map(r => ({
          itemId: r.itemId,
          conceptName: r.conceptName,
          isCorrect: r.isCorrect,
          userAnswer: r.userAnswer,
          correctAnswer: r.correctAnswer
        })),
        summary: {
          totalScore,
          maxScore,
          accuracy: Math.round(accuracy * 100),
          overallTheta: Math.round(overallTheta),
          conceptResults: Array.from(conceptScores.entries()).map(([conceptId, score]) => ({
            conceptId,
            conceptName: score.conceptName,
            accuracy: Math.round((score.correctCount / score.totalCount) * 100),
            initialTheta: Math.round(((score.correctCount / score.totalCount) - 0.5) * 100)
          }))
        }
      }
    })
    
  } catch (error) {
    console.error('[摸底考试] 提交结果错误:', error)
    return Response.json({
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '提交摸底考试失败'
    }, { status: 500 })
  }
}