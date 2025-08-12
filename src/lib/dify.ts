// Dify 聊天应用 API 接口
interface DifyChatRequest {
  inputs: {
    subject?: string;
    grade?: string;
    query: string;
  };
  query: string;
  response_mode: 'blocking' | 'streaming';
  user: string;
  conversation_id?: string;
  files?: Array<{
    type: string;
    transfer_method: string;
    url?: string;
    upload_file_id?: string;
  }>;
}

// Dify 工作流 API 接口（保留兼容性）
interface DifyWorkflowRequest {
  inputs: {
    subject?: string;
    grade?: string;
    query: string;
  };
  response_mode: 'blocking' | 'streaming';
  user: string;
  conversation_id?: string;
  files?: Array<{
    type: string;
    transfer_method: string;
    url?: string;
    upload_file_id?: string;
  }>;
}

// Dify 聊天应用响应接口
interface DifyChatResponse {
  id: string;
  object: string;
  created_at: number;
  conversation_id: string;
  answer: string;
  metadata: {
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    retriever_resources?: Array<{
      position: number;
      dataset_id: string;
      dataset_name: string;
      document_id: string;
      document_name: string;
      data_source_type: string;
      segment_id: string;
      score: number;
      content: string;
    }>;
  };
}

// Dify 工作流响应接口（保留兼容性）
interface DifyWorkflowResponse {
  workflow_run_id: string;
  task_id: string;
  data: {
    id: string;
    workflow_id: string;
    status: string;
    outputs: {
      answer?: string;
      [key: string]: unknown;
    };
    error?: string;
    elapsed_time: number;
    total_tokens: number;
    total_steps: number;
    created_at: number;
    finished_at: number;
  };
}

interface DifyStreamResponse {
  event: string;
  task_id?: string;
  id?: string;
  conversation_id?: string;
  answer?: string;
  metadata?: Record<string, unknown>;
  data?: {
    outputs?: {
      answer?: string;
      [key: string]: unknown;
    };
    status?: string;
    error?: string;
    [key: string]: unknown;
  };
}

class DifyClient {
  private apiKey: string;
  private baseUrl: string;
  private appId: string;

  constructor() {
    this.apiKey = process.env.DIFY_API_KEY || '';
    this.baseUrl = 'https://api.dify.ai/v1';
    // 更新为聊天应用 ID
    this.appId = '59063635-af04-4038-a8d2-972dec4eea87';
    
    if (!this.apiKey) {
      console.warn('DIFY_API_KEY 环境变量未设置');
    }
  }

  /**
   * 调用 Dify 聊天应用 - 阻塞模式
   */
  async runChat(params: {
    query: string;
    subject?: string;
    grade?: string;
    user?: string;
    conversationId?: string;
  }): Promise<DifyChatResponse> {
    const { query, subject = '数学', grade = '高一', user = 'anonymous', conversationId } = params;

    const requestBody: DifyChatRequest = {
      inputs: {
        subject,
        grade,
        query
      },
      query,
      response_mode: 'blocking',
      user,
      ...(conversationId && { conversation_id: conversationId })
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat-messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Dify 聊天 API 错误 (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Dify 聊天调用失败:', error);
      throw error;
    }
  }

  /**
   * 调用 Dify 工作流 - 阻塞模式（保留兼容性）
   */
  async runWorkflow(params: {
    query: string;
    subject?: string;
    grade?: string;
    user?: string;
    conversationId?: string;
  }): Promise<DifyWorkflowResponse> {
    const { query, subject = '数学', grade = '高一', user = 'anonymous', conversationId } = params;

    const requestBody: DifyWorkflowRequest = {
      inputs: {
        subject,
        grade,
        query
      },
      response_mode: 'blocking',
      user,
      ...(conversationId && { conversation_id: conversationId })
    };

    try {
      const response = await fetch(`${this.baseUrl}/workflows/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Dify 工作流 API 错误 (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Dify 工作流调用失败:', error);
      throw error;
    }
  }

  /**
   * 调用 Dify 聊天应用 - 流式模式
   */
  async *runChatStream(params: {
    query: string;
    subject?: string;
    grade?: string;
    user?: string;
    conversationId?: string;
  }): AsyncGenerator<DifyStreamResponse, void, unknown> {
    const { query, subject = '数学', grade = '高一', user = 'anonymous', conversationId } = params;

    const requestBody: DifyChatRequest = {
      inputs: {
        subject,
        grade,
        query
      },
      query,
      response_mode: 'streaming',
      user,
      ...(conversationId && { conversation_id: conversationId })
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat-messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Dify 聊天流式 API 错误 (${response.status}): ${errorText}`);
      }

      if (!response.body) {
        throw new Error('响应体为空');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // 将新数据添加到缓冲区
          buffer += decoder.decode(value, { stream: true });
          
          // 按行分割，但保留最后一个可能不完整的行
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保存最后一个可能不完整的行
          
          for (const line of lines) {
            if (line.trim() && line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6).trim();
                if (jsonStr) {
                  const data = JSON.parse(jsonStr);
                  yield data;
                }
              } catch (parseError) {
                console.warn('解析聊天流数据失败:', parseError, '原始数据:', line);
              }
            }
          }
        }
        
