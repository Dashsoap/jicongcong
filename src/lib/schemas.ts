import { z } from 'zod';

// 问答请求验证模式
export const AskSchema = z.object({
  query: z.string().min(1, '问题不能为空'),
  subject: z.string().optional(),
  grade: z.string().optional(),
  conversationId: z.string().nullable().optional(),
});

export type AskRequest = z.infer<typeof AskSchema>;

// 获取练习题请求验证模式
export const PracticeNextSchema = z.object({
  subject: z.string().default('数学'),
  limit: z.number().min(1).max(20).default(5),
});

export type PracticeNextRequest = z.infer<typeof PracticeNextSchema>;

// 答题提交请求验证模式
export const AttemptSchema = z.object({
  itemId: z.string().min(1, '题目ID不能为空'),
  correct: z.boolean(),
  timeMs: z.number().min(0, '答题时间不能为负数'),
});

export type AttemptRequest = z.infer<typeof AttemptSchema>;
