'use client'

import { useEffect, useRef } from 'react'

interface MathRendererProps {
  content: string
  className?: string
}

declare global {
  interface Window {
    MathJax: any
  }
}

export default function MathRenderer({ content, className = '' }: MathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 动态加载MathJax
    const loadMathJax = () => {
      if (window.MathJax) {
        renderMath()
        return
      }

      // 配置MathJax
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
          processEscapes: true,
          processEnvironments: true
        },
        options: {
          skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
          ignoreHtmlClass: 'tex2jax_ignore',
          processHtmlClass: 'tex2jax_process'
        },
        startup: {
          ready: () => {
            window.MathJax.startup.defaultReady()
            renderMath()
          }
        }
      }

      // 加载MathJax脚本
      const script = document.createElement('script')
      script.src = 'https://polyfill.io/v3/polyfill.min.js?features=es6'
      script.onload = () => {
        const mathJaxScript = document.createElement('script')
        mathJaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js'
        mathJaxScript.async = true
        document.head.appendChild(mathJaxScript)
      }
      document.head.appendChild(script)
    }

    const renderMath = () => {
      if (containerRef.current && window.MathJax) {
        // 设置内容
        containerRef.current.innerHTML = content

        // 渲染数学公式
        try {
          window.MathJax.typesetPromise([containerRef.current]).catch((err: any) => {
            console.warn('MathJax渲染失败:', err)
          })
        } catch (err) {
          console.warn('MathJax渲染失败:', err)
        }
      }
    }

    loadMathJax()
  }, [content])

  return (
    <div 
      ref={containerRef}
      className={`math-content ${className}`}
      style={{
        fontSize: '18px',
        lineHeight: '1.6',
        color: 'inherit'
      }}
    />
  )
}
