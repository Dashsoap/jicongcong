/**
 * 精准ELO评分系统实现
 * 基于知识点权重的精准评分，支持母题系统
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
 * 基于知识点权重的精准ELO更新
 * @param userId 用户ID
 * @param itemId 题目ID (可选，优先使用)
 * @param parentItemId 母题ID (可选)
 * @param correct 是否答对
 * @param itemDifficulty 题目难度
 * @returns 更新结果
 */
export async function updateMasteryWithWeights(
  userId: string,
  itemId?: string,
  parentItemId?: string,
  correct?: boolean,
  itemDifficulty: number = 0
): Promise<{
  success: boolean;
  updates: Array<{
    conceptId: string;
    conceptName: string;
    oldTheta: number;
    newTheta: number;
    weight: number;
  }>;
}> {
  try {
    // 获取题目的知识点权重映射
    const mappings = await prisma.itemKnowledgeSkillMap.findMany({
      where: {
        OR: [
          ...(itemId ? [{ itemId }] : []),
          ...(parentItemId ? [{ parentItemId }] : [])
        ]
      },
      include: {
        Concept: true,
        Skill: true
      }
    })

    if (mappings.length === 0) {
      console.warn('未找到题目的知识点映射关系')
      return { success: false, updates: [] }
    }

    const updates = []

    // 按知识点分组，合并权重
    const conceptWeights = new Map<string, number>()
    mappings.forEach(mapping => {
      const currentWeight = conceptWeights.get(mapping.conceptId) || 0
      conceptWeights.set(mapping.conceptId, currentWeight + mapping.knowledgeWeight)
    })

    // 为每个关联的知识点更新掌握度
    for (const [conceptId, totalWeight] of conceptWeights) {
      const concept = mappings.find(m => m.conceptId === conceptId)?.Concept
      if (!concept) continue

      // 获取当前掌握度
      const currentMastery = await prisma.mastery.findUnique({
        where: {
          userId_conceptId: { userId, conceptId }
        }
      })

      const oldTheta = currentMastery?.theta || 0
      const attempts = currentMastery?.attempts || 0
      const correctCount = currentMastery?.correct || 0

      // 计算权重调整后的学习率
      const weightedK = 24 * totalWeight

      // 更新theta值
      const newTheta = updateTheta(oldTheta, !!correct, itemDifficulty, weightedK)
      
      // 更新数据库
      await prisma.mastery.upsert({
        where: {
          userId_conceptId: { userId, conceptId }
        },
        update: {
          theta: newTheta,
          attempts: attempts + 1,
          correct: correct ? correctCount + 1 : correctCount,
          updatedAt: new Date()
        },
        create: {
          userId,
          conceptId,
          theta: newTheta,
          attempts: 1,
          correct: correct ? 1 : 0
        }
      })

      updates.push({
        conceptId,
        conceptName: concept.name,
        oldTheta,
        newTheta,
        weight: totalWeight
      })

      console.log(`[精准ELO] 用户 ${userId} 概念 ${concept.name}(权重${totalWeight}): ${oldTheta.toFixed(2)} → ${newTheta.toFixed(2)} (${correct ? '正确' : '错误'})`)
    }

    return { success: true, updates }

  } catch (error) {
    console.error('精准ELO更新失败:', error)
    return { success: false, updates: [] }
  }
}

/**
 * 获取用户在某个概念上的掌握度
 * @param userId 用户ID
 * @param conceptId 概念ID
 * @returns 掌握度信息
 */
export async function getMastery(userId: string, conceptId: string) {
  try {
    const mastery = await prisma.mastery.findUnique({
      where: {
        userId_conceptId: { userId, conceptId }
      },
      include: {
        Concept: true
      }
    })
    
    return mastery ? {
      theta: mastery.theta,
      attempts: mastery.attempts,
      correct: mastery.correct,
      accuracy: mastery.attempts > 0 ? mastery.correct / mastery.attempts : 0,
      concept: mastery.Concept
    } : {
      theta: 0,
      attempts: 0,
      correct: 0,
      accuracy: 0,
      concept: null
    }
  } catch (error) {
    console.error('获取掌握度失败:', error)
    return { theta: 0, attempts: 0, correct: 0, accuracy: 0, concept: null }
  }
}

/**
 * 获取用户的薄弱概念（按掌握度×权重排序）
 * @param userId 用户ID
 * @param subject 学科筛选
 * @param limit 返回数量限制
 * @returns 薄弱概念列表
 */
