/**
 * 查询标准化工具
 * 用于将用户输入的查询标准化，以便缓存和匹配
 */

/**
 * 标准化查询字符串
 * @param query 原始查询字符串
 * @returns 标准化后的查询字符串
 */
export function normalizeQuery(query: string): string {
  return query
    .toLowerCase() // 转小写
    .trim() // 去除首尾空白
    .replace(/\s+/g, ' ') // 合并多个空格为单个空格
    .replace(/[。！？；，、：""''（）【】《》〈〉「」『』〔〕…—·\s]*$/g, '') // 去除尾部标点符号
    .replace(/^[。！？；，、：""''（）【】《》〈〉「」『』〔〕…—·\s]*/g, '') // 去除开头标点符号
}

