'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { toast } from 'sonner'
import { postJSON } from '@/lib/fetcher'
import { isNumericalQuestion } from '@/lib/math'
import Header from '@/components/Header'

interface PracticeItem {
  id: string
  stem: {
    text: string
    latex?: string
  }
  difficulty: number
  conceptId: string
  subject: string
}

interface AttemptResult {
  ok: boolean
  theta: number
  previousTheta: number
  deltaTheta: number
  conceptId: string
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-primary relative overflow-hidden flex items-center justify-center">
      {/* 科技感背景效果 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>
      
      <div className="relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-6 animate-pulse-glow">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
        </div>
        <p className="text-xl text-gray-700 font-medium">智能练习加载中...</p>
      </div>
    </div>
  )
}

function PracticePageContent() {
  const { data: session, status } = useSession()
  const [items, setItems] = useState<PracticeItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState<AttemptResult[]>([])
  const [subject, setSubject] = useState('数学')
  const [isLoading, setIsLoading] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [showNumericalInput, setShowNumericalInput] = useState(false)

  const appName = process.env.NEXT_PUBLIC_APP_NAME || '岭鹿AI'

  // 设置页面标题
  useEffect(() => {
    document.title = '智能练习 | 岭鹿AI'
  }, [])

  // 客户端挂载后从 localStorage 恢复设置
  useEffect(() => {
    const savedSubject = localStorage.getItem('tutorAI_practice_subject')
    // 验证保存的学科是否有效
    const validSubjects = ['数学', '语文', '英语', '物理', '化学', '生物', '政治', '历史', '地理']
    if (savedSubject && validSubjects.includes(savedSubject)) {
      setSubject(savedSubject)
    }
  }, []) // 只在组件挂载时运行一次

  // 持久化学科设置
  useEffect(() => {
    localStorage.setItem('tutorAI_practice_subject', subject)
  }, [subject])

  // 当题目或题目索引改变时重新设置开始时间
  useEffect(() => {
    if (items.length > 0 && currentIndex < items.length) {
      setStartTime(Date.now())
    }
  }, [items.length, currentIndex])

  // 加载练习题
  const loadPracticeItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await postJSON('/api/practice/next', { subject, limit: 5 })
      setItems(data.items)
      setCurrentIndex(0)
      setResults([])
      setUserAnswer('')
      
      // 检查第一题是否是数值题
      if (data.items.length > 0) {
        setShowNumericalInput(isNumericalQuestion(data.items[0].stem.text))
      }
      
      toast.success('练习题加载成功', {
        description: `已加载 ${data.items.length} 道${subject}题目`
      })
    } catch (error) {
      console.error('加载练习题失败:', error)
      toast.error('加载失败', {
        description: '无法获取练习题，请稍后重试'
      })
    } finally {
      setIsLoading(false)
    }
  }, [subject])

  // 页面加载时获取题目
  useEffect(() => {
    loadPracticeItems()
  }, [loadPracticeItems])

  // 提交答案（支持乐观更新和回滚）
  const submitAnswer = useCallback(async (isCorrect: boolean) => {
    if (isSubmitting || currentIndex >= items.length) return

    const currentItem = items[currentIndex]
    const timeMs = startTime ? Date.now() - startTime : 0
    
    // 乐观更新：立即移动到下一题
    const nextIndex = currentIndex + 1
    const isLastItem = nextIndex >= items.length
    
    if (!isLastItem) {
      setCurrentIndex(nextIndex)
      setUserAnswer('')
      
      // 检查下一题是否是数值题
      setShowNumericalInput(isNumericalQuestion(items[nextIndex].stem.text))
    }

    setIsSubmitting(true)

    try {
      const result: AttemptResult = await postJSON('/api/attempt/submit', {
        itemId: currentItem.id,
        correct: isCorrect,
        timeMs,
      })

      // 更新结果
      setResults(prev => [...prev, result])

      // 显示结果反馈
      const deltaTheta = result.deltaTheta || 0
      const previousTheta = result.previousTheta || 0
      const currentTheta = result.theta || 0
      const thetaChange = deltaTheta > 0 ? '↑' : deltaTheta < 0 ? '↓' : '→'
      
      toast.success(isCorrect ? '回答正确！' : '继续努力！', {
        description: `能力值: ${previousTheta.toFixed(1)} ${thetaChange} ${currentTheta.toFixed(1)}`
      })

    } catch (error) {
      console.error('提交答案失败:', error)
      
      // 回滚乐观更新
      if (!isLastItem) {
        setCurrentIndex(currentIndex)
        setShowNumericalInput(isNumericalQuestion(currentItem.stem.text))
      }
      
      toast.error('提交失败', {
        description: '请检查网络连接后重试'
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitting, currentIndex, items, startTime])

  // 智能判断答案正确性（用于数值题）
  const handleNumericalSubmit = useCallback(() => {
    const currentItem = items[currentIndex]
    if (!currentItem || !userAnswer.trim()) {
      toast.warning('请输入答案')
      return
    }

    // 这里可以实现更智能的答案检查
    // 目前简化为用户自己判断
    const userConfirmed = window.confirm(`您的答案是: ${userAnswer}\n\n点击"确定"表示正确，点击"取消"表示错误`)
    submitAnswer(userConfirmed)
  }, [items, currentIndex, userAnswer, submitAnswer])

  // 渲染数学公式
  const renderMathContent = (content: string | undefined) => {
    if (!content || typeof content !== 'string') {
      return '';
    }
    return content
      .replace(/\$\$(.*?)\$\$/g, '<div class="math-block font-mono text-lg">$1</div>')
      .replace(/\$(.*?)\$/g, '<span class="math-inline font-mono">$1</span>');
  };

  // 计算平均能力值
  const averageTheta = results.length > 0 
    ? results.reduce((sum, r) => sum + r.theta, 0) / results.length 
    : 0;

  const currentItem = items[currentIndex];
  const isCompleted = currentIndex >= items.length && items.length > 0;

  // 如果还在加载认证状态，显示加载界面
  if (status === 'loading') {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gradient-primary relative overflow-hidden">
      {/* 科技感背景效果 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-32 left-1/3 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>
      
      <Header currentPage="practice" />

      {/* 主要内容 */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 控制面板 */}
        <div className="glass-dark border border-white/20 rounded-3xl shadow-2xl p-8 mb-8 animate-slide-up">
          <div className="flex flex-col space-y-6">
            {/* 头部标题 */}
            <div className="text-center mb-4">
              <div className="inline-block px-6 py-2 bg-gradient-to-r from-emerald-400/20 to-teal-500/20 rounded-full border border-emerald-400/30 mb-4">
                <span className="text-emerald-300 font-semibold">智能练习系统</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white mb-2">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  自适应练习
                </span>
              </h1>
              <p className="text-gray-300">基于ELO算法的智能题目推荐，精准匹配您的能力水平</p>
            </div>
            
