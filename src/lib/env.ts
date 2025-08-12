import { z } from 'zod';

// 定义环境变量验证模式
const envSchema = z.object({
  DIFY_API_BASE_URL: z.string().url('DIFY_API_BASE_URL 必须是有效的 URL'),
  DIFY_APP_ID: z.string().min(1, 'DIFY_APP_ID 不能为空'),
  DIFY_API_KEY: z.string().min(1, 'DIFY_API_KEY 不能为空'),
  NEXT_PUBLIC_APP_NAME: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

// 验证环境变量
function validateEnv() {
  try {
    return envSchema.parse({
      DIFY_API_BASE_URL: process.env.DIFY_API_BASE_URL,
      DIFY_APP_ID: process.env.DIFY_APP_ID,
      DIFY_API_KEY: process.env.DIFY_API_KEY,
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues?.map((err: any) => `${err.path.join('.')}: ${err.message}`).join('\n') || 'Unknown validation error';
      throw new Error(`环境变量配置错误:\n${errorMessages}\n\n请检查 .env 文件是否正确配置了 Dify 相关变量。`);
    }
    throw error;
  }
}

// 导出环境变量获取函数
export function getEnv() {
  return validateEnv();
}
