import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/authz'
import { PracticeNextSchema } from '@/lib/schemas'
import { prisma } from '@/lib/prisma'

// 模拟练习题数据
const mockItems = [
  {
    id: 'math-001',
    stem: {
      text: '计算: $\\frac{2x + 3}{x - 1} = 5$ 时，$x$ 的值是多少？',
      latex: '\\frac{2x + 3}{x - 1} = 5'
    },
    difficulty: -1,
    conceptId: 'algebra-equations',
    subject: '数学'
  },
  {
    id: 'math-002',
    stem: {
      text: '一个圆的半径是 5cm，求其面积。（π ≈ 3.14）',
    },
    difficulty: 0,
    conceptId: 'geometry-circle',
    subject: '数学'
  },
  {
    id: 'physics-001',
    stem: {
      text: '一个物体从静止开始以 $2 m/s^2$ 的加速度运动，3秒后的速度是多少？',
      latex: '2 m/s^2'
    },
    difficulty: 1,
    conceptId: 'mechanics-motion',
    subject: '物理'
  },
  {
    id: 'math-003',
    stem: {
      text: '解不等式: $2x - 3 > 7$',
      latex: '2x - 3 > 7'
    },
    difficulty: -0.5,
    conceptId: 'algebra-inequalities',
    subject: '数学'
  },
  {
    id: 'physics-002',
    stem: {
      text: '牛顿第二定律的数学表达式是什么？请解释各个变量的含义。',
    },
    difficulty: 0.5,
    conceptId: 'mechanics-laws',
    subject: '物理'
  },
  {
    id: 'math-004',
    stem: {
      text: '函数 $f(x) = x^2 - 4x + 3$ 的最小值是多少？',
      latex: 'f(x) = x^2 - 4x + 3'
    },
    difficulty: 1.5,
    conceptId: 'functions-quadratic',
    subject: '数学'
  },
  {
    id: 'chemistry-001',
    stem: {
      text: '水分子的化学式是什么？它包含几个原子？',
    },
    difficulty: -1.5,
    conceptId: 'basic-chemistry',
    subject: '化学'
  },
  {
    id: 'math-005',
    stem: {
      text: '计算 $\\sin(30°) + \\cos(60°)$ 的值',
      latex: '\\sin(30°) + \\cos(60°)'
    },
    difficulty: 0.8,
    conceptId: 'trigonometry-basic',
    subject: '数学'
  }
];

export async function POST(request: NextRequest) {
  try {
    // 验证认证
    const user = await requireAuth()
    
    // 解析请求体
    const body = await request.json()
    const { subject, limit } = PracticeNextSchema.parse(body)
    
    // 从数据库获取真实题目，如果没有则使用模拟数据
    const items = await prisma.item.findMany({
      where: {
        Concept: {
          subject: subject
        }
      },
      include: {
        Concept: true
      },
      take: limit * 2 // 获取更多题目用于选择
    })
    
    // 如果数据库中没有题目，使用模拟数据
    if (items.length === 0) {
      const filteredItems = mockItems.filter(item => item.subject === subject)
      
      // 获取用户的掌握度数据
      const userMastery = await prisma.mastery.findMany({
        where: { userId: user.id },
        include: { Concept: true }
      })
      
      const masteryMap = new Map(userMastery.map(m => [m.conceptId, m.theta]))
      
      // 根据掌握度和探索策略排序选择题目
      // 80% 选择掌握度低的题目（利用），20% 随机探索
      const itemsWithMastery = filteredItems.map(item => ({
        ...item,
        mastery: masteryMap.get(item.conceptId) || 0,
        explorationScore: Math.random(), // 用于探索的随机分数
      }))
      
      // 排序：优先选择掌握度低的题目，加入一些随机性
      itemsWithMastery.sort((a, b) => {
        const explorationWeight = 0.2 // 20% 探索权重
        const masteryWeight = 0.8     // 80% 利用权重
        
        const scoreA = masteryWeight * (-a.mastery) + explorationWeight * a.explorationScore
        const scoreB = masteryWeight * (-b.mastery) + explorationWeight * b.explorationScore
        
        return scoreB - scoreA // 降序排列
      })
      
      // 取前 N 个题目
      const selectedItems = itemsWithMastery.slice(0, limit).map(item => ({
        id: item.id,
        stem: item.stem,
        difficulty: item.difficulty,
        conceptId: item.conceptId,
        subject: item.subject,
      }))
      
      console.log(`[Practice] 为用户 ${user.name} 选择了 ${selectedItems.length} 道 ${subject} 题目（模拟数据）`)
      
      // 记录审计日志
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          path: '/api/practice/next',
          action: 'GET_PRACTICE_ITEMS',
          detail: JSON.stringify({ subject, limit, itemCount: selectedItems.length, source: 'mock' })
        }
      }).catch(console.error)
      
      return Response.json({
        ok: true,
        data: {
          items: selectedItems,
          total: selectedItems.length,
          subject: subject,
        }
      })
    }
    
    // 使用数据库中的真实题目
    const userMastery = await prisma.mastery.findMany({
      where: { userId: user.id },
      include: { Concept: true }
    })
    
    const masteryMap = new Map(userMastery.map(m => [m.conceptId, m.theta]))
    
    // 计算每个题目的选择权重
    const itemsWithScore = items.map(item => {
      const mastery = masteryMap.get(item.conceptId) || 0
      const weight = item.Concept.weight || 1
      const explorationScore = Math.random()
      
      // 低掌握度 × 高权重 = 高优先级
      const masteryScore = -mastery * weight
      const finalScore = 0.8 * masteryScore + 0.2 * explorationScore
      
      return {
        ...item,
        mastery,
        weight,
        finalScore
      }
    })
    
    // 按分数排序并选择前N个
    itemsWithScore.sort((a, b) => b.finalScore - a.finalScore)
    const selectedItems = itemsWithScore.slice(0, limit).map(item => ({
      id: item.id,
      stem: JSON.parse(item.stem),
      difficulty: item.difficulty,
      conceptId: item.conceptId,
      subject: item.Concept.subject,
    }))
    
    console.log(`[Practice] 为用户 ${user.name} 选择了 ${selectedItems.length} 道 ${subject} 题目（数据库）`)
    
    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        path: '/api/practice/next',
        action: 'GET_PRACTICE_ITEMS',
        detail: JSON.stringify({ subject, limit, itemCount: selectedItems.length, source: 'database' })
      }
    }).catch(console.error)
    
    return Response.json({
      ok: true,
      data: {
        items: selectedItems,
        total: selectedItems.length,
        subject: subject,
      }
    })
    
  } catch (error: unknown) {
    console.error('[Practice Next] 错误:', error)
    
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
        message: '获取练习题失败，请稍后重试',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    )
  }
}