            {/* 第一行：基本控制 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <label htmlFor="practice-subject" className="font-medium text-white">学科:</label>
                  <select 
                    id="practice-subject"
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)}
                    className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    disabled={isLoading || isSubmitting}
                  >
                    <option value="math" className="text-gray-900">数学</option>
                    <option value="physics" className="text-gray-900">物理</option>
                    <option value="chemistry" className="text-gray-900">化学</option>
                  </select>
                </div>
                <button
                  onClick={loadPracticeItems}
                  disabled={isLoading || isSubmitting}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-emerald-500/25 disabled:opacity-50 font-bold transition-all duration-300 hover:-translate-y-1"
                  aria-label="重新开始练习"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      加载中...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      重新开始
                    </div>
                  )}
                </button>
              </div>
              
              {/* 能力值徽章 */}
              {results.length > 0 && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364-.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-300">能力值 θ</div>
                      <div className="font-black text-white text-xl">
                        {averageTheta.toFixed(1)}
                      </div>
                    </div>
                    {results.length > 1 && (
                      <div className={`text-2xl ${
                        results[results.length - 1].deltaTheta > 0 
                          ? 'text-emerald-400' 
                          : results[results.length - 1].deltaTheta < 0 
                          ? 'text-red-400' 
                          : 'text-gray-400'
                      }`}>
                        {results[results.length - 1].deltaTheta > 0 ? '↗' : 
                         results[results.length - 1].deltaTheta < 0 ? '↘' : '→'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 第二行：进度条和统计 */}
            {items.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{Math.min(currentIndex + 1, items.length)}</span>
                    </div>
                    <div>
                      <div className="font-bold text-white">
                        第 {Math.min(currentIndex + 1, items.length)} 题 / 共 {items.length} 题
                      </div>
                      <div className="text-sm text-gray-300">
                        练习进度
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-cyan-300">
                      {Math.round(((currentIndex + 1) / items.length) * 100)}%
                    </div>
                    <div className="text-xs text-gray-400">完成度</div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden border border-gray-600/30">
                    <div 
                      className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 h-3 rounded-full transition-all duration-700 shadow-lg"
                      style={{ width: `${Math.min(((currentIndex + 1) / items.length) * 100, 100)}%` }}
                    ></div>
                  </div>
                  {/* 进度点 */}
                  <div className="absolute top-1/2 transform -translate-y-1/2 flex justify-between w-full">
                    {Array.from({ length: items.length }, (_, i) => (
                      <div 
                        key={i}
                        className={`w-2 h-2 rounded-full border transition-all duration-300 ${
                          i <= currentIndex 
                            ? 'bg-emerald-400 border-emerald-300 shadow-lg shadow-emerald-400/50' 
                            : 'bg-gray-600 border-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                {results.length > 0 && (
                  <div className="mt-4 flex justify-center">
                    <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-300 font-semibold">
                      已完成: {results.length} 题
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 练习内容 */}
        <div className="glass-dark border border-white/20 rounded-3xl shadow-2xl overflow-hidden animate-slide-up" style={{animationDelay: '200ms'}}>
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-6 animate-pulse-glow">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
              </div>
              <div className="text-xl text-white font-bold mb-2">正在加载练习题...</div>
              <div className="text-gray-300">AI正在为您精选题目</div>
            </div>
          ) : isCompleted ? (
            /* 完成页面 */
            <div className="p-12 text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30 animate-pulse-glow">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-black text-white mb-3">🎉 练习完成！</h2>
                <p className="text-gray-300 text-lg">恭喜您完成了本轮智能练习</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  练习总结
                </h3>
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center group bg-white/5 rounded-2xl p-6 border border-emerald-400/30 hover:border-emerald-400/50 transition-all duration-300">
                    <div className="text-4xl font-black text-emerald-400 mb-2">{averageTheta.toFixed(1)}</div>
                    <div className="text-emerald-300 font-semibold">最终能力值</div>
                    <div className="text-xs text-gray-400 mt-1">θ (Theta)</div>
                  </div>
                  <div className="text-center group bg-white/5 rounded-2xl p-6 border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300">
                    <div className="text-4xl font-black text-blue-400 mb-2">{results.length}</div>
                    <div className="text-blue-300 font-semibold">完成题目</div>
                    <div className="text-xs text-gray-400 mt-1">道题</div>
                  </div>
                </div>
              </div>

              <button
                onClick={loadPracticeItems}
                className="group inline-flex items-center px-10 py-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white font-bold rounded-3xl hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-500 hover:-translate-y-2"
              >
                <svg className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                开始新的练习
                <svg className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          ) : currentItem ? (
            /* 练习题 */
            <div className="p-8">
              {/* 题目头部信息 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold text-gray-800">
                      第 {currentIndex + 1} 题
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {currentItem.subject}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">难度:</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      currentItem.difficulty <= -1 ? 'bg-green-100 text-green-700' :
                      currentItem.difficulty <= 0 ? 'bg-yellow-100 text-yellow-700' :
                      currentItem.difficulty <= 1 ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {currentItem.difficulty > 0 ? '+' : ''}{currentItem.difficulty.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 题目内容 */}
              <div className="mb-8">
                <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <div 
                    className="text-lg leading-relaxed text-gray-800"
                    dangerouslySetInnerHTML={{ 
                      __html: renderMathContent(currentItem.stem.text) 
                    }}
                  />
                </div>
              </div>

              {/* 答题区域 */}
              <div className="space-y-6">
                {/* 数值输入框（智能显示） */}
                {showNumericalInput && (
                  <div>
                    <label htmlFor="numerical-answer" className="block text-sm font-medium text-gray-700 mb-2">
                      数值答案:
                    </label>
                    <div className="flex space-x-2">
                      <input
                        id="numerical-answer"
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="请输入数值答案..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={isSubmitting}
                      />
                      <button
                        onClick={handleNumericalSubmit}
                        disabled={isSubmitting || !userAnswer.trim()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="提交数值答案"
                      >
                        提交
                      </button>
                    </div>
                  </div>
                )}

                {/* 通用答案输入框 */}
                <div>
                  <label htmlFor="general-answer" className="block text-sm font-medium text-gray-700 mb-2">
                    您的答案:
                  </label>
                  <textarea
                    id="general-answer"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="请输入您的答案或解题过程..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>

                {/* 提交按钮 */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => submitAnswer(true)}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-label="标记为正确答案"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        提交中...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        正确
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => submitAnswer(false)}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label="标记为错误答案"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        提交中...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        错误
                      </div>
                    )}
                  </button>
                </div>

                <p className="text-sm text-gray-500 text-center">
                  💡 提示：根据您的答案正确性点击相应按钮，系统会智能调整题目难度
                </p>
              </div>

              {/* 能力值变化历史 */}
              {results.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">能力值变化轨迹:</h4>
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {results.map((result, index) => (
                      <div key={index} className="flex-shrink-0 text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                          (result.deltaTheta || 0) > 0 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : (result.deltaTheta || 0) < 0 
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                          {(result.deltaTheta || 0) > 0 ? '+' : ''}{(result.deltaTheta || 0).toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">θ={(result.theta || 0).toFixed(1)}</div>
                        <div className="text-xs text-gray-400">第{index + 1}题</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-xl text-gray-300 font-medium">暂无练习题</div>
              <div className="text-gray-400 mt-2">请选择学科后重新开始</div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function PracticePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PracticePageContent />
    </Suspense>
  )
}
