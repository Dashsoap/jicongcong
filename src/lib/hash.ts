/**
 * 哈希工具函数
 * 用于生成查询的哈希值，支持缓存功能
 */

/**
 * 生成 SHA-256 哈希值
 * @param input 输入字符串
 * @returns 十六进制哈希字符串
 */
export async function sha256(input: string): Promise<string> {
  // 在 Edge Runtime 中使用 Web Crypto API
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * 为查询生成标准化哈希
 * @param normalizedQuery 标准化后的查询
 * @param subject 学科（可选）
 * @param grade 年级（可选）
 * @returns 哈希值
 */
export async function generateNormHash(
  normalizedQuery: string,
  subject?: string,
  grade?: string
): Promise<string> {
  const input = [normalizedQuery, subject || '', grade || ''].join('|')
  return await sha256(input)
}

