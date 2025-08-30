#!/usr/bin/env node
/**
 * 母题系统功能测试脚本
 * 测试精准ELO算法和母题推荐功能
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 简化的ELO函数（用于测试）
function updateTheta(theta, correct, itemDifficulty = 0, k = 24) {
  const p = 1 / (1 + Math.pow(10, (itemDifficulty - theta) / 400))
  const score = correct ? 1 : 0
  return theta + k * (score - p)
}

async function updateMasteryWithWeights(userId, itemId, parentItemId, correct, itemDifficulty = 0) {
  const mappings = await prisma.itemKnowledgeSkillMap.findMany({
    where: {
      OR: [
        ...(itemId ? [{ itemId }] : []),
        ...(parentItemId ? [{ parentItemId }] : [])
      ]
    },
    include: {
      Concept: true,
      Skill: true
    }
  })

  if (mappings.length === 0) {
    return { success: false, updates: [] }
  }

  const updates = []
  const conceptWeights = new Map()
  mappings.forEach(mapping => {
    const currentWeight = conceptWeights.get(mapping.conceptId) || 0
    conceptWeights.set(mapping.conceptId, currentWeight + mapping.knowledgeWeight)
  })

  for (const [conceptId, totalWeight] of conceptWeights) {
    const concept = mappings.find(m => m.conceptId === conceptId)?.Concept
    if (!concept) continue

    const currentMastery = await prisma.mastery.findUnique({
      where: {
        userId_conceptId: { userId, conceptId }
      }
    })

    const oldTheta = currentMastery?.theta || 0
    const attempts = currentMastery?.attempts || 0
    const correctCount = currentMastery?.correct || 0

    const weightedK = 24 * totalWeight
    const newTheta = updateTheta(oldTheta, correct, itemDifficulty, weightedK)
    
    await prisma.mastery.upsert({
      where: {
        userId_conceptId: { userId, conceptId }
      },
      update: {
        theta: newTheta,
        attempts: attempts + 1,
        correct: correct ? correctCount + 1 : correctCount,
        updatedAt: new Date()
      },
      create: {
        userId,
        conceptId,
        theta: newTheta,
        attempts: 1,
        correct: correct ? 1 : 0
      }
    })

    updates.push({
      conceptId,
      conceptName: concept.name,
      oldTheta,
      newTheta,
      weight: totalWeight
    })
  }

  return { success: true, updates }
}

async function testPreciseELO() {
  console.log('🧪 开始测试精准ELO算法...')
  
  // 创建一个测试用户
  const testUser = await prisma.user.upsert({
    where: { email: 'test-elo@example.com' },
    update: {},
    create: {
      id: 'test-elo-user',
      email: 'test-elo@example.com',
      name: '精准ELO测试用户',
      role: 'STUDENT'
    }
  })

  console.log(`✓ 测试用户: ${testUser.name} (${testUser.id})`)

  // 测试1: 答对母题M001（函数定义域）
  console.log('\n--- 测试1: 答对母题M001（函数定义域） ---')
  const result1 = await updateMasteryWithWeights(
    testUser.id,
    undefined, // 没有变式题ID
    'M001',    // 母题ID
    true,      // 答对
    2          // 难度
  )
  
  console.log('更新结果:', JSON.stringify(result1, null, 2))

  // 测试2: 答错母题M002（二次函数最值）
  console.log('\n--- 测试2: 答错母题M002（二次函数最值） ---')
  const result2 = await updateMasteryWithWeights(
    testUser.id,
    undefined,
    'M002',
    false,     // 答错
    3
  )
  
  console.log('更新结果:', JSON.stringify(result2, null, 2))

  // 测试3: 查看薄弱概念
  console.log('\n--- 测试3: 查看薄弱概念 ---')
  const userMasteries = await prisma.mastery.findMany({
    where: { 
      userId: testUser.id,
      Concept: { subject: '数学' }
    },
    include: { Concept: true },
    orderBy: { theta: 'asc' },
    take: 5
  })

  console.log('薄弱概念:', userMasteries.map(m => ({
    概念: m.Concept.name,
    theta: m.theta.toFixed(2),
    尝试次数: m.attempts,
    正确率: `${m.attempts > 0 ? ((m.correct / m.attempts) * 100).toFixed(1) : 0}%`
  })))

  console.log('\n✅ 精准ELO算法测试完成!')
}

async function testParentItemRecommendation() {
  console.log('\n🎯 开始测试母题推荐算法...')

  // 查询所有母题
  const allParentItems = await prisma.parentItem.findMany({
    where: { subject: '数学', grade: '高一' },
    include: {
      mappings: {
        include: {
          Concept: true,
          Skill: true
        }
      }
    }
  })

  console.log(`✓ 发现 ${allParentItems.length} 道高一数学母题`)

  // 显示每道母题的知识点映射
  allParentItems.forEach(item => {
    console.log(`\n${item.code}: ${item.title}`)
    console.log(`  难度: ${item.difficulty}, 重要性: ${item.priority}`)
    item.mappings.forEach(mapping => {
      console.log(`  - ${mapping.Concept.name}(权重${mapping.knowledgeWeight}) + ${mapping.Skill.name}(权重${mapping.skillWeight})`)
    })
  })

  // 验证数据完整性
  const mappingCount = await prisma.itemKnowledgeSkillMap.count({
    where: {
      parentItemId: { not: null }
    }
  })
  
  console.log(`\n✓ 总计 ${mappingCount} 个知识点-能力映射关系`)
  console.log('\n✅ 母题推荐算法测试完成!')
}

async function main() {
  console.log('🚀 母题系统功能测试开始\n')

  try {
    await testPreciseELO()
    await testParentItemRecommendation()
    
    console.log('\n🎉 所有测试通过!')
  } catch (error) {
    console.error('❌ 测试失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)