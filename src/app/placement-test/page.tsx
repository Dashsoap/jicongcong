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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {testPhase === 'intro' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                欢迎来到数学摸底考试
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                为了给您提供最合适的学习内容，我们需要了解您的数学基础。
                这个摸底考试将帮助我们为您推荐最适合的母题和练习。
              </p>

              <div className="bg-blue-50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">考试说明</h3>
                <div className="text-left space-y-2 text-blue-800">
                  <div className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-blue-200 rounded-full text-center text-sm font-medium mr-3 mt-0.5">1</span>
                    <span>本次考试共 {items.length} 道题，涵盖高一数学的主要知识点</span>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-blue-200 rounded-full text-center text-sm font-medium mr-3 mt-0.5">2</span>
                    <span>请根据您的实际水平作答，不要查阅资料</span>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-blue-200 rounded-full text-center text-sm font-medium mr-3 mt-0.5">3</span>
                    <span>如果不会做某道题，可以留空或者填写&quot;不会&quot;</span>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-blue-200 rounded-full text-center text-sm font-medium mr-3 mt-0.5">4</span>
                    <span>考试结果将用于为您个性化推荐学习内容</span>
                  </div>
                </div>
              </div>

              <button
                onClick={startTest}
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white text-lg font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                开始摸底考试
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {testPhase === 'testing' && items.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* 进度条 */}
            <div className="bg-gray-50 px-8 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  题目 {currentIndex + 1} / {items.length}
                </span>
                <span className="text-sm text-gray-500">
                  {items[currentIndex].conceptName}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
                    placeholder='请输入您的答案（如不会可填写"不会"）'
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
