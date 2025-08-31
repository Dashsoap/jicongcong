'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { toast } from 'sonner'

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
  const router = useRouter()
  const [parentItems, setParentItems] = useState<ParentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'weak' | 'all' | 'strong'>('weak')
  const [showPlacementPrompt, setShowPlacementPrompt] = useState(false)

  useEffect(() => {
    document.title = '母题系统 | 岭鹿AI'
  }, [])

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
      const items = data.data?.parentItems || []
      setParentItems(items)
      
      // 如果没有推荐母题且用户可能需要摸底考试，显示提示
      if (items.length === 0 && mode === 'weak') {
        checkPlacementStatus()
      }
    } catch (error) {
      console.error('获取母题失败:', error)
      toast.error('获取母题失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const checkPlacementStatus = async () => {
    try {
      const response = await fetch('/api/placement-test')
      if (response.ok) {
        // 用户需要摸底考试
        setShowPlacementPrompt(true)
      }
    } catch (error) {
      console.error('检查摸底考试状态失败:', error)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header currentPage="parent-items" />

      <div className="max-w-7xl mx-auto p-6">
        {/* 摸底考试提示 */}
        {showPlacementPrompt && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🚀</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">开启个性化学习</h3>
                  <p className="text-orange-100">
                    完成摸底考试后，我们将为您推荐最适合的母题和学习路径
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPlacementPrompt(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button
                  onClick={() => router.push('/placement-test')}
                  className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors"
                >
                  开始摸底考试
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-5xl mr-4">🎯</span>
            高一数学母题系统
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            基于您的学习数据智能推荐，每道母题都精准匹配您的学习需求
          </p>
        </div>

        {/* 模式选择 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { 
              key: 'weak', 
              label: '薄弱概念推荐', 
              desc: '基于你的薄弱知识点',
              icon: '🔍',
              color: 'from-red-500 to-pink-500'
            },
            { 
              key: 'all', 
              label: '综合推荐', 
              desc: '全面覆盖所有知识点',
              icon: '📊',
              color: 'from-blue-500 to-purple-500'
            },
            { 
              key: 'strong', 
              label: '挑战模式', 
              desc: '高难度提升题目',
              icon: '🚀',
              color: 'from-green-500 to-teal-500'
            }
          ].map(({ key, label, desc, icon, color }) => (
            <button
              key={key}
              onClick={() => setMode(key as typeof mode)}
              className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                mode === key
                  ? 'border-white shadow-2xl scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
              }`}
            >
              <div className={`bg-gradient-to-br ${color} p-6 text-white ${
                mode === key ? 'opacity-100' : 'opacity-80 hover:opacity-90'
              }`}>
                <div className="text-3xl mb-3">{icon}</div>
                <div className="font-bold text-lg mb-2">{label}</div>
                <div className="text-sm opacity-90">{desc}</div>
              </div>
              {mode === key && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* 母题列表 */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
            <p className="text-lg text-gray-600">正在为您精选母题...</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {parentItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                {/* 头部渐变条 */}
                <div className={`h-1 bg-gradient-to-r ${
                  item.masteryStats.averageTheta > 50 ? 'from-green-400 to-green-600' :
                  item.masteryStats.averageTheta > 0 ? 'from-blue-400 to-blue-600' :
                  item.masteryStats.averageTheta > -50 ? 'from-yellow-400 to-orange-500' :
                  'from-red-400 to-red-600'
                }`} />
                
                <div className="p-6">
                  {/* 题目头部 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-mono text-blue-700 bg-blue-100 px-3 py-1 rounded-full font-medium">
                          {item.code}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {item.difficulty}
                          </span>
                          <span className="mx-1">•</span>
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                            </svg>
                            优先级 {item.priority}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">{item.title}</h3>
                    </div>
                  </div>

                  {/* 描述 */}
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{item.description}</p>

                  {/* 掌握度状态 */}
                  <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold mb-4 ${
                    getStatusColor(item.masteryStats.averageTheta)
                  }`}>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        item.masteryStats.averageTheta > 50 ? 'bg-green-500' :
                        item.masteryStats.averageTheta > 0 ? 'bg-blue-500' :
                        item.masteryStats.averageTheta > -50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      {getStatusText(item.masteryStats.averageTheta)}
                    </div>
                    <span className="ml-2 text-xs opacity-80">θ={item.masteryStats.averageTheta.toFixed(1)}</span>
                  </div>

                  {/* 知识点映射 */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      涉及知识点
                    </h4>
                    <div className="space-y-2">
                      {item.knowledgeMappings.slice(0, 3).map((mapping, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700 font-medium">{mapping.conceptName}</span>
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${mapping.knowledgeWeight * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-blue-600 font-semibold">
                              {(mapping.knowledgeWeight * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 练习统计 */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
                      <div className="text-xl font-bold text-blue-700">{item.masteryStats.totalAttempts}</div>
                      <div className="text-xs text-blue-600 font-medium">练习次数</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center">
                      <div className="text-xl font-bold text-green-700">
                        {(item.masteryStats.accuracy * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-green-600 font-medium">正确率</div>
                    </div>
                  </div>

                  {/* 推荐理由 */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-400 p-3 rounded-r-lg">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-purple-700 font-medium">{item.recommendation.reason}</span>
                    </div>
                  </div>
                </div>
            </div>
          ))}
        </div>
      )}

        {parentItems.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">📚</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无推荐的母题</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {mode === 'weak' 
                ? '完成摸底考试后，我们将为您推荐最合适的薄弱概念练习'
                : '暂时没有找到符合条件的母题，请尝试其他模式'
              }
            </p>
            {mode === 'weak' && (
              <button
                onClick={() => router.push('/placement-test')}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                开始摸底考试
              </button>
            )}
          </div>
        )}
    </div>
    </div>
  )
}