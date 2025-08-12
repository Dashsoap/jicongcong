import { NextRequest } from 'next/server'
import { auth } from '../../../../../auth'
import { askDifyTeacherStream } from '@/lib/dify'
import { AskSchema } from '@/lib/schemas'
import { getCachedAnswer, setCachedAnswer } from '@/lib/cache'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// 简单的内存限流 (生产环境应该使用 Redis 等)
const rateLimiter = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(identifier: string, windowMs = 3000, maxRequests = 1): boolean {
  const now = Date.now()
  const windowStart = now - windowMs
  
  // 清理过期的记录
  for (const [key, data] of rateLimiter.entries()) {
    if (data.resetTime < windowStart) {
      rateLimiter.delete(key)
    }
  }
  
  const current = rateLimiter.get(identifier)
  
  if (!current || current.resetTime < windowStart) {
    // 新的时间窗口
    rateLimiter.set(identifier, { count: 1, resetTime: now })
    return true
  }
  
  if (current.count >= maxRequests) {
    return false
  }
  
  current.count++
  return true
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // 检查认证状态
    const session = await auth()
    if (!session?.user) {
      return Response.json(
        {
          ok: false,
          code: 'UNAUTHORIZED',
          message: '请先登录后再使用',
        },
        { status: 401 }
      )
    }

    // 获取客户端IP进行限流
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    
    const rateLimitKey = `qa_stream:${session.user.id}:${clientIP}`
    
    // 检查限流
    if (!checkRateLimit(rateLimitKey, 3000, 1)) {
      console.warn(`[QA Stream] 限流触发: ${session.user.name} (${clientIP})`)
      return Response.json(
        {
          ok: false,
          code: 'RATE_LIMITED',
          message: '请求过于频繁，请稍后重试',
          details: '每3秒最多发送1次请求'
        },
        { status: 429 }
      )
    }
    
    // 解析请求体
    const body = await request.json()
    
    // 验证请求参数
    const { query, subject, grade, conversationId } = AskSchema.parse(body)
    
    console.log(`[QA Stream] 用户: ${session.user.name}, 用户ID: ${session.user.id}, 查询: "${query}", 学科: ${subject || '未指定'}, 年级: ${grade || '未指定'}`)
    if (conversationId) {
      console.log(`[QA Stream] 使用现有对话ID: ${conversationId}`)
    } else {
      console.log(`[QA Stream] 开始新对话`)
    }
    
    // 先检查缓存 (只在没有conversationId时检查缓存，确保对话连续性)
    if (!conversationId) {
      const cached = await getCachedAnswer(query, subject, grade)
      if (cached) {
        console.log(`[Cache] 缓存命中: ${query.substring(0, 50)}...`)
        
        // 记录审计日志
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            path: '/api/qa/stream',
            action: 'CACHE_HIT',
            detail: JSON.stringify({ query, subject, grade }),
            latencyMs: Date.now() - startTime
          }
        }).catch(console.error)
        
        // 模拟流式返回缓存内容
        const encoder = new TextEncoder()
        const stream = new ReadableStream({
          start(controller) {
            // 将缓存的Markdown内容分块发送，模拟流式响应
            const chunks = cached.answerMd.split(' ')
            let index = 0
            
            const sendChunk = () => {
              if (index < chunks.length) {
                const chunk = chunks[index] + ' '
                const data = `data: {"event":"agent_message","answer":"${chunk.replace(/"/g, '\\"')}"}\n\n`
                controller.enqueue(encoder.encode(data))
                index++
                setTimeout(sendChunk, 50) // 50ms间隔模拟流式
              } else {
                // 发送结束标记
                const endData = `data: {"event":"message_end","metadata":${JSON.stringify(cached.meta || {})}}\n\n`
                controller.enqueue(encoder.encode(endData))
                controller.close()
              }
            }
            
            sendChunk()
          }
        })
        
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        })
      }
    }
    
    // 调用 Dify 聊天应用 API
    // 使用用户邮箱作为稳定的用户标识符，而不是可能变化的数据库ID
    const stableUserId = session.user.email || session.user.name || session.user.id
    console.log(`[QA Stream] 使用稳定用户标识符: ${stableUserId}`)
    
    const difyStream = askDifyTeacherStream({
      query,
      subject,
      grade,
      user: stableUserId,
      conversationId: conversationId || undefined,
    })
    
    // 记录首字节时间 (TTFT)
    const ttft = Date.now() - startTime
    
    // 创建流响应来处理 Dify 异步生成器
    let fullAnswer = ''
    let conversationIdFromDify = conversationId
    let metadata: Record<string, unknown> = {}
    
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of difyStream) {
            // 提取对话ID（聊天应用格式）
            if (chunk.conversation_id && !conversationIdFromDify) {
              conversationIdFromDify = chunk.conversation_id as string
            }
            
            // 累积答案内容（聊天应用格式）
            if (chunk.answer) {
              fullAnswer += chunk.answer
            }
            
            // 提取元数据（聊天应用格式）
            if (chunk.event === 'message_end' && chunk.metadata) {
              metadata = chunk.metadata
            }
            
            // 转换为 SSE 格式并发送
            const sseData = `data: ${JSON.stringify({
              event: chunk.event,
              answer: chunk.answer || '',
              conversation_id: conversationIdFromDify,
              metadata: chunk.event === 'message_end' ? metadata : undefined
            })}\n\n`
            
            controller.enqueue(encoder.encode(sseData))
          }
          
          // 发送结束标记
          const endData = `data: {"event":"message_end","metadata":${JSON.stringify(metadata)}}\n\n`
          controller.enqueue(encoder.encode(endData))
          
          controller.close()
          
        } catch (error) {
          console.error('[QA Stream] Dify 流处理错误:', error)
          const errorData = `data: {"event":"error","error":"${error instanceof Error ? error.message : '未知错误'}"}\n\n`
          controller.enqueue(encoder.encode(errorData))
          controller.close()
        } finally {
          // 保存对话和消息到数据库
          try {
            if (conversationIdFromDify && fullAnswer) {
              // 查找或创建对话记录
              let conversation = await prisma.conversation.findFirst({
                where: {
                  id: conversationIdFromDify,
                  userId: session.user.id
                }
              })
              
              if (!conversation) {
                conversation = await prisma.conversation.create({
                  data: {
                    id: conversationIdFromDify,
                    userId: session.user.id,
                    subject,
                    grade
                  }
                })
              }
              
              // 保存用户消息
              await prisma.message.create({
                data: {
                  conversationId: conversationIdFromDify,
                  role: 'user',
                  content: query
                }
              })
              
              // 保存AI回复
              await prisma.message.create({
                data: {
                  conversationId: conversationIdFromDify,
                  role: 'assistant',
                  content: fullAnswer,
                  meta: Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null
                }
              })
              
              // 如果没有conversationId（新对话），则缓存答案
              if (!conversationId && fullAnswer) {
                await setCachedAnswer(query, subject, grade, fullAnswer, metadata)
              }
              
              console.log(`[QA Stream] 对话已保存: ${conversationIdFromDify}`)
            }
            
            // 记录审计日志
            await prisma.auditLog.create({
              data: {
                userId: session.user.id,
                path: '/api/qa/stream',
                action: conversationId ? 'CONVERSATION_CONTINUE' : 'DIFY_CALL',
                detail: JSON.stringify({ 
                  query, 
                  subject, 
                  grade, 
                  conversationId: conversationIdFromDify,
                  kb_hit: (metadata as any)?.kb_hit || false 
                }),
                latencyMs: Date.now() - startTime
              }
            }).catch(console.error)
            
          } catch (error) {
            console.error('[QA Stream] 保存数据失败:', error)
          }
        }
      }
    })
    
    console.log(`[QA Stream] TTFT: ${ttft}ms, 用户: ${session.user.name}`)
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
    
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error(`[QA Stream] 错误 (${duration}ms):`, error)
    
    // 检查是否是环境变量配置问题
    if (error.message?.includes('环境变量')) {
      return Response.json(
        {
          ok: false,
          code: 'DIFY_CONFIG_MISSING',
          message: 'AI 服务未正确配置',
          details: '请联系管理员检查服务配置'
        },
        { status: 501 }
      )
    }
    
    // Dify API 错误
    if (error.status) {
      return Response.json(
        {
          ok: false,
          code: `DIFY_ERROR_${error.status}`,
          message: error.status === 401 ? 'AI 服务认证失败' : 
                   error.status === 429 ? 'AI 服务请求过于频繁' :
                   error.status >= 500 ? 'AI 服务暂时不可用' : 
                   'AI 服务请求失败',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: error.status >= 500 ? 503 : 400 }
      )
    }
    
    // 网络或其他错误
    return Response.json(
      {
        ok: false,
        code: 'INTERNAL_ERROR',
        message: '服务暂时不可用，请稍后重试',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
