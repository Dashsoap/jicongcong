import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixMathData() {
  console.log('修复数学数据...')

  // 1. 更新旧的概念为数学学科
  await prisma.concept.updateMany({
    where: {
      OR: [
        { name: '代数基础' },
        { name: '力学基础' }
      ]
    },
    data: {
      subject: '数学',
      grade: '高一'
    }
  })

  // 2. 清理非数学题目
  await prisma.item.deleteMany({
    where: {
      Concept: {
        subject: { not: '数学' }
      }
    }
  })

  // 3. 添加更多高质量的数学题目
  const concepts = await prisma.concept.findMany({
    where: { subject: '数学' }
  })

  const newItems = [
    {
      conceptId: 'concept-function-basic',
      difficulty: 0,
      stem: JSON.stringify({
        text: '函数 f(x) = x + 1 在 x = 2 时的值为多少？',
        latex: 'f(x) = x + 1'
      }),
      solution: JSON.stringify({ answer: '3', steps: ['f(2) = 2 + 1 = 3'] })
    },
    {
      conceptId: 'concept-quadratic', 
      difficulty: 1,
      stem: JSON.stringify({
        text: '二次函数 y = x² - 2x + 1 的顶点坐标是？',
        latex: 'y = x² - 2x + 1'
      }),
      solution: JSON.stringify({ answer: '(1, 0)', steps: ['配方：y = (x-1)²', '顶点为(1,0)'] })
    },
    {
      conceptId: 'concept-inequality',
      difficulty: 0,
      stem: JSON.stringify({
        text: '解不等式：x + 2 > 5',
        latex: 'x + 2 > 5'
      }),
      solution: JSON.stringify({ answer: 'x > 3', steps: ['x > 5 - 2', 'x > 3'] })
    },
    {
      conceptId: 'concept-function-basic',
      difficulty: 2,
      stem: JSON.stringify({
        text: '函数 f(x) = √(x-1) 的定义域是？',
        latex: 'f(x) = \\sqrt{x-1}'
      }),
      solution: JSON.stringify({ answer: 'x ≥ 1', steps: ['x-1 ≥ 0', 'x ≥ 1'] })
    },
    {
      conceptId: 'concept-trigonometry',
      difficulty: 1,
      stem: JSON.stringify({
        text: 'sin(90°) 的值是多少？',
        latex: '\\sin(90°)'
      }),
      solution: JSON.stringify({ answer: '1', steps: ['sin(90°) = 1'] })
    }
  ]

  // 检查概念是否存在并创建题目
  for (const itemData of newItems) {
    const concept = await prisma.concept.findUnique({
      where: { id: itemData.conceptId }
    })
    
    if (concept) {
      await prisma.item.create({
        data: itemData
      })
      console.log(`✅ 添加题目到概念: ${concept.name}`)
    }
  }

  const totalItems = await prisma.item.count({
    where: {
      Concept: { subject: '数学' }
    }
  })
  
  console.log(`🎯 现在共有 ${totalItems} 道数学题目`)
  
  await prisma.$disconnect()
}

fixMathData().catch(console.error)