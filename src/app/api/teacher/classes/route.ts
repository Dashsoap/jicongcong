import { NextRequest } from 'next/server'
import { requireTeacherAccess } from '@/lib/authz'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const CreateClassroomSchema = z.object({
  name: z.string().min(1, '班级名称不能为空').max(100, '班级名称过长')
})

// 获取教师的班级列表
export async function GET(request: NextRequest) {
  try {
    const user = await requireTeacherAccess()
    
    // 获取教师管理的班级
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: user.id,
        roleInClass: 'teacher'
      },
      include: {
        Classroom: {
          include: {
            enrollments: {
              where: {
                roleInClass: 'student'
              }
            },
            assignments: true
          }
        }
      }
    })
    
    const classes = enrollments.map(enrollment => ({
      id: enrollment.Classroom.id,
      name: enrollment.Classroom.name,
      createdAt: enrollment.Classroom.createdAt,
      studentCount: enrollment.Classroom.enrollments.length,
      assignmentCount: enrollment.Classroom.assignments.length
    }))
    
    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        path: '/api/teacher/classes',
        action: 'GET_CLASSES',
        detail: JSON.stringify({ classCount: classes.length })
      }
    }).catch(console.error)
    
    return Response.json({
      ok: true,
      data: { classes }
    })
    
  } catch (error: any) {
    console.error('[Teacher Classes] 错误:', error)
    
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
      message: '获取班级列表失败'
    }, { status: 500 })
  }
}

// 创建新班级
export async function POST(request: NextRequest) {
  try {
    const user = await requireTeacherAccess()
    
    const body = await request.json()
    const { name } = CreateClassroomSchema.parse(body)
    
    // 创建班级
    const classroom = await prisma.classroom.create({
      data: { name }
    })
    
    // 将创建者添加为教师
    await prisma.enrollment.create({
      data: {
        userId: user.id,
        classroomId: classroom.id,
        roleInClass: 'teacher'
      }
    })
    
    console.log(`[Teacher] 用户 ${user.name} 创建了班级: ${name}`)
    
    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        path: '/api/teacher/classes',
        action: 'CREATE_CLASS',
        detail: JSON.stringify({ classroomId: classroom.id, name })
      }
    }).catch(console.error)
    
    return Response.json({
      ok: true,
      data: {
        classroom: {
          id: classroom.id,
          name: classroom.name,
          createdAt: classroom.createdAt,
          studentCount: 0,
          assignmentCount: 0
        }
      }
    })
    
  } catch (error: any) {
    console.error('[Teacher Classes] 创建失败:', error)
    
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
      message: '创建班级失败'
    }, { status: 500 })
  }
}

