'use client'

import { useMemo } from 'react'

interface SimpleMathRendererProps {
  content: string
  className?: string
}

export default function SimpleMathRenderer({ content, className = '' }: SimpleMathRendererProps) {
  
  const processedContent = useMemo(() => {
    // 简化的数学公式处理器
    let processed = content
    
    // 处理不等式组
    processed = processed.replace(
      /\$\$\\begin\{cases\}([^$]+)\\end\{cases\}\$\$/g,
      (match, cases) => {
        const lines = cases.split('\\\\').map((line: string) => line.trim()).filter(Boolean)
        const formattedLines = lines.map((line: string) => {
          // 处理每一行的数学符号
          const processedLine = line
            .replace(/>/g, '&gt;')
            .replace(/</g, '&lt;')
            .replace(/x \+ 1/g, 'x + 1')
            .replace(/2x - 3/g, '2x - 3')
          return `<div class="case-line">${processedLine}</div>`
        }).join('')
        return `<div class="math-cases"><div class="case-brace">{</div><div class="cases-content">${formattedLines}</div></div>`
      }
    )
    
    // 处理块级数学公式
    processed = processed.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
      let formatted = formula
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<span class="fraction">(<span class="numerator">$1</span>)/(<span class="denominator">$2</span>)</span>')
        .replace(/\^2/g, '<sup>2</sup>')
        .replace(/\^3/g, '<sup>3</sup>')
        .replace(/\^(\{[^}]+\})/g, '<sup>$1</sup>')
        .replace(/\^(\w)/g, '<sup>$1</sup>')
        .replace(/_(\{[^}]+\})/g, '<sub>$1</sub>')
        .replace(/_(\w)/g, '<sub>$1</sub>')
        .replace(/\\times/g, '×')
        .replace(/\\div/g, '÷')
        .replace(/\\pm/g, '±')
        .replace(/\\le/g, '≤')
        .replace(/\\ge/g, '≥')
        .replace(/\\ne/g, '≠')
        .replace(/\\approx/g, '≈')
        .replace(/\\sin/g, 'sin')
        .replace(/\\cos/g, 'cos')
        .replace(/\\tan/g, 'tan')
        .replace(/\\alpha/g, 'α')
        .replace(/\\beta/g, 'β')
        .replace(/\\theta/g, 'θ')
        .replace(/\\pi/g, 'π')
        .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
        .replace(/\{([^}]+)\}/g, '$1') // 移除多余的花括号
      
      return `<div class="math-display">${formatted}</div>`
    })
    
    // 处理行内数学公式
    processed = processed.replace(/\$([^$]+)\$/g, (match, formula) => {
      let formatted = formula
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
        .replace(/\^2/g, '²')
        .replace(/\^3/g, '³')
        .replace(/\^(\w)/g, '<sup>$1</sup>')
        .replace(/_(\w)/g, '<sub>$1</sub>')
        .replace(/\\times/g, '×')
        .replace(/\\div/g, '÷')
        .replace(/\\pm/g, '±')
        .replace(/\\le/g, '≤')
        .replace(/\\ge/g, '≥')
        .replace(/\\ne/g, '≠')
        .replace(/\\alpha/g, 'α')
        .replace(/\\beta/g, 'β')
        .replace(/\\theta/g, 'θ')
        .replace(/\\pi/g, 'π')
        .replace(/\{([^}]+)\}/g, '$1')
      
      return `<span class="math-inline">${formatted}</span>`
    })
    
    return processed
  }, [content])

  return (
    <div 
      className={`simple-math-content ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  )
}
