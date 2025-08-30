import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkMathItems() {
  const mathItems = await prisma.item.findMany({
    where: {
      Concept: { subject: '数学' }
    },
    include: { Concept: true },
    take: 3
  })
  
  console.log(`数学题目数量: ${mathItems.length}`)
  
  mathItems.forEach((item, i) => {
    console.log(`${i + 1}. ID: ${item.id}`)
    console.log(`   概念: ${item.Concept.name}`)
    console.log(`   学科: ${item.Concept.subject}`)
    console.log(`   难度: ${item.difficulty}`)
    
    try {
      const stem = JSON.parse(item.stem)
      console.log(`   题干: ${stem.text || stem.question || '无题干'}`)
    } catch (e) {
      console.log(`   题干: [解析失败] ${item.stem.slice(0, 50)}...`)
    }
    console.log('---')
  })
  
  await prisma.$disconnect()
}

checkMathItems().catch(console.error)