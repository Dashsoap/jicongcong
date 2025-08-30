import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanUpData() {
  console.log('清理数据...')

  // 删除有问题的题目（旧格式或损坏的题目）
  const problemItems = await prisma.item.findMany({
    include: { Concept: true }
  })

  for (const item of problemItems) {
    try {
      const stem = JSON.parse(item.stem)
      if (!stem.text) {
        console.log(`删除无效题目: ${item.id}`)
        await prisma.item.delete({
          where: { id: item.id }
        })
      }
    } catch (e) {
      console.log(`删除解析失败的题目: ${item.id}`)
      await prisma.item.delete({
        where: { id: item.id }
      })
    }
  }

  // 添加一批高质量的数学题目
  const goodMathItems = [
    {
      conceptId: 'concept-function-basic',
      difficulty: 0,
      stem: JSON.stringify({
        text: '已知函数 f(x) = 3x - 2，求 f(1) 的值',
        latex: 'f(x) = 3x - 2'
      }),
      solution: JSON.stringify({ 
        answer: '1', 
        steps: ['f(1) = 3×1 - 2 = 3 - 2 = 1'] 
      })
    },
    {
      conceptId: 'concept-function-basic',
      difficulty: 1,
      stem: JSON.stringify({
        text: '求函数 $f(x) = \\frac{2}{x+1}$ 的定义域',
        latex: 'f(x) = \\frac{2}{x+1}'
      }),
      solution: JSON.stringify({ 
        answer: 'x ≠ -1', 
        steps: ['分母不能为0', 'x + 1 ≠ 0', 'x ≠ -1'] 
      })
    },
    {
      conceptId: 'concept-quadratic',
      difficulty: 1,
      stem: JSON.stringify({
        text: '解方程 $x^2 - 3x + 2 = 0$',
        latex: 'x^2 - 3x + 2 = 0'
      }),
      solution: JSON.stringify({ 
        answer: 'x = 1 或 x = 2', 
        steps: ['(x-1)(x-2) = 0', 'x = 1 或 x = 2'] 
      })
    },
    {
      conceptId: 'concept-quadratic',
      difficulty: 2,
      stem: JSON.stringify({
        text: '二次函数 $y = -x^2 + 4x - 3$ 的最大值是多少？',
        latex: 'y = -x^2 + 4x - 3'
      }),
      solution: JSON.stringify({ 
        answer: '1', 
        steps: ['配方：y = -(x-2)² + 1', '最大值为 1'] 
      })
    },
    {
      conceptId: 'concept-inequality',
      difficulty: 0,
      stem: JSON.stringify({
        text: '解不等式 $3x - 6 > 0$',
        latex: '3x - 6 > 0'
      }),
      solution: JSON.stringify({ 
        answer: 'x > 2', 
        steps: ['3x > 6', 'x > 2'] 
      })
    },
    {
      conceptId: 'concept-inequality',
      difficulty: 1,
      stem: JSON.stringify({
        text: '解不等式 $-2x + 4 ≤ 0$',
        latex: '-2x + 4 ≤ 0'
      }),
      solution: JSON.stringify({ 
        answer: 'x ≥ 2', 
        steps: ['-2x ≤ -4', 'x ≥ 2'] 
      })
    },
    {
      conceptId: 'concept-trigonometry',
      difficulty: 1,
      stem: JSON.stringify({
        text: '计算 $\\cos 0°$ 的值',
        latex: '\\cos 0°'
      }),
      solution: JSON.stringify({ 
        answer: '1', 
        steps: ['cos 0° = 1'] 
      })
    },
    {
      conceptId: 'concept-exponential',
      difficulty: 1,
      stem: JSON.stringify({
        text: '计算 $2^3$ 的值',
        latex: '2^3'
      }),
      solution: JSON.stringify({ 
        answer: '8', 
        steps: ['2³ = 2 × 2 × 2 = 8'] 
      })
    }
  ]

  // 检查概念是否存在并创建题目
  for (const itemData of goodMathItems) {
    const concept = await prisma.concept.findUnique({
      where: { id: itemData.conceptId }
    })
    
    if (concept) {
      await prisma.item.create({
        data: itemData
      })
      console.log(`✅ 添加题目: ${JSON.parse(itemData.stem).text.slice(0, 30)}...`)
    } else {
      console.log(`❌ 概念不存在: ${itemData.conceptId}`)
    }
  }

  const finalCount = await prisma.item.count({
    where: {
      Concept: { subject: '数学' }
    }
  })
  
  console.log(`🎯 清理完成，现在有 ${finalCount} 道有效的数学题目`)
  
  await prisma.$disconnect()
}

cleanUpData().catch(console.error)