'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { toast } from 'sonner'

interface PlacementItem {
  id: string
  stem: {
    text: string
    latex: string
  }
  difficulty: number
  conceptId: string
  conceptName: string
}

interface PlacementResult {
  itemId: string
  conceptName: string
  isCorrect: boolean
  userAnswer: string
  correctAnswer: string
}

interface PlacementSummary {
  totalScore: number
  maxScore: number
  accuracy: number
  overallTheta: number
  conceptResults: Array<{
    conceptId: string
    conceptName: string
    accuracy: number
    initialTheta: number
  }>
}

export default function PlacementTestPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [items, setItems] = useState<PlacementItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<PlacementResult[]>([])
  const [summary, setSummary] = useState<PlacementSummary | null>(null)
  const [testPhase, setTestPhase] = useState<'intro' | 'testing' | 'results'>('intro')

  useEffect(() => {
    document.title = '数学摸底考试 | 岭鹿AI'
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPlacementTest()
    }
  }, [status])

  const fetchPlacementTest = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/placement-test')
      
      if (!response.ok) {
        const error = await response.json()
        if (error.code === 'ALREADY_COMPLETED') {
          toast.info('您已完成摸底考试')
          router.push('/parent-items')
          return
        }
        throw new Error(error.message || '获取摸底考试失败')
      }

      const data = await response.json()
      setItems(data.data.items)
    } catch (error) {
      console.error('获取摸底考试错误:', error)
      toast.error('获取摸底考试失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [items[currentIndex].id]: value
    }))
  }

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      const response = await fetch('/api/placement-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      })

      if (!response.ok) {
        throw new Error('提交摸底考试失败')
      }

      const data = await response.json()
      setResults(data.data.results)
      setSummary(data.data.summary)
      setTestPhase('results')
      toast.success('摸底考试完成！')
    } catch (error) {
      console.error('提交摸底考试错误:', error)
      toast.error('提交失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  const startTest = () => {
    setTestPhase('testing')
  }

  const goToParentItems = () => {
    router.push('/parent-items')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* 科技背景效果 */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>
      
      <Header />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {testPhase === 'intro' && (
          <div className="relative bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-3xl"></div>
            <div className="relative text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 mb-8 shadow-lg shadow-cyan-500/20">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-6">
                AI智能摸底考试
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                基于先进算法的个性化能力评估系统，精准分析您的数学基础，
                为您量身定制最优学习路径和精准题目推荐。
              </p>

              <div className="bg-gray-700/30 border border-gray-600/30 rounded-2xl p-8 mb-10">
                <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
                  <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  智能评估说明
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-cyan-500/20 rounded-xl flex items-center justify-center mr-4 mt-1">
                      <span className="text-cyan-400 font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="text-cyan-400 font-medium mb-1">题目数量</h4>
                      <p className="text-gray-300 text-sm">共 {items.length} 道精选题目，覆盖核心知识点</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center mr-4 mt-1">
                      <span className="text-blue-400 font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="text-blue-400 font-medium mb-1">诚信作答</h4>
                      <p className="text-gray-300 text-sm">请根据真实水平作答，确保评估准确性</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-xl flex items-center justify-center mr-4 mt-1">
                      <span className="text-purple-400 font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="text-purple-400 font-medium mb-1">答题提示</h4>
                      <p className="text-gray-300 text-sm">不确定的题目可留空或填写&quot;不会&quot;</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center mr-4 mt-1">
                      <span className="text-emerald-400 font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="text-emerald-400 font-medium mb-1">个性推荐</h4>
                      <p className="text-gray-300 text-sm">基于结果生成专属学习路径</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={startTest}
                className="group relative inline-flex items-center px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-semibold rounded-2xl hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 hover:-translate-y-1 border border-cyan-400/20"
              >
                <div className="absolute inset-0 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors"></div>
                <span className="relative flex items-center">
                  开始智能评估
                  <svg className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        )}

        {testPhase === 'testing' && items.length > 0 && (
          <div className="relative bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-3xl"></div>
            {/* 进度条 */}
            <div className="relative bg-gray-900/30 px-8 py-6 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white font-bold">{currentIndex + 1}</span>
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-white">
                      第 {currentIndex + 1} 题 / 共 {items.length} 题
                    </span>
                    <div className="text-sm text-gray-400 mt-1">
                      {items[currentIndex].conceptName} · 难度 {items[currentIndex].difficulty}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-400">
                    {Math.round(((currentIndex + 1) / items.length) * 100)}%
                  </div>
                  <div className="text-xs text-gray-400">完成进度</div>
                </div>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full transition-all duration-500 shadow-lg shadow-cyan-500/20"
                  style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
                />
              </div>
            </div>

            {/* 题目内容 */}
            <div className="p-8 md:p-12">
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    难度 {items[currentIndex].difficulty}
                  </span>
                </div>
                
                <div className="text-xl mb-6 leading-relaxed">
                  {items[currentIndex].stem.text}
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    您的答案：
                  </label>
                  <input
                    type="text"
                    value={answers[items[currentIndex].id] || ''}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="请输入您的答案（如不会可填写&quot;不会&quot;）"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  />
                </div>
              </div>

              {/* 导航按钮 */}
              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  上一题
                </button>

                <button
                  onClick={handleNext}
                  disabled={submitting}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      提交中...
                    </>
                  ) : currentIndex === items.length - 1 ? (
                    <>
                      完成考试
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      下一题
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {testPhase === 'results' && summary && (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                摸底考试完成！
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                太棒了！我们已经了解了您的数学基础，现在可以为您推荐最合适的学习内容了。
              </p>
            </div>

            {/* 成绩概览 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {summary.accuracy}%
                </div>
                <div className="text-sm text-blue-800">总体正确率</div>
              </div>
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {summary.totalScore}/{summary.maxScore}
                </div>
                <div className="text-sm text-green-800">得分</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {summary.overallTheta > 0 ? '+' : ''}{summary.overallTheta}
                </div>
                <div className="text-sm text-purple-800">能力估值 (θ)</div>
              </div>
            </div>

            {/* 各概念表现 */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">各知识点表现</h3>
              <div className="space-y-3">
                {summary.conceptResults.map((concept, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{concept.conceptName}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          正确率 {concept.accuracy}%
                        </span>
                        <span className={`text-sm font-medium px-2 py-1 rounded ${
                          concept.initialTheta > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          θ {concept.initialTheta > 0 ? '+' : ''}{concept.initialTheta}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={goToParentItems}
                className="inline-flex items-center px-8 py-3 bg-green-600 text-white text-lg font-medium rounded-xl hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
              >
                开始个性化学习
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
