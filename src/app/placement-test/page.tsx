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
      {/* 增强的科技背景效果 */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_50%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
          <div className="absolute top-1/2 left-10 w-40 h-40 bg-emerald-500/15 rounded-full blur-2xl animate-pulse-glow"></div>
          <div className="absolute bottom-40 right-10 w-60 h-60 bg-pink-500/15 rounded-full blur-2xl animate-pulse-glow" style={{animationDelay: '3s'}}></div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>
      
      <Header />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {testPhase === 'intro' && (
          <div className="relative glass-dark border border-white/20 rounded-3xl shadow-2xl p-8 md:p-12 animate-slide-up">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-3xl"></div>
            
            {/* 装饰性科技元素 */}
            <div className="absolute top-6 right-6 w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-xl animate-pulse-glow"></div>
            <div className="absolute bottom-6 left-6 w-12 h-12 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-lg animate-float"></div>
            
            <div className="relative text-center">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-3xl bg-gradient-to-r from-cyan-400 to-blue-500 mb-8 shadow-2xl shadow-cyan-500/30 animate-pulse-glow">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              
              <div className="inline-block px-6 py-2 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full border border-cyan-400/30 mb-6">
                <span className="text-cyan-300 font-semibold">智能评估系统</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black mb-6">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  AI智能摸底考试
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                基于先进θ算法的个性化能力评估系统，精准分析您的数学基础，
                为您量身定制最优学习路径和精准题目推荐。开启智能学习新篇章。
              </p>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-10">
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center justify-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  智能评估说明
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300 hover:scale-105">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white font-bold text-lg">1</span>
                      </div>
                      <div>
                        <h4 className="text-cyan-300 font-bold mb-2 text-lg">题目数量</h4>
                        <p className="text-gray-300">共 {items.length} 道精选题目，覆盖核心知识点，科学评估能力水平</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/20 hover:border-blue-400/40 transition-all duration-300 hover:scale-105">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white font-bold text-lg">2</span>
                      </div>
                      <div>
                        <h4 className="text-blue-300 font-bold mb-2 text-lg">诚信作答</h4>
                        <p className="text-gray-300">请根据真实水平作答，确保AI算法能够精准评估您的能力</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-105">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white font-bold text-lg">3</span>
                      </div>
                      <div>
                        <h4 className="text-purple-300 font-bold mb-2 text-lg">答题提示</h4>
                        <p className="text-gray-300">不确定的题目可留空或填写"不会"，这有助于准确评估</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-emerald-400/20 hover:border-emerald-400/40 transition-all duration-300 hover:scale-105">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white font-bold text-lg">4</span>
                      </div>
                      <div>
                        <h4 className="text-emerald-300 font-bold mb-2 text-lg">个性推荐</h4>
                        <p className="text-gray-300">基于θ值计算生成专属学习路径和推荐方案</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={startTest}
                className="group relative inline-flex items-center px-12 py-5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white text-xl font-bold rounded-3xl hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500 hover:-translate-y-2 border border-cyan-400/30 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 rounded-3xl group-hover:bg-white/20 transition-colors"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative flex items-center">
                  <svg className="w-7 h-7 mr-3 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  开始智能评估
                  <svg className="ml-4 w-7 h-7 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        )}

        {testPhase === 'testing' && items.length > 0 && (
          <div className="relative glass-dark border border-white/20 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-3xl"></div>
            
            {/* 装饰元素 */}
            <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-xl animate-pulse-glow"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-lg animate-float"></div>
            
            {/* 进度条区域 */}
            <div className="relative bg-white/5 backdrop-blur-sm px-8 py-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mr-4 shadow-xl animate-pulse-glow">
                    <span className="text-white font-black text-lg">{currentIndex + 1}</span>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-white">
                      第 {currentIndex + 1} 题 / 共 {items.length} 题
                    </span>
                    <div className="flex items-center mt-2 space-x-3">
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full text-blue-300 text-sm font-medium border border-blue-400/30">
                        {items[currentIndex].conceptName}
                      </span>
                      <span className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full text-emerald-300 text-sm font-medium border border-emerald-400/30">
                        难度 {items[currentIndex].difficulty}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    {Math.round(((currentIndex + 1) / items.length) * 100)}%
                  </div>
                  <div className="text-sm text-gray-400 mt-1">完成进度</div>
                </div>
              </div>
              
              {/* 进度条 */}
              <div className="relative">
                <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-hidden border border-gray-600/30">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 h-4 rounded-full transition-all duration-700 shadow-lg"
                    style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
                  />
                </div>
                {/* 进度点 */}
                <div className="absolute top-1/2 transform -translate-y-1/2 flex justify-between w-full">
                  {Array.from({ length: items.length }, (_, i) => (
                    <div 
                      key={i}
                      className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                        i <= currentIndex 
                          ? 'bg-cyan-400 border-cyan-300 shadow-lg shadow-cyan-400/50' 
                          : 'bg-gray-600 border-gray-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 题目内容 */}
            <div className="relative p-8 md:p-12">
              <div className="mb-10">
                {/* 题目区域 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">题目 {currentIndex + 1}</h3>
                        <p className="text-gray-300 text-sm">{items[currentIndex].conceptName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full text-emerald-300 text-sm font-bold border border-emerald-400/30">
                        难度 {items[currentIndex].difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="text-xl text-white mb-6 leading-relaxed font-medium">
                      {items[currentIndex].stem.text}
                    </div>
                  </div>
                </div>

                {/* 答题区域 */}
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg">您的答案</h4>
                      <p className="text-gray-300 text-sm">请输入您的答案，如不确定可填写"不会"</p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      value={answers[items[currentIndex].id] || ''}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      placeholder="请输入您的答案..."
                      className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-white text-lg placeholder-gray-400 transition-all duration-300"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 导航按钮 */}
              <div className="flex justify-between items-center gap-6">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-2xl hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <svg className="mr-3 w-6 h-6 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  <span className="font-semibold text-lg">上一题</span>
                </button>

                {/* 中间显示当前进度 */}
                <div className="text-center">
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: Math.min(items.length, 5) }, (_, i) => {
                      const actualIndex = items.length <= 5 ? i : Math.floor((i / 4) * (items.length - 1));
                      return (
                        <div 
                          key={i}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            actualIndex <= currentIndex 
                              ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50' 
                              : 'bg-white/20'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  disabled={submitting}
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-1 border border-cyan-400/30"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      <span className="font-semibold text-lg">提交中...</span>
                    </>
                  ) : currentIndex === items.length - 1 ? (
                    <>
                      <svg className="mr-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-semibold text-lg">完成考试</span>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-lg">下一题</span>
                      <svg className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="relative glass-dark border border-white/20 rounded-3xl shadow-2xl p-8 md:p-12 animate-slide-up">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl"></div>
            
            {/* 庆祝效果背景 */}
            <div className="absolute top-6 right-6 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full blur-2xl animate-pulse-glow"></div>
            <div className="absolute bottom-6 left-6 w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-xl animate-float"></div>
            <div className="absolute top-1/2 right-10 w-12 h-12 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-lg animate-pulse" style={{animationDelay: '1s'}}></div>
            
            <div className="relative text-center mb-12">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 mb-8 shadow-2xl shadow-emerald-500/30 animate-pulse-glow">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <div className="inline-block px-6 py-2 bg-gradient-to-r from-emerald-400/20 to-teal-500/20 rounded-full border border-emerald-400/30 mb-6">
                <span className="text-emerald-300 font-semibold">评估完成</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black mb-6">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  摸底考试完成！
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                🎉 太棒了！AI已经精确分析了您的数学基础，现在为您生成专属的个性化学习方案。
              </p>
            </div>

            {/* 成绩概览 */}
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="group bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-4xl font-black text-blue-300 mb-3">
                  {summary.accuracy}%
                </div>
                <div className="text-blue-300 font-semibold">总体正确率</div>
              </div>
              
              <div className="group bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center border border-emerald-400/30 hover:border-emerald-400/50 transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="text-4xl font-black text-emerald-300 mb-3">
                  {summary.totalScore}/{summary.maxScore}
                </div>
                <div className="text-emerald-300 font-semibold">总得分</div>
              </div>
              
              <div className="group bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364-.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="text-4xl font-black text-purple-300 mb-3">
                  {summary.overallTheta > 0 ? '+' : ''}{summary.overallTheta.toFixed(1)}
                </div>
                <div className="text-purple-300 font-semibold">能力估值 (θ)</div>
              </div>
            </div>

            {/* 各概念表现 */}
            <div className="mb-12">
              <div className="flex items-center mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">各知识点表现分析</h3>
              </div>
              
              <div className="grid gap-4">
                {summary.conceptResults.map((concept, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mr-4">
                          <span className="text-white font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <span className="font-bold text-white text-lg">{concept.conceptName}</span>
                          <div className="text-gray-300 text-sm mt-1">知识点掌握情况</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-cyan-300">
                            {concept.accuracy}%
                          </div>
                          <div className="text-xs text-gray-400">正确率</div>
                        </div>
                        
                        <div className={`px-4 py-2 rounded-xl font-bold ${
                          concept.initialTheta > 0 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' 
                            : concept.initialTheta > -50
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                            : 'bg-red-500/20 text-red-300 border border-red-400/30'
                        }`}>
                          θ {concept.initialTheta > 0 ? '+' : ''}{concept.initialTheta.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={goToParentItems}
                className="group relative inline-flex items-center px-12 py-5 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white text-xl font-bold rounded-3xl hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-500 hover:-translate-y-2 border border-emerald-400/30 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 rounded-3xl group-hover:bg-white/20 transition-colors"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative flex items-center">
                  <svg className="w-7 h-7 mr-3 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  开始个性化学习
                  <svg className="ml-4 w-7 h-7 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
