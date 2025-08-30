import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 模拟API调用来测试数据
async function testPracticeAPI() {
  console.log('测试练习API数据...')
  
  const subject = '数学'
  const limit = 5
  
  // 模拟API中的查询逻辑
  const items = await prisma.item.findMany({
    where: {
      Concept: {
        subject: subject
      }
    },
    include: {
      Concept: true
    },
    take: limit * 2
  })
  
  console.log(`找到 ${items.length} 道 ${subject} 题目`)
  
  if (items.length === 0) {
    console.log('❌ 没有找到题目！')
    return
  }
  
  // 模拟用户掌握度数据（空的情况）
  const masteryMap = new Map()
  
  // 模拟API中的选择逻辑
  const itemsWithScore = items.map(item => {
    const mastery = masteryMap.get(item.conceptId) || 0
    const weight = item.Concept.weight || 1
    const explorationScore = Math.random()
    
    const masteryScore = -mastery * weight
    const finalScore = 0.8 * masteryScore + 0.2 * explorationScore
    
    return {
      ...item,
      mastery,
      weight,
      finalScore
    }
  })
  
  itemsWithScore.sort((a, b) => b.finalScore - a.finalScore)
  const selectedItems = itemsWithScore.slice(0, limit).map(item => {
    let parsedStem
    try {
      parsedStem = JSON.parse(item.stem)
    } catch (e) {
      console.log(`❌ 解析题干失败: ${item.id}`)
      parsedStem = { text: '题干解析失败', latex: '' }
    }
    
    return {
      id: item.id,
      stem: parsedStem,
      difficulty: item.difficulty,
      conceptId: item.conceptId,
      subject: item.Concept.subject,
    }
  })
  
  console.log('API返回数据:')
  selectedItems.forEach((item, i) => {
    console.log(`${i + 1}. ${item.stem.text}`)
    console.log(`   概念: ${item.conceptId}`)
    console.log(`   难度: ${item.difficulty}`)
    console.log('---')
  })
  
  const apiResponse = {
    ok: true,
    data: {
      items: selectedItems,
      total: selectedItems.length,
      subject: subject,
    }
  }
  
  console.log(`✅ API将返回 ${selectedItems.length} 道题目`)
  
  await prisma.$disconnect()
}

testPracticeAPI().catch(console.error)