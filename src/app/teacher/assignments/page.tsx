'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { getJSON, postJSON } from '@/lib/fetcher'
import { toast } from 'sonner'

interface Assignment {
  id: string
  title: string
  classroomId: string
  classroomName: string
  dueAt?: string
  itemCount: number
  createdAt: string
}

interface Classroom {
  id: string
  name: string
}

export default function TeacherAssignments() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [classes, setClasses] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)

  // 表单状态
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    classroomId: '',
    dueAt: '',
    items: ['math-001', 'math-002', 'math-003'] // 模拟题目ID
  })

  // 检查权限
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      router.push('/login?callbackUrl=/teacher/assignments')
      return
    }
    
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      toast.error('权限不足')
      router.push('/')
      return
    }
  }, [session, status, router])

  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true)
      const [assignmentsData, classesData] = await Promise.all([
        getJSON('/api/teacher/assignments'),
        getJSON('/api/teacher/classes')
      ])
      
      setAssignments(assignmentsData.assignments || [])
      setClasses(classesData.classes || [])
    } catch (error) {
      console.error('加载数据失败:', error)
      toast.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user && (session.user.role === 'TEACHER' || session.user.role === 'ADMIN')) {
      loadData()
    }
  }, [session])

  // 创建作业
  const handleCreateAssignment = async () => {
    if (!newAssignment.title.trim()) {
      toast.error('请输入作业标题')
      return
    }
    
    if (!newAssignment.classroomId) {
      toast.error('请选择班级')
      return
    }

    try {
      setCreating(true)
      const result = await postJSON('/api/teacher/assignments', {
        title: newAssignment.title.trim(),
        classroomId: newAssignment.classroomId,
        dueAt: newAssignment.dueAt || null,
        items: newAssignment.items
      })

      setAssignments(prev => [...prev, result.assignment])
      setNewAssignment({
        title: '',
        classroomId: '',
        dueAt: '',
        items: ['math-001', 'math-002', 'math-003']
      })
      setShowCreateModal(false)
      toast.success('作业创建成功', {
        description: `作业 "${result.assignment.title}" 已分配给 ${result.assignment.classroomName}`
      })
    } catch (error) {
      console.error('创建作业失败:', error)
      toast.error('创建作业失败')
    } finally {
      setCreating(false)
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // 检查作业是否过期
  const isOverdue = (dueAt?: string) => {
    if (!dueAt) return false
    return new Date(dueAt) < new Date()
  }

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
              <button
                onClick={() => router.push('/teacher')}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">作业管理</h1>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={classes.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>创建作业</span>
            </button>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {classes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">需要先创建班级</h3>
            <p className="text-gray-600 mb-4">您需要先创建班级才能分配作业</p>
            <button
              onClick={() => router.push('/teacher/classes')}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              创建班级
            </button>
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无作业</h3>
            <p className="text-gray-600 mb-4">创建您的第一个作业来分配给学生</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              创建作业
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h3>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {assignment.classroomName}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {assignment.itemCount} 道题
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z" />
                        </svg>
                        创建于 {formatDate(assignment.createdAt)}
                      </div>
                    </div>

                    {assignment.dueAt && (
                      <div className={`flex items-center text-sm ${
                        isOverdue(assignment.dueAt) ? 'text-red-600' : 'text-orange-600'
                      }`}>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {isOverdue(assignment.dueAt) ? '已过期' : '截止'} {formatDate(assignment.dueAt)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors">
                      查看详情
                    </button>
                    <button className="px-3 py-1 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors">
                      编辑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 创建作业模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">创建新作业</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  作业标题
                </label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="例如：第一章练习题"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分配班级
                </label>
                <select
                  value={newAssignment.classroomId}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, classroomId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">请选择班级</option>
                  {classes.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  截止时间（可选）
                </label>
                <input
                  type="datetime-local"
                  value={newAssignment.dueAt}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, dueAt: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  题目（模拟）
                </label>
                <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                  已选择 {newAssignment.items.length} 道题目
                  <br />
                  <span className="text-xs">（在完整版本中，这里会有题目选择器）</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewAssignment({
                    title: '',
                    classroomId: '',
                    dueAt: '',
                    items: ['math-001', 'math-002', 'math-003']
                  })
                }}
                disabled={creating}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={handleCreateAssignment}
                disabled={creating || !newAssignment.title.trim() || !newAssignment.classroomId}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    创建中...
                  </>
                ) : (
                  '创建作业'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

