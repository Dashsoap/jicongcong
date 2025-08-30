import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateMasteryStats() {
  console.log('更新掌握度统计数据...')
  
  // 获取所有掌握度记录
  const masteries = await prisma.mastery.findMany({
    include: { Concept: true, User: true }
  })
  
  console.log(`找到 ${masteries.length} 条掌握度记录`)
  
  // 为现有记录估算练习次数（基于θ值变化）
  for (const mastery of masteries) {
    const theta = mastery.theta
    
    // 基于θ值估算练习次数
    let estimatedAttempts = 0
    let estimatedCorrect = 0
    
    if (Math.abs(theta) > 0) {
      // θ值不为0说明有练习记录
      if (theta > 50) {
        estimatedAttempts = 8
        estimatedCorrect = 7
      } else if (theta > 20) {
        estimatedAttempts = 6
        estimatedCorrect = 5
      } else if (theta > 0) {
        estimatedAttempts = 3
        estimatedCorrect = 2
      } else if (theta > -20) {
        estimatedAttempts = 3
        estimatedCorrect = 1
      } else {
        estimatedAttempts = 2
        estimatedCorrect = 0
      }
    }
    
    if (mastery.attempts === 0 && estimatedAttempts > 0) {
      await prisma.mastery.update({
        where: {
          userId_conceptId: {
            userId: mastery.userId,
            conceptId: mastery.conceptId
          }
        },
        data: {
          attempts: estimatedAttempts,
          correct: estimatedCorrect
        }
      })
      
      console.log(`✅ 更新 ${mastery.User.name} - ${mastery.Concept.name}: ${estimatedAttempts}次尝试, ${estimatedCorrect}次正确`)
    }
  }
  
  console.log('📊 统计数据更新完成')
  await prisma.$disconnect()
}

updateMasteryStats().catch(console.error)