import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkData() {
  const itemCount = await prisma.item.count()
  console.log('数据库中的题目数量:', itemCount)
  
  if (itemCount > 0) {
    const items = await prisma.item.findMany({
      include: { Concept: true },
      take: 2
    })
    
    console.log('示例题目:')
    items.forEach((item, i) => {
      console.log(`${i + 1}. ID: ${item.id}`)
      console.log(`   概念: ${item.Concept.name}`)
      console.log(`   难度: ${item.difficulty}`)
      console.log(`   题干: ${item.stem.slice(0, 100)}...`)
      console.log('---')
    })
  } else {
    console.log('❌ 数据库中没有题目数据！')
  }
  
  await prisma.$disconnect()
}

checkData().catch(console.error)