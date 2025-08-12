import { toast } from 'sonner'

// API 响应类型定义
export interface ApiResponse<T = any> {
  ok: boolean
  data?: T
  code?: string
  message?: string
  details?: string
}

// API 错误类型
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// 统一的 fetch 包装器，处理认证和错误
export async function fetcher<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)

    // 处理 401 未授权
    if (response.status === 401) {
      toast.error('登录已过期', {
        description: '请重新登录',
      })
      
      // 跳转到登录页，保存当前页面作为回调
      const currentUrl = window.location.pathname + window.location.search
      window.location.href = `/login?callbackUrl=${encodeURIComponent(currentUrl)}`
      throw new ApiError(401, 'UNAUTHORIZED', '登录已过期')
    }

    // 处理其他 HTTP 错误状态
    if (!response.ok) {
      let errorData: ApiResponse
      
      try {
        errorData = await response.json()
      } catch {
        // 如果响应不是 JSON，创建默认错误
        errorData = {
          ok: false,
          code: `HTTP_${response.status}`,
          message: getDefaultErrorMessage(response.status),
        }
      }

      // 显示用户友好的错误消息
      if (errorData.message) {
        toast.error('请求失败', {
          description: errorData.message,
          action: errorData.details ? {
            label: '查看详情',
            onClick: () => {
              console.error('API 错误详情:', errorData.details)
              toast.info('错误详情', {
                description: errorData.details,
              })
            }
          } : undefined,
        })
      }

      throw new ApiError(
        response.status,
        errorData.code || `HTTP_${response.status}`,
        errorData.message || getDefaultErrorMessage(response.status),
        errorData.details
      )
    }

    // 处理成功响应
    const data = await response.json()
    
    // 如果响应格式是 ApiResponse，检查 ok 字段
    if (typeof data === 'object' && data !== null && 'ok' in data) {
      if (!data.ok) {
        // 业务逻辑错误
        if (data.message) {
          toast.error('操作失败', {
            description: data.message,
          })
        }
        
        throw new ApiError(
          response.status,
          data.code || 'BUSINESS_ERROR',
          data.message || '操作失败',
          data.details
        )
      }
      
      // 返回实际数据
      return data.data || data
    }

    return data
  } catch (error) {
    // 网络错误或其他异常
    if (error instanceof ApiError) {
      throw error
    }

    console.error('网络请求失败:', error)
    toast.error('网络错误', {
      description: '请检查网络连接后重试',
    })
    
    throw new ApiError(0, 'NETWORK_ERROR', '网络连接失败')
  }
}

// 获取默认错误消息
function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return '请求参数错误'
    case 401:
      return '未授权访问'
    case 403:
      return '禁止访问'
    case 404:
      return '请求的资源不存在'
    case 429:
      return '请求过于频繁，请稍后重试'
    case 500:
      return '服务器内部错误'
    case 501:
      return '服务未配置'
    case 502:
      return '网关错误'
    case 503:
      return '服务不可用'
    default:
      return '请求失败'
  }
}

// POST 请求的便捷方法
export function postJSON<T = any>(url: string, data: any): Promise<T> {
  return fetcher<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// GET 请求的便捷方法
export function getJSON<T = any>(url: string): Promise<T> {
  return fetcher<T>(url, {
    method: 'GET',
  })
}

// 带重试的 fetch（用于流式请求等场景）
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  delay = 1000
): Promise<Response> {
  let lastError: Error

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (response.ok) {
        return response
      }

      // 对于 4xx 错误，不重试
      if (response.status >= 400 && response.status < 500) {
        throw new ApiError(
          response.status,
          `HTTP_${response.status}`,
          getDefaultErrorMessage(response.status)
        )
      }

      throw new Error(`HTTP ${response.status}`)
    } catch (error) {
      lastError = error as Error
      
      // 最后一次重试失败
      if (i === maxRetries) {
        break
      }

      // 指数退避延迟
      const waitTime = delay * Math.pow(2, i)
      console.warn(`请求失败，${waitTime}ms 后重试 (${i + 1}/${maxRetries}):`, error)
      
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  throw lastError!
}

