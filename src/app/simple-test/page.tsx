'use client'

import SimpleMathRenderer from '@/components/SimpleMathRenderer'

export default function SimpleTestPage() {
  const testFormula = "解不等式组：$$\\begin{cases} x + 1 > 0 \\\\ 2x - 3 < 5 \\end{cases}$$"
  
  return (
    <div className="min-h-screen bg-slate-800 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg">
        <h1 className="text-2xl font-bold mb-4">简单数学公式测试</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">原始LaTeX:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm">{testFormula}</pre>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">渲染结果:</h2>
          <div className="border p-4 rounded bg-gray-50">
            <SimpleMathRenderer content={testFormula} />
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">其他测试:</h2>
          <div className="space-y-4">
            <div className="border p-4 rounded bg-gray-50">
              <SimpleMathRenderer content="已知函数 $f(x) = 2x^2 - 4x + 1$，求函数的最小值。" />
            </div>
            <div className="border p-4 rounded bg-gray-50">
              <SimpleMathRenderer content="解方程：$\\frac{x+1}{x-2} = \\frac{3}{4}$" />
            </div>
          </div>
        </div>
        
        <a href="/practice" className="text-blue-500 hover:underline">
          返回练习页面
        </a>
      </div>
    </div>
  )
}
