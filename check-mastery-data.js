import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkMasteryData() {
  console.log('检查用户掌握度数据...')
  
  // 获取演示用户的掌握度数据
  const user = await prisma.user.findUnique({
    where: { email: 'demo@example.com' }
  })
  
  if (!user) {
    console.log('❌ 未找到演示用户')
    return
  }
  
  console.log(`用户: ${user.name} (${user.id})`)
  
  const masteries = await prisma.mastery.findMany({
    where: { userId: user.id },
    include: { Concept: true },
    orderBy: { updatedAt: 'desc' }
  })
  
  console.log(`掌握度记录数量: ${masteries.length}`)
  
  masteries.forEach((m, i) => {
    console.log(`${i + 1}. ${m.Concept.name}`)
    console.log(`   θ值: ${m.theta.toFixed(2)}`)
    console.log(`   尝试次数: ${m.attempts || 0}`)
    console.log(`   正确次数: ${m.correct || 0}`)
    console.log(`   正确率: ${m.attempts > 0 ? ((m.correct / m.attempts) * 100).toFixed(1) : 0}%`)
    console.log(`   更新时间: ${m.updatedAt.toLocaleString()}`)
    console.log('---')
  })
  
  await prisma.$disconnect()
}

checkMasteryData().catch(console.error)