        // 处理缓冲区中剩余的数据
        if (buffer.trim() && buffer.startsWith('data: ')) {
          try {
            const jsonStr = buffer.slice(6).trim();
            if (jsonStr) {
              const data = JSON.parse(jsonStr);
              yield data;
            }
          } catch (parseError) {
            console.warn('解析最后的聊天流数据失败:', parseError, '原始数据:', buffer);
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Dify 聊天流式调用失败:', error);
      throw error;
    }
  }

  /**
   * 调用 Dify 工作流 - 流式模式（保留兼容性）
   */
  async *runWorkflowStream(params: {
    query: string;
    subject?: string;
    grade?: string;
    user?: string;
    conversationId?: string;
  }): AsyncGenerator<DifyStreamResponse, void, unknown> {
    const { query, subject = '数学', grade = '高一', user = 'anonymous', conversationId } = params;

    const requestBody: DifyWorkflowRequest = {
      inputs: {
        subject,
        grade,
        query
      },
      response_mode: 'streaming',
      user,
      ...(conversationId && { conversation_id: conversationId })
    };

    try {
      const response = await fetch(`${this.baseUrl}/workflows/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Dify API 错误 (${response.status}): ${errorText}`);
      }

      if (!response.body) {
        throw new Error('响应体为空');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // 将新数据添加到缓冲区
          buffer += decoder.decode(value, { stream: true });
          
          // 按行分割，但保留最后一个可能不完整的行
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保存最后一个可能不完整的行
          
          for (const line of lines) {
            if (line.trim() && line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6).trim();
                if (jsonStr) {
                  const data = JSON.parse(jsonStr);
                  yield data;
                }
              } catch (parseError) {
                console.warn('解析工作流流数据失败:', parseError, '原始数据:', line);
              }
            }
          }
        }
        
        // 处理缓冲区中剩余的数据
        if (buffer.trim() && buffer.startsWith('data: ')) {
          try {
            const jsonStr = buffer.slice(6).trim();
            if (jsonStr) {
              const data = JSON.parse(jsonStr);
              yield data;
            }
          } catch (parseError) {
            console.warn('解析最后的工作流流数据失败:', parseError, '原始数据:', buffer);
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Dify 流式工作流调用失败:', error);
      throw error;
    }
  }

  /**
   * 获取工作流运行状态
   */
  async getWorkflowRunStatus(workflowRunId: string): Promise<{
    id: string;
    workflow_id: string;
    status: string;
    outputs: Record<string, unknown>;
    error?: string;
    elapsed_time: number;
    total_tokens: number;
    total_steps: number;
    created_at: number;
    finished_at: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/workflows/runs/${workflowRunId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`获取工作流状态失败 (${response.status}): ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取工作流状态失败:', error);
      throw error;
    }
  }
}

// 创建单例实例
export const difyClient = new DifyClient();

// 导出类型
export type { DifyChatRequest, DifyChatResponse, DifyWorkflowRequest, DifyWorkflowResponse, DifyStreamResponse };

// 便捷函数 - 聊天应用（推荐）
export async function askDifyTeacher(params: {
  query: string;
  subject?: string;
  grade?: string;
  user?: string;
  conversationId?: string;
}) {
  return await difyClient.runChat(params);
}

export async function* askDifyTeacherStream(params: {
  query: string;
  subject?: string;
  grade?: string;
  user?: string;
  conversationId?: string;
}) {
  yield* difyClient.runChatStream(params);
}

// 工作流便捷函数（保留兼容性）
export async function askDifyWorkflow(params: {
  query: string;
  subject?: string;
  grade?: string;
  user?: string;
  conversationId?: string;
}) {
  return await difyClient.runWorkflow(params);
}

export async function* askDifyWorkflowStream(params: {
  query: string;
  subject?: string;
  grade?: string;
  user?: string;
  conversationId?: string;
}) {
  yield* difyClient.runWorkflowStream(params);
}