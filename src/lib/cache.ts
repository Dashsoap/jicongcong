/**
 * 答案缓存管理
 * 用于存储和检索已缓存的问答结果
 */

import { prisma } from './prisma'
import { normalizeQuery } from './normalizer'
import { generateNormHash } from './hash'

export interface CacheEntry {
  question: string
  subject?: string
  grade?: string
  answerMd: string
  meta?: any
}

/**
 * 从缓存中获取答案
 * @param query 原始查询
 * @param subject 学科
 * @param grade 年级
 * @returns 缓存的答案或 null
 */
export async function getCachedAnswer(
  query: string,
  subject?: string,
  grade?: string
): Promise<CacheEntry | null> {
  try {
    const normalizedQuery = normalizeQuery(query)
    const normHash = await generateNormHash(normalizedQuery, subject, grade)
    
    const cached = await prisma.answerCache.findUnique({
      where: { normHash }
    })
    
    if (!cached) return null
    
    return {
      question: cached.question,
      subject: cached.subject || undefined,
      grade: cached.grade || undefined,
      answerMd: cached.answerMd,
      meta: cached.meta ? JSON.parse(cached.meta) : undefined
    }
  } catch (error) {
    console.error('获取缓存答案失败:', error)
    return null
  }
}

/**
 * 将答案存储到缓存
 * @param query 原始查询
 * @param subject 学科
 * @param grade 年级
 * @param answerMd Markdown 格式的答案
 * @param meta 元数据
 */
export async function setCachedAnswer(
  query: string,
  subject: string | undefined,
  grade: string | undefined,
  answerMd: string,
  meta?: any
): Promise<void> {
  try {
    const normalizedQuery = normalizeQuery(query)
    const normHash = await generateNormHash(normalizedQuery, subject, grade)
    
    await prisma.answerCache.upsert({
      where: { normHash },
      update: {
        answerMd,
        meta: meta ? JSON.stringify(meta) : null
      },
      create: {
        normHash,
        question: query,
        subject: subject || null,
        grade: grade || null,
        answerMd,
        meta: meta ? JSON.stringify(meta) : null
      }
    })
    
    console.log(`[Cache] 答案已缓存: ${query.substring(0, 50)}...`)
  } catch (error) {
    console.error('存储缓存答案失败:', error)
  }
}

