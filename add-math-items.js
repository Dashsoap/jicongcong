import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addMathItems() {
  console.log('开始添加数学练习题...')

  // 先清理不相关的题目
  await prisma.item.deleteMany({
    where: {
      Concept: {
        subject: { not: '数学' }
      }
    }
  })

  // 获取数学概念
  const mathConcepts = await prisma.concept.findMany({
    where: { subject: '数学' }
  })

  if (mathConcepts.length === 0) {
    console.log('❌ 没有找到数学概念，请先运行母题种子数据')
    return
  }

  console.log(`找到 ${mathConcepts.length} 个数学概念`)

  // 为每个概念添加2-3道练习题
  const itemsToAdd = []

  mathConcepts.forEach(concept => {
    const items = getItemsForConcept(concept)
    itemsToAdd.push(...items)
  })

  // 批量创建题目
  for (const item of itemsToAdd) {
    await prisma.item.create({
      data: item
    })
  }

  console.log(`✅ 成功添加 ${itemsToAdd.length} 道数学练习题`)
  
  const totalCount = await prisma.item.count()
  console.log(`📊 数据库中现在共有 ${totalCount} 道题目`)

  await prisma.$disconnect()
}

function getItemsForConcept(concept) {
  const items = []
  
  switch (concept.id) {
    case 'concept-function-basic':
      items.push({
        conceptId: concept.id,
        difficulty: 1,
        stem: JSON.stringify({
          text: '函数 $f(x) = 2x + 1$ 在 $x = 3$ 时的函数值是多少？',
          latex: 'f(x) = 2x + 1'
        }),
        solution: JSON.stringify({
          answer: '7',
          steps: ['将 x = 3 代入函数', 'f(3) = 2×3 + 1 = 7']
        })
      })
      items.push({
        conceptId: concept.id,
        difficulty: 2,
        stem: JSON.stringify({
          text: '求函数 $f(x) = \\frac{1}{x-2}$ 的定义域',
          latex: 'f(x) = \\frac{1}{x-2}'
        }),
        solution: JSON.stringify({
          answer: 'x ≠ 2 或 (-∞,2)∪(2,+∞)',
          steps: ['分母不能为0', 'x-2 ≠ 0', '所以 x ≠ 2']
        })
      })
      break

    case 'concept-quadratic':
      items.push({
        conceptId: concept.id,
        difficulty: 2,
        stem: JSON.stringify({
          text: '二次函数 $f(x) = x^2 - 4x + 3$ 的最小值是多少？',
          latex: 'f(x) = x^2 - 4x + 3'
        }),
        solution: JSON.stringify({
          answer: '-1',
          steps: ['配方法：f(x) = (x-2)² - 1', '最小值为 -1']
        })
      })
      items.push({
        conceptId: concept.id,
        difficulty: 3,
        stem: JSON.stringify({
          text: '解方程 $x^2 - 5x + 6 = 0$',
          latex: 'x^2 - 5x + 6 = 0'
        }),
        solution: JSON.stringify({
          answer: 'x = 2 或 x = 3',
          steps: ['因式分解：(x-2)(x-3) = 0', '所以 x = 2 或 x = 3']
        })
      })
      break

    case 'concept-inequality':
      items.push({
        conceptId: concept.id,
        difficulty: 1,
        stem: JSON.stringify({
          text: '解不等式 $2x + 3 > 7$',
          latex: '2x + 3 > 7'
        }),
        solution: JSON.stringify({
          answer: 'x > 2',
          steps: ['2x > 7 - 3', '2x > 4', 'x > 2']
        })
      })
      items.push({
        conceptId: concept.id,
        difficulty: 2,
        stem: JSON.stringify({
          text: '解不等式组 $\\begin{cases} x + 1 > 0 \\\\ 2x - 3 < 5 \\end{cases}$',
          latex: '\\begin{cases} x + 1 > 0 \\\\ 2x - 3 < 5 \\end{cases}'
        }),
        solution: JSON.stringify({
          answer: '-1 < x < 4',
          steps: ['x > -1', 'x < 4', '所以 -1 < x < 4']
        })
      })
      break

    case 'concept-trigonometry':
      items.push({
        conceptId: concept.id,
        difficulty: 2,
        stem: JSON.stringify({
          text: '计算 $\\sin 30° + \\cos 60°$ 的值',
          latex: '\\sin 30° + \\cos 60°'
        }),
        solution: JSON.stringify({
          answer: '1',
          steps: ['sin 30° = 1/2', 'cos 60° = 1/2', '1/2 + 1/2 = 1']
        })
      })
      break

    default:
      // 为其他概念添加通用题目
      items.push({
        conceptId: concept.id,
        difficulty: 1,
        stem: JSON.stringify({
          text: `关于"${concept.name}"的练习题：请写出相关的基本概念`,
          latex: ''
        }),
        solution: JSON.stringify({
          answer: '请参考教材相关章节',
          steps: ['复习基本定义', '掌握基本性质']
        })
      })
  }

  return items
}

addMathItems().catch(console.error)