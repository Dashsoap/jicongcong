'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { getJSON } from '@/lib/fetcher'
import { toast } from 'sonner'

interface DashboardStats {
  classCount: number
  totalStudents: number
  totalAssignments: number
  pendingAssignments: number
}

export default function TeacherDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    classCount: 0,
    totalStudents: 0,
    totalAssignments: 0,
    pendingAssignments: 0
  })
  const [loading, setLoading] = useState(true)

  const appName = process.env.NEXT_PUBLIC_APP_NAME || '智慧辅导系统'

  // 检查用户权限
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      router.push('/login?callbackUrl=/teacher')
      return
    }
    
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      toast.error('权限不足', {
        description: '您需要教师权限才能访问此页面'
      })
      router.push('/')
      return
    }
  }, [session, status, router])

  // 加载仪表板数据
  useEffect(() => {
    if (!session?.user || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
      return
    }

    const loadDashboardData = async () => {
      try {
        setLoading(true)
        
        // 并行加载班级和作业数据
        const [classesResponse, assignmentsResponse] = await Promise.all([
          getJSON('/api/teacher/classes'),
          getJSON('/api/teacher/assignments')
        ])

        const classes = classesResponse.classes || []
        const assignments = assignmentsResponse.assignments || []
        
        // 计算统计数据
        const totalStudents = classes.reduce((sum: number, cls: any) => sum + cls.studentCount, 0)
        const now = new Date()
        const pendingAssignments = assignments.filter((assignment: any) => 
          assignment.dueAt && new Date(assignment.dueAt) > now
        ).length

        setStats({
          classCount: classes.length,
          totalStudents,
          totalAssignments: assignments.length,
          pendingAssignments
        })
      } catch (error) {
        console.error('加载仪表板数据失败:', error)
        toast.error('加载数据失败', {
          description: '无法获取仪表板数据，请刷新页面重试'
        })
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [session])

  // 显示加载状态
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  // 如果没有权限，不渲染任何内容
  if (!session?.user || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">{appName}</h1>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                教师控制台
              </span>
            </div>
            
            {/* 用户信息 */}
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-500">欢迎，</span>
                <span className="font-medium text-gray-900">{session.user.name}</span>
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                  {session.user.role === 'ADMIN' ? '管理员' : '教师'}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 欢迎区域 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6">
            <h2 className="text-3xl font-bold mb-2">教师控制台</h2>
            <p className="text-purple-100">
              管理您的班级、创建作业、查看学生进度
            </p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">班级数量</p>
                <p className="text-2xl font-bold text-gray-900">{stats.classCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">学生总数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">作业总数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">未完成作业</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingAssignments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">班级管理</h3>
            <p className="text-gray-600 mb-4">创建和管理您的班级，查看学生列表</p>
            <button
              onClick={() => router.push('/teacher/classes')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              管理班级
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">作业管理</h3>
            <p className="text-gray-600 mb-4">创建作业，分配给班级，查看完成情况</p>
            <button
              onClick={() => router.push('/teacher/assignments')}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              管理作业
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

