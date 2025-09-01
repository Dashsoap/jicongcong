'use client'

import { useState } from 'react'
import MathRenderer from '@/components/MathRenderer'

export default function TestMathPage() {
  const [testContent, setTestContent] = useState(`
测试数学公式渲染：

内联公式：这是一个简单的方程 $x + y = 5$

块级公式：
$$\\begin{cases} 
x + 1 > 0 \\\\ 
2x - 3 < 5 
\\end{cases}$$

复杂公式：
$$f(x) = \\frac{1}{\\sqrt{2\\pi}} e^{-\\frac{x^2}{2}}$$

三角函数：
$$\\sin^2(x) + \\cos^2(x) = 1$$

化学方程式：
$$\\ce{C2H6 + O2 -> CO2 + H2O}$$
  `)

  return (
    <div className="min-h-screen bg-gradient-primary p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">数学公式渲染测试</h1>
          <p className="text-gray-300">测试MathJax是否能正确渲染LaTeX数学公式</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 输入区域 */}
          <div className="glass-dark p-6 rounded-3xl border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">LaTeX 输入</h2>
            <textarea
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              className="w-full h-96 p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 resize-none"
              placeholder="输入包含LaTeX数学公式的文本..."
            />
          </div>
          
          {/* 渲染结果 */}
          <div className="glass-dark p-6 rounded-3xl border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">渲染结果</h2>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 min-h-96">
              <MathRenderer 
                content={testContent}
                className="text-white practice-math"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <a 
            href="/practice" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl hover:shadow-xl transition-all duration-300"
          >
            返回练习页面
          </a>
        </div>
      </div>
    </div>
  )
}
