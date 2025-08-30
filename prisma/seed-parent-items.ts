import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedParentItems() {
  console.log('开始创建母题示例数据...')

  // 先创建高一数学核心知识点
  const conceptsData = [
    { id: 'concept-function-basic', name: '函数基本概念', subject: '数学', grade: '高一', weight: 5 },
    { id: 'concept-function-monotone', name: '函数单调性', subject: '数学', grade: '高一', weight: 4 },
    { id: 'concept-quadratic', name: '二次函数', subject: '数学', grade: '高一', weight: 5 },
    { id: 'concept-inequality', name: '不等式', subject: '数学', grade: '高一', weight: 4 },
    { id: 'concept-exponential', name: '指数函数', subject: '数学', grade: '高一', weight: 4 },
    { id: 'concept-logarithm', name: '对数函数', subject: '数学', grade: '高一', weight: 4 },
    { id: 'concept-trigonometry', name: '三角函数', subject: '数学', grade: '高一', weight: 5 },
    { id: 'concept-vector', name: '向量', subject: '数学', grade: '高一', weight: 3 },
  ]

  for (const concept of conceptsData) {
    await prisma.concept.upsert({
      where: { id: concept.id },
      update: {},
      create: concept
    })
  }

  // 创建能力维度
  const skillsData = [
    { id: 'skill-calculation', name: '计算能力', category: '基础能力', subject: '数学' },
    { id: 'skill-reasoning', name: '逻辑推理', category: '思维能力', subject: '数学' },
    { id: 'skill-modeling', name: '数学建模', category: '应用能力', subject: '数学' },
    { id: 'skill-analysis', name: '分析能力', category: '思维能力', subject: '数学' },
  ]

  for (const skill of skillsData) {
    await prisma.skill.upsert({
      where: { id: skill.id },
      update: {},
      create: skill
    })
  }

  // 创建10道母题
  const parentItemsData = [
    {
      id: 'M001',
      code: 'M001',
      title: '函数定义域求解',
      description: '求函数定义域的基础题型',
      difficulty: 2,
      priority: 5,
    },
    {
      id: 'M002',
      code: 'M002', 
      title: '二次函数最值问题',
      description: '二次函数在给定区间的最值',
      difficulty: 3,
      priority: 5,
    },
    {
      id: 'M003',
      code: 'M003',
      title: '指数方程求解',
      description: '基本指数方程的解法',
      difficulty: 3,
      priority: 4,
    },
    {
      id: 'M004',
      code: 'M004',
      title: '对数运算与化简',
      description: '对数的基本运算法则应用',
      difficulty: 2,
      priority: 4,
    },
    {
      id: 'M005',
      code: 'M005',
      title: '三角函数图像性质',
      description: '三角函数的周期、振幅等性质',
      difficulty: 4,
      priority: 5,
    },
    {
      id: 'M006',
      code: 'M006',
      title: '向量数量积计算',
      description: '平面向量数量积的计算',
      difficulty: 3,
      priority: 3,
    },
    {
      id: 'M007',
      code: 'M007',
      title: '不等式组求解',
      description: '一元二次不等式组的解法',
      difficulty: 3,
      priority: 4,
    },
    {
      id: 'M008',
      code: 'M008',
      title: '函数单调性判断',
      description: '判断函数在给定区间的单调性',
      difficulty: 4,
      priority: 4,
    },
    {
      id: 'M009',
      code: 'M009',
      title: '复合函数求解',
      description: '复合函数的定义域值域问题',
      difficulty: 4,
      priority: 4,
    },
    {
      id: 'M010',
      code: 'M010',
      title: '函数零点问题',
      description: '函数零点存在性判断',
      difficulty: 5,
      priority: 5,
    }
  ]

  for (let item of parentItemsData) {
    await prisma.parentItem.upsert({
      where: { code: item.code },
      update: {},
      create: item
    })
  }

  // 创建知识点-能力映射关系（每道母题关联多个知识点和能力）
  const mappings = [
    // M001: 函数定义域 -> 函数基本概念(70%) + 不等式(30%)
    { parentItemId: 'M001', conceptId: 'concept-function-basic', skillId: 'skill-calculation', knowledgeWeight: 0.7, skillWeight: 0.8 },
    { parentItemId: 'M001', conceptId: 'concept-inequality', skillId: 'skill-reasoning', knowledgeWeight: 0.3, skillWeight: 0.2 },
    
    // M002: 二次函数最值 -> 二次函数(80%) + 不等式(20%)
    { parentItemId: 'M002', conceptId: 'concept-quadratic', skillId: 'skill-analysis', knowledgeWeight: 0.8, skillWeight: 0.6 },
    { parentItemId: 'M002', conceptId: 'concept-inequality', skillId: 'skill-reasoning', knowledgeWeight: 0.2, skillWeight: 0.4 },
    
    // M003: 指数方程 -> 指数函数(90%) + 计算(10%)
    { parentItemId: 'M003', conceptId: 'concept-exponential', skillId: 'skill-reasoning', knowledgeWeight: 0.9, skillWeight: 0.7 },
    { parentItemId: 'M003', conceptId: 'concept-function-basic', skillId: 'skill-calculation', knowledgeWeight: 0.1, skillWeight: 0.3 },
    
    // M004: 对数运算 -> 对数函数(100%)
    { parentItemId: 'M004', conceptId: 'concept-logarithm', skillId: 'skill-calculation', knowledgeWeight: 1.0, skillWeight: 1.0 },
    
    // M005: 三角函数性质 -> 三角函数(100%)
    { parentItemId: 'M005', conceptId: 'concept-trigonometry', skillId: 'skill-analysis', knowledgeWeight: 1.0, skillWeight: 1.0 },
    
    // M006: 向量数量积 -> 向量(100%)
    { parentItemId: 'M006', conceptId: 'concept-vector', skillId: 'skill-calculation', knowledgeWeight: 1.0, skillWeight: 1.0 },
    
    // M007: 不等式组 -> 不等式(90%) + 函数(10%)
    { parentItemId: 'M007', conceptId: 'concept-inequality', skillId: 'skill-reasoning', knowledgeWeight: 0.9, skillWeight: 0.8 },
    { parentItemId: 'M007', conceptId: 'concept-function-basic', skillId: 'skill-analysis', knowledgeWeight: 0.1, skillWeight: 0.2 },
    
    // M008: 函数单调性 -> 函数单调性(70%) + 函数基本概念(30%)
    { parentItemId: 'M008', conceptId: 'concept-function-monotone', skillId: 'skill-analysis', knowledgeWeight: 0.7, skillWeight: 0.9 },
    { parentItemId: 'M008', conceptId: 'concept-function-basic', skillId: 'skill-reasoning', knowledgeWeight: 0.3, skillWeight: 0.1 },
    
    // M009: 复合函数 -> 函数基本概念(60%) + 函数单调性(40%)
    { parentItemId: 'M009', conceptId: 'concept-function-basic', skillId: 'skill-reasoning', knowledgeWeight: 0.6, skillWeight: 0.5 },
    { parentItemId: 'M009', conceptId: 'concept-function-monotone', skillId: 'skill-analysis', knowledgeWeight: 0.4, skillWeight: 0.5 },
    
    // M010: 函数零点 -> 函数基本概念(50%) + 二次函数(30%) + 不等式(20%)
    { parentItemId: 'M010', conceptId: 'concept-function-basic', skillId: 'skill-modeling', knowledgeWeight: 0.5, skillWeight: 0.4 },
    { parentItemId: 'M010', conceptId: 'concept-quadratic', skillId: 'skill-analysis', knowledgeWeight: 0.3, skillWeight: 0.3 },
    { parentItemId: 'M010', conceptId: 'concept-inequality', skillId: 'skill-reasoning', knowledgeWeight: 0.2, skillWeight: 0.3 },
  ]

  // 批量创建映射关系
  for (let mapping of mappings) {
    await prisma.itemKnowledgeSkillMap.create({
      data: mapping
    })
  }

  console.log('✅ 母题示例数据创建完成!')
  console.log(`- 创建了 ${parentItemsData.length} 道母题`)
}

async function main() {
  try {
    await seedParentItems()
  } catch (error) {
    console.error('❌ 种子数据创建失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })