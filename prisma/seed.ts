import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始种子数据...')

  // 创建示例用户
  const studentUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: '演示学生',
      role: 'STUDENT',
    },
  })

  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: {
      email: 'teacher@example.com',
      name: '演示老师',
      role: 'TEACHER',
    },
  })

  // 创建示例概念
  const mathConcept = await prisma.concept.create({
    data: {
      subject: '数学',
      name: '代数基础',
      grade: '七年级',
      weight: 3,
    },
  })

  const physicsConcept = await prisma.concept.create({
    data: {
      subject: '物理',
      name: '力学基础',
      grade: '八年级',
      weight: 2,
    },
  })

  // 创建示例题目
  await prisma.item.create({
    data: {
      conceptId: mathConcept.id,
      difficulty: 100,
      stem: JSON.stringify({
        question: '解方程：2x + 3 = 7',
        type: 'equation'
      }),
      solution: JSON.stringify({
        answer: 'x = 2',
        steps: ['2x + 3 = 7', '2x = 7 - 3', '2x = 4', 'x = 2']
      }),
    },
  })

  await prisma.item.create({
    data: {
      conceptId: physicsConcept.id,
      difficulty: 150,
      stem: JSON.stringify({
        question: '一个物体从静止开始，以2m/s²的加速度运动，3秒后的速度是多少？',
        type: 'physics'
      }),
      solution: JSON.stringify({
        answer: '6 m/s',
        formula: 'v = v₀ + at',
        calculation: 'v = 0 + 2 × 3 = 6 m/s'
      }),
    },
  })

  // 创建示例班级
  const classroom = await prisma.classroom.create({
    data: {
      name: '七年级一班',
    },
  })

  // 创建班级注册
  await prisma.enrollment.create({
    data: {
      userId: studentUser.id,
      classroomId: classroom.id,
      roleInClass: 'student',
    },
  })

  await prisma.enrollment.create({
    data: {
      userId: teacherUser.id,
      classroomId: classroom.id,
      roleInClass: 'teacher',
    },
  })

  console.log('种子数据创建完成!')
  console.log(`学生用户: ${studentUser.email}`)
  console.log(`教师用户: ${teacherUser.email}`)
  console.log(`概念数量: 2`)
  console.log(`题目数量: 2`)
  console.log(`班级: ${classroom.name}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

