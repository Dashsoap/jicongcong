import { NextRequest } from 'next/server'
import { requireTeacherAccess } from '@/lib/authz'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const CreateAssignmentSchema = z.object({
  classroomId: z.string().min(1, '班级ID不能为空'),
  title: z.string().min(1, '作业标题不能为空').max(200, '作业标题过长'),
  dueAt: z.string().datetime().optional(),
  items: z.array(z.string()).min(1, '至少需要一道题目').max(20, '题目数量过多')
})

// 获取教师的作业列表
export async function GET(request: NextRequest) {
  try {
    const user = await requireTeacherAccess()
    
    const { searchParams } = new URL(request.url)
    const classroomId = searchParams.get('classroomId')
    
    // 构建查询条件
    const whereClause: any = {
      Classroom: {
        enrollments: {
          some: {
            userId: user.id,
            roleInClass: 'teacher'
          }
        }
      }
    }
    
    if (classroomId) {
      whereClause.classroomId = classroomId
    }
    
    // 获取作业列表
    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        Classroom: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    const assignmentsData = assignments.map(assignment => ({
      id: assignment.id,
      title: assignment.title,
      classroomId: assignment.classroomId,
      classroomName: assignment.Classroom.name,
      dueAt: assignment.dueAt,
      itemCount: JSON.parse(assignment.items).length,
      createdAt: assignment.createdAt
    }))
    
    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        path: '/api/teacher/assignments',
        action: 'GET_ASSIGNMENTS',
        detail: JSON.stringify({ assignmentCount: assignmentsData.length, classroomId })
      }
    }).catch(console.error)
    
    return Response.json({
      ok: true,
      data: { assignments: assignmentsData }
    })
    
  } catch (error: any) {
    console.error('[Teacher Assignments] 错误:', error)
    
    if (error.message === 'UNAUTHORIZED') {
      return Response.json({
        ok: false,
        code: 'UNAUTHORIZED',
        message: '请先登录'
      }, { status: 401 })
    }
    
    if (error.message === 'FORBIDDEN') {
      return Response.json({
        ok: false,
        code: 'FORBIDDEN',
        message: '需要教师权限'
      }, { status: 403 })
    }
    
    return Response.json({
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '获取作业列表失败'
    }, { status: 500 })
  }
}

// 创建新作业
export async function POST(request: NextRequest) {
  try {
    const user = await requireTeacherAccess()
    
    const body = await request.json()
    const { classroomId, title, dueAt, items } = CreateAssignmentSchema.parse(body)
    
    // 验证教师是否有权限管理该班级
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        classroomId,
        roleInClass: 'teacher'
      }
    })
    
    if (!enrollment) {
      return Response.json({
        ok: false,
        code: 'FORBIDDEN',
        message: '您没有权限在该班级创建作业'
      }, { status: 403 })
    }
    
    // 创建作业
    const assignment = await prisma.assignment.create({
      data: {
        classroomId,
        title,
        dueAt: dueAt ? new Date(dueAt) : null,
        items: JSON.stringify(items)
      },
      include: {
        Classroom: {
          select: {
            name: true
          }
        }
      }
    })
    
    console.log(`[Teacher] 用户 ${user.name} 在班级 ${assignment.Classroom.name} 创建了作业: ${title}`)
    
    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        path: '/api/teacher/assignments',
        action: 'CREATE_ASSIGNMENT',
        detail: JSON.stringify({ 
          assignmentId: assignment.id, 
          classroomId, 
          title, 
          itemCount: items.length 
        })
      }
    }).catch(console.error)
    
    return Response.json({
      ok: true,
      data: {
        assignment: {
          id: assignment.id,
          title: assignment.title,
          classroomId: assignment.classroomId,
          classroomName: assignment.Classroom.name,
          dueAt: assignment.dueAt,
          itemCount: items.length,
          createdAt: assignment.createdAt
        }
      }
    })
    
  } catch (error: any) {
    console.error('[Teacher Assignments] 创建失败:', error)
    
    if (error.message === 'UNAUTHORIZED') {
      return Response.json({
        ok: false,
        code: 'UNAUTHORIZED',
        message: '请先登录'
      }, { status: 401 })
    }
    
    if (error.message === 'FORBIDDEN') {
      return Response.json({
        ok: false,
        code: 'FORBIDDEN',
        message: '需要教师权限'
      }, { status: 403 })
    }
    
    // 参数验证错误
    if (error.name === 'ZodError') {
      return Response.json({
        ok: false,
        code: 'INVALID_PARAMS',
        message: '请求参数不正确',
        details: error.message
      }, { status: 400 })
    }
    
    return Response.json({
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '创建作业失败'
    }, { status: 500 })
  }
}

