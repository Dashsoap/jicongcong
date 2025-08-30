'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Header from '@/components/Header'

interface ParentItem {
  id: string
  code: string
  title: string
  description: string
  difficulty: number
  priority: number
  knowledgeMappings: Array<{
    conceptName: string
    knowledgeWeight: number
    skillName: string
    skillWeight: number
  }>
  masteryStats: {
    averageTheta: number
    totalAttempts: number
    accuracy: number
  }
  recommendation: {
    reason: string
  }
}

export default function ParentItemsPage() {
  const { data: session, status } = useSession()
  const [parentItems, setParentItems] = useState<ParentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'weak' | 'all' | 'strong'>('weak')

  useEffect(() => {
    if (status === 'authenticated') {
      fetchParentItems()
    }
  }, [status, mode])

  const fetchParentItems = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/parent-items/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: '数学',
          grade: '高一',
          mode,
          limit: 10
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch parent items')
      }

      const data = await response.json()
      setParentItems(data.data?.parentItems || [])
    } catch (error) {
      console.error('获取母题失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (theta: number) => {
    if (theta > 50) return 'text-green-600 bg-green-100'
    if (theta > 0) return 'text-blue-600 bg-blue-100'
    if (theta > -50) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getStatusText = (theta: number) => {
    if (theta > 50) return '掌握良好'
    if (theta > 0) return '基本掌握'
    if (theta > -50) return '需要加强'
    return '急需提升'
  }

  if (status === 'loading') {
    return <div className="p-8">加载中...</div>
  }

  if (status === 'unauthenticated') {
    return <div className="p-8">请先登录</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="parent-items" />

      <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎯 高一数学母题系统
        </h1>
        <p className="text-gray-600">
          基于知识点权重的精准题目推荐，助力县域高中教学提效
        </p>
      </div>

      {/* 模式选择 */}
      <div className="flex gap-4 mb-6">
        {[
          { key: 'weak', label: '薄弱概念推荐', desc: '基于你的薄弱知识点' },
          { key: 'all', label: '综合推荐', desc: '全面覆盖所有知识点' },
          { key: 'strong', label: '挑战模式', desc: '高难度提升题目' }
        ].map(({ key, label, desc }) => (
          <button
            key={key}
            onClick={() => setMode(key as typeof mode)}
            className={`p-4 rounded-lg border transition-all ${
              mode === key
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium">{label}</div>
            <div className="text-sm text-gray-500">{desc}</div>
          </button>
        ))}
      </div>

      {/* 母题列表 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在加载母题推荐...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {parentItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              {/* 题目头部 */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {item.code}
                    </span>
                    <span className="text-sm text-gray-500">
                      难度 {item.difficulty} | 重要性 {item.priority}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                </div>
              </div>

              {/* 描述 */}
              <p className="text-gray-600 text-sm mb-4">{item.description}</p>

              {/* 掌握度状态 */}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                getStatusColor(item.masteryStats.averageTheta)
              }`}>
                {getStatusText(item.masteryStats.averageTheta)}
                <span className="ml-2">θ={item.masteryStats.averageTheta.toFixed(1)}</span>
              </div>

              {/* 知识点映射 */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">涉及知识点:</h4>
                <div className="space-y-1">
                  {item.knowledgeMappings.slice(0, 3).map((mapping, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{mapping.conceptName}</span>
                      <span className="text-blue-600 font-medium">
                        {(mapping.knowledgeWeight * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 练习统计 */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{item.masteryStats.totalAttempts}</div>
                  <div className="text-xs text-gray-500">练习次数</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {(item.masteryStats.accuracy * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">正确率</div>
                </div>
              </div>

              {/* 推荐理由 */}
              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {item.recommendation.reason}
              </div>
            </div>
          ))}
        </div>
      )}

      {parentItems.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-xl mb-2">📚</div>
          <p className="text-gray-600">暂无推荐的母题，请先完成一些练习</p>
        </div>
      )}
    </div>
    </div>
  )
}