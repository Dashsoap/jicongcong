/**
 * ELO 评分系统实现
 * 用于追踪用户在不同概念上的掌握程度（theta值）
 */

import { prisma } from './prisma'

/**
 * 更新用户的能力值 (theta)
 * @param theta 当前能力值
 * @param correct 是否答对
 * @param itemDifficulty 题目难度 (默认为0)
 * @param k 学习率 (默认为24)
 * @returns 更新后的能力值
 */
export function updateTheta(
  theta: number,
  correct: boolean,
  itemDifficulty: number = 0,
  k: number = 24
): number {
  // 计算预期正确率 (IRT模型)
  const p = 1 / (1 + Math.pow(10, (itemDifficulty - theta) / 400))
  
  // 实际得分 (1表示正确，0表示错误)
  const score = correct ? 1 : 0
  
  // 更新能力值
  const newTheta = theta + k * (score - p)
  
  return newTheta
}

/**
 * 获取用户在某个概念上的掌握度
 * @param userId 用户ID
 * @param conceptId 概念ID
 * @returns 掌握度值 (默认为0)
 */
export async function getMastery(userId: string, conceptId: string): Promise<number> {
  try {
    const mastery = await prisma.mastery.findUnique({
      where: {
        userId_conceptId: {
          userId,
          conceptId
        }
      }
    })
    
    return mastery?.theta ?? 0
  } catch (error) {
    console.error('获取掌握度失败:', error)
    return 0
  }
}

/**
 * 设置用户在某个概念上的掌握度
 * @param userId 用户ID
 * @param conceptId 概念ID
 * @param theta 掌握度值
 */
export async function setMastery(userId: string, conceptId: string, theta: number): Promise<void> {
  try {
    await prisma.mastery.upsert({
      where: {
        userId_conceptId: {
          userId,
          conceptId
        }
      },
      update: {
        theta,
        updatedAt: new Date()
      },
      create: {
        userId,
        conceptId,
        theta
      }
    })
  } catch (error) {
    console.error('设置掌握度失败:', error)
  }
}

/**
 * 更新用户答题后的掌握度
 * @param userId 用户ID
 * @param conceptId 概念ID
 * @param correct 是否答对
 * @param itemDifficulty 题目难度
 * @returns 新的theta值
 */
export async function updateMasteryAfterAttempt(
  userId: string,
  conceptId: string,
  correct: boolean,
  itemDifficulty: number
): Promise<number> {
  const currentTheta = await getMastery(userId, conceptId)
  const newTheta = updateTheta(currentTheta, correct, itemDifficulty)
  await setMastery(userId, conceptId, newTheta)
  
  console.log(`[ELO] 用户 ${userId} 概念 ${conceptId}: ${currentTheta.toFixed(2)} → ${newTheta.toFixed(2)} (${correct ? '正确' : '错误'})`)
  
  return newTheta
}

/**
 * 获取用户的薄弱概念（按掌握度×权重排序）
 * @param userId 用户ID
 * @param limit 返回数量限制
 * @returns 薄弱概念列表
 */
export async function getWeakConcepts(userId: string, limit: number = 5) {
  try {
    const masteryData = await prisma.mastery.findMany({
      where: { userId },
      include: {
        Concept: true
      },
      orderBy: {
        theta: 'asc' // 按theta值升序排列，最薄弱的在前
      },
      take: limit
    })
    
    return masteryData.map(m => ({
      conceptId: m.conceptId,
      concept: m.Concept,
      theta: m.theta,
      weightedScore: m.theta * m.Concept.weight // theta值越低，权重越高，优先级越高
    }))
  } catch (error) {
    console.error('获取薄弱概念失败:', error)
    return []
  }
}
