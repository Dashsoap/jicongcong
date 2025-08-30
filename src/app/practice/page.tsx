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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">加载中...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          {/* 移动端布局 */}
          <div className="flex flex-col space-y-3 sm:hidden">
            {/* 第一行：应用名称和用户信息 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-gray-900">{appName}</h1>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  智能练习
                </span>
              </div>
              
              {/* 移动端用户信息 */}
              {session && (
                <div className="flex items-center space-x-2">
                  <div className="text-xs">
                    <span className="text-gray-500">欢迎，</span>
                    <span className="font-medium text-gray-900">{session.user.name}</span>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    退出
                  </button>
                </div>
              )}
            </div>
            
            {/* 第二行：导航菜单 */}
            <nav className="flex space-x-6 border-t pt-3">
              <a 
                href="/ask" 
                className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                问答
              </a>
              <a 
                href="/practice" 
                className="px-3 py-2 text-green-600 font-medium border-b-2 border-green-600 text-sm"
              >
                练习
              </a>
            </nav>
          </div>

          {/* 桌面端布局 */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">{appName}</h1>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                智能练习
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* 导航菜单 */}
              <nav className="flex space-x-4">
                <a 
                  href="/ask" 
                  className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  问答
                </a>
                <a 
                  href="/practice" 
                  className="px-3 py-2 text-green-600 font-medium border-b-2 border-green-600"
                >
                  练习
                </a>
              </nav>

              {/* 用户信息 */}
              {session && (
                <div className="flex items-center space-x-3">
                  <div className="text-sm">
                    <span className="text-gray-500">欢迎，</span>
                    <span className="font-medium text-gray-900">{session.user.name}</span>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    退出
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 控制面板 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col space-y-4">
            {/* 第一行：基本控制 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label htmlFor="practice-subject" className="text-sm font-medium text-gray-700">学科:</label>
                  <select 
                    id="practice-subject"
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={isLoading || isSubmitting}
                  >
                    <option value="math">数学</option>
                    <option value="physics">物理</option>
                    <option value="chemistry">化学</option>
                  </select>
                </div>
                <button
                  onClick={loadPracticeItems}
                  disabled={isLoading || isSubmitting}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="重新开始练习"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      加载中...
                    </div>
                  ) : '重新开始'}
                </button>
              </div>
              
              {/* 能力值徽章 */}
              {results.length > 0 && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-600">能力值 θ:</span>
                    <span className="font-bold text-green-700 text-lg">
                      {averageTheta.toFixed(1)}
                    </span>
                    {results.length > 1 && (
                      <span className={`text-sm ${
                        results[results.length - 1].deltaTheta > 0 
                          ? 'text-green-600' 
                          : results[results.length - 1].deltaTheta < 0 
                          ? 'text-red-600' 
                          : 'text-gray-500'
                      }`}>
                        {results[results.length - 1].deltaTheta > 0 ? '↗' : 
                         results[results.length - 1].deltaTheta < 0 ? '↘' : '→'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 第二行：进度条和统计 */}
            {items.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      进度: 第 {Math.min(currentIndex + 1, items.length)} 题 / 共 {items.length} 题
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.round(((currentIndex + 1) / items.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${Math.min(((currentIndex + 1) / items.length) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                {results.length > 0 && (
                  <div className="text-sm text-gray-600">
                    已完成: {results.length} 题
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 练习内容 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">正在加载练习题...</p>
            </div>
          ) : isCompleted ? (
            /* 完成页面 */
            <div className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">练习完成！</h2>
                <p className="text-gray-600">您已完成所有练习题</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">练习总结</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{averageTheta.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">最终能力值</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{results.length}</div>
                    <div className="text-sm text-gray-600">完成题目</div>
                  </div>
                </div>
              </div>

              <button
                onClick={loadPracticeItems}
                className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium"
              >
                开始新的练习
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
            <div className="p-8 text-center text-gray-500">
              暂无练习题
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <PracticePageContent />
    </Suspense>
  )
}
