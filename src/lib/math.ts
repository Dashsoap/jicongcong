/**
 * 简单的数学计算和答案比较工具
 */

// 数值比较的容差
const TOLERANCE = 1e-10

/**
 * 安全地计算数学表达式
 * 注意：这只是一个简单的演示实现，实际应用中应该使用更安全的数学表达式解析器
 */
export function evaluateExpression(expr: string): number | null {
  try {
    // 移除空格并验证表达式只包含安全字符
    const cleaned = expr.replace(/\s/g, '')
    
    // 只允许数字、基本运算符和括号
    if (!/^[\d+\-*/().]+$/.test(cleaned)) {
      return null
    }
    
    // 使用 Function 构造器安全地计算表达式
    // 注意：这仍然不是完全安全的，生产环境应该使用专门的数学表达式解析库
    const result = new Function(`"use strict"; return (${cleaned})`)()
    
    return typeof result === 'number' && !isNaN(result) ? result : null
  } catch {
    return null
  }
}

/**
 * 比较两个数值是否相等（考虑浮点数精度）
 */
export function numbersEqual(a: number, b: number, tolerance = TOLERANCE): boolean {
  return Math.abs(a - b) <= tolerance
}

/**
 * 解析用户输入的答案，支持多种格式
 */
export function parseAnswer(input: string): number | null {
  if (!input || typeof input !== 'string') {
    return null
  }

  // 移除空格
  const cleaned = input.trim()
  
  // 尝试直接解析为数字
  const directNumber = parseFloat(cleaned)
  if (!isNaN(directNumber)) {
    return directNumber
  }

  // 尝试作为数学表达式计算
  return evaluateExpression(cleaned)
}

/**
 * 检查答案是否正确
 */
export function checkAnswer(
  userInput: string, 
  correctAnswer: number | string,
  tolerance = TOLERANCE
): boolean {
  const userNumber = parseAnswer(userInput)
  if (userNumber === null) {
    return false
  }

  let targetNumber: number
  if (typeof correctAnswer === 'string') {
    const parsed = parseAnswer(correctAnswer)
    if (parsed === null) {
      return false
    }
    targetNumber = parsed
  } else {
    targetNumber = correctAnswer
  }

  return numbersEqual(userNumber, targetNumber, tolerance)
}

/**
 * 格式化数字显示
 */
export function formatNumber(num: number, decimals = 2): string {
  if (Number.isInteger(num)) {
    return num.toString()
  }
  
  return num.toFixed(decimals).replace(/\.?0+$/, '')
}

/**
 * 检查题目是否可能是数值计算题
 */
export function isNumericalQuestion(question: string): boolean {
  const numericalKeywords = [
    '计算', '求', '等于', '多少', '值', '解',
    '=', '+', '-', '×', '÷', '*', '/',
    '面积', '体积', '速度', '时间', '距离',
  ]
  
  return numericalKeywords.some(keyword => 
    question.includes(keyword)
  )
}

/**
 * 从题目中提取可能的正确答案（简单的正则匹配）
 */
export function extractAnswerFromQuestion(question: string): number | null {
  // 查找形如 "答案是 X" 或 "= X" 的模式
  const patterns = [
    /答案[是为]?\s*([+-]?\d+(?:\.\d+)?)/,
    /等于\s*([+-]?\d+(?:\.\d+)?)/,
    /=\s*([+-]?\d+(?:\.\d+)?)/,
    /结果[是为]?\s*([+-]?\d+(?:\.\d+)?)/,
  ]

  for (const pattern of patterns) {
    const match = question.match(pattern)
    if (match) {
      const num = parseFloat(match[1])
      if (!isNaN(num)) {
        return num
      }
    }
  }

  return null
}