export async function getWeakConcepts(
  userId: string, 
  subject: string = '数学',
  limit: number = 5
) {
  try {
    const masteryData = await prisma.mastery.findMany({
      where: { 
        userId,
        Concept: {
          subject
        }
      },
      include: {
        Concept: true
      },
      orderBy: [
        { theta: 'asc' },  // theta值越低越优先
      ]
    })
    
    // 计算加权评分（theta值越低，权重越高，越需要练习）
    const scoredConcepts = masteryData.map(m => ({
      conceptId: m.conceptId,
      concept: m.Concept,
      theta: m.theta,
      attempts: m.attempts,
      accuracy: m.attempts > 0 ? m.correct / m.attempts : 0,
      weightedScore: (m.Concept.weight * 100) / (Math.max(m.theta + 100, 1)), // 权重/theta的倒数关系
      priority: m.Concept.weight
    }))

    // 按加权评分排序，分数越高越需要练习
    scoredConcepts.sort((a, b) => b.weightedScore - a.weightedScore)
    
    return scoredConcepts.slice(0, limit)
  } catch (error) {
    console.error('获取薄弱概念失败:', error)
    return []
  }
}

/**
 * 获取用户总体掌握情况
 * @param userId 用户ID
 * @param subject 学科筛选
 * @returns 掌握情况统计
 */
export async function getUserMasteryOverview(userId: string, subject: string = '数学') {
  try {
    const masteries = await prisma.mastery.findMany({
      where: {
        userId,
        Concept: { subject }
      },
      include: {
        Concept: true
      }
    })

    if (masteries.length === 0) {
      return {
        totalConcepts: 0,
        averageTheta: 0,
        totalAttempts: 0,
        totalCorrect: 0,
        overallAccuracy: 0,
        strongConcepts: [],
        weakConcepts: []
      }
    }

    const totalAttempts = masteries.reduce((sum, m) => sum + m.attempts, 0)
    const totalCorrect = masteries.reduce((sum, m) => sum + m.correct, 0)
    const weightedThetaSum = masteries.reduce((sum, m) => sum + (m.theta * m.Concept.weight), 0)
    const totalWeight = masteries.reduce((sum, m) => sum + m.Concept.weight, 0)

    const strong = masteries.filter(m => m.theta > 50).map(m => ({
      concept: m.Concept.name,
      theta: m.theta,
      accuracy: m.attempts > 0 ? m.correct / m.attempts : 0
    }))

    const weak = masteries.filter(m => m.theta < -20).map(m => ({
      concept: m.Concept.name,
      theta: m.theta,
      accuracy: m.attempts > 0 ? m.correct / m.attempts : 0
    }))

    return {
      totalConcepts: masteries.length,
      averageTheta: totalWeight > 0 ? weightedThetaSum / totalWeight : 0,
      totalAttempts,
      totalCorrect,
      overallAccuracy: totalAttempts > 0 ? totalCorrect / totalAttempts : 0,
      strongConcepts: strong,
      weakConcepts: weak
    }

  } catch (error) {
    console.error('获取掌握情况概览失败:', error)
    return {
      totalConcepts: 0,
      averageTheta: 0,
      totalAttempts: 0,
      totalCorrect: 0,
      overallAccuracy: 0,
      strongConcepts: [],
      weakConcepts: []
    }
  }
}

// 兼容性：保留旧API
export async function updateMasteryAfterAttempt(
  userId: string,
  conceptId: string,
  correct: boolean,
  itemDifficulty: number
): Promise<number> {
  const currentMastery = await getMastery(userId, conceptId)
  const newTheta = updateTheta(currentMastery.theta, correct, itemDifficulty)
  
  await prisma.mastery.upsert({
    where: {
      userId_conceptId: { userId, conceptId }
    },
    update: {
      theta: newTheta,
      attempts: currentMastery.attempts + 1,
      correct: correct ? currentMastery.correct + 1 : currentMastery.correct,
      updatedAt: new Date()
    },
    create: {
      userId,
      conceptId,
      theta: newTheta,
      attempts: 1,
      correct: correct ? 1 : 0
    }
  })

  console.log(`[ELO] 用户 ${userId} 概念 ${conceptId}: ${currentMastery.theta.toFixed(2)} → ${newTheta.toFixed(2)} (${correct ? '正确' : '错误'})`)
  
  return newTheta
}