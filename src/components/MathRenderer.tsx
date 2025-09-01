'use client'

import { useEffect, useRef, useState } from 'react'

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
  const [isLoaded, setIsLoaded] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const loadMathJax = async () => {
      try {
        // 检查是否已经加载
        if (window.MathJax && window.MathJax.typesetPromise) {
          setIsLoaded(true)
          renderMath()
          return
        }

        // 配置MathJax
        window.MathJax = {
          tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']],
            processEscapes: true,
            processEnvironments: true,
            packages: {'[+]': ['ams', 'newcommand', 'configmacros']}
          },
          svg: {
            fontCache: 'global'
          },
          startup: {
            ready: () => {
              console.log('MathJax 加载完成')
              window.MathJax.startup.defaultReady()
              setIsLoaded(true)
              renderMath()
            }
          }
        }

        // 动态加载MathJax脚本
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js'
        script.async = true
        script.onload = () => {
          console.log('MathJax 脚本加载完成')
        }
        script.onerror = () => {
          console.error('MathJax 加载失败，使用回退方案')
          setIsLoaded(true)
          renderFallback()
        }
        
        document.head.appendChild(script)
      } catch (error) {
        console.error('MathJax 初始化失败:', error)
        setIsLoaded(true)
        renderFallback()
      }
    }

    const renderMath = () => {
      if (containerRef.current && window.MathJax && window.MathJax.typesetPromise) {
        try {
          // 设置内容
          containerRef.current.innerHTML = content
          
          // 渲染数学公式
          window.MathJax.typesetPromise([containerRef.current])
            .then(() => {
              console.log('数学公式渲染成功')
            })
            .catch((err: any) => {
              console.warn('MathJax渲染失败:', err)
              renderFallback()
            })
        } catch (err) {
          console.warn('MathJax渲染异常:', err)
          renderFallback()
        }
      }
    }

    const renderFallback = () => {
      if (containerRef.current) {
        // 简单的LaTeX符号替换作为回退方案
        let processedContent = content
          .replace(/\$\$([^$]+)\$\$/g, '<div class="math-display">$1</div>')
          .replace(/\$([^$]+)\$/g, '<span class="math-inline">$1</span>')
          .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
          .replace(/\\begin\{cases\}/g, '')
          .replace(/\\end\{cases\}/g, '')
          .replace(/\\\\/g, '<br/>')
        
        containerRef.current.innerHTML = processedContent
      }
    }

    loadMathJax()
  }, [content, isClient])

  // 内容变化时重新渲染
  useEffect(() => {
    if (isLoaded && isClient) {
      const timer = setTimeout(() => {
        if (window.MathJax && window.MathJax.typesetPromise) {
          renderMath()
        } else {
          renderFallback()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [content, isLoaded, isClient])

  if (!isClient) {
    return <div className={className}>加载中...</div>
  }

  return (
    <div 
      ref={containerRef}
      className={`math-content ${className}`}
      style={{
        fontSize: '18px',
        lineHeight: '1.6',
        color: 'inherit',
        minHeight: '24px'
      }}
    />
  )
}
