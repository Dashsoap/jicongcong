# Dify 集成设置指南

## 概述

本项目已集成 Dify AI 聊天应用，用于提供智能学科家教服务。Dify 应用地址：
https://cloud.dify.ai/app/59063635-af04-4038-a8d2-972dec4eea87

## 快速开始

### 1. 获取 Dify API Key

1. 访问 [Dify 应用页面](https://cloud.dify.ai/app/59063635-af04-4038-a8d2-972dec4eea87)
2. 登录你的 Dify 账户
3. 在左侧菜单中选择 "API 访问"
4. 复制 API Key（格式：app-xxxxxx）

### 2. 配置环境变量

在项目根目录创建 `.env.local` 文件（如果不存在）：

```env
# Dify API 配置
DIFY_API_KEY=app-HCrh4FLjnjcUzs0S35MI4HO2

# 其他环境变量...
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 3. 测试配置

运行测试脚本验证配置：

```bash
node test-dify-integration.js
```

如果配置正确，你应该看到：
- ✅ DIFY_API_KEY 已设置
- ✅ API 连接成功！

### 4. 启动应用

```bash
npm run dev
```

## 🎉 聊天应用集成成功

**应用类型**: Dify 聊天应用（不是工作流应用）

**API 端点**: `/chat-messages`（不是 `/workflows/run`）

**请求格式**: 
```json
{
  "inputs": {
    "subject": "数学",
    "grade": "高一"
  },
  "query": "解方程：2x + 5 = 13",
  "response_mode": "blocking",
  "user": "user123"
}
```

**关键特点**:
- ✅ 支持对话连续性（conversation_id）
- ✅ 支持流式和阻塞模式
- ✅ 自动处理学科和年级上下文
- ✅ 返回结构化的教学内容

## API 使用方法

### 流式调用（推荐）

```typescript
import { askDifyTeacherStream } from '@/lib/dify';

// 流式调用示例
for await (const chunk of askDifyTeacherStream({
  query: "解方程：2x + 5 = 13",
  subject: "数学",
  grade: "初二",
  user: "user123"
})) {
  console.log('事件:', chunk.event);
  if (chunk.answer) {
    console.log('回答片段:', chunk.answer);
  }
}
```

### 阻塞调用

```typescript
import { askDifyTeacher } from '@/lib/dify';

// 阻塞调用示例
const result = await askDifyTeacher({
  query: "什么是二次函数？",
  subject: "数学",
  grade: "高一",
  user: "user123"
});

console.log('完整回答:', result.answer);
console.log('对话ID:', result.conversation_id);
console.log('Token使用:', result.metadata.usage.total_tokens);
```

### 对话连续性

```typescript
// 开始新对话
const firstResult = await askDifyTeacher({
  query: "解方程：2x + 5 = 13",
  subject: "数学",
  grade: "初二",
  user: "user123"
});

// 继续对话
const secondResult = await askDifyTeacher({
  query: "如何验证这个答案是否正确？",
  subject: "数学",
  grade: "初二",
  user: "user123",
  conversationId: firstResult.conversation_id
});
```

## 聊天应用配置

### 输入参数

聊天应用接收以下输入参数：

- `query` (必需): 学生的问题或题目
- `inputs.subject` (可选): 学科名称，默认为 "数学"，必须是以下之一：
  - 数学、语文、英语、物理、化学、生物、政治、历史、地理
- `inputs.grade` (可选): 年级，默认为 "高一"

### 提示词模板

工作流使用以下提示词模板：

```jinja2
{% set subject = subject | default("数学") %}
{% set grade = grade | default("高一") %}
{% set user_query = query | default("") %}

你是"岭鹿AI"的学科家教，面向 K12。你的目标：用【知识库命中的资料】给出
1) 正确且"可验证"的解题步骤，
2) 适合学生年级的讲解，
3) 明确告诉学生下一步练习方向。

【身份与边界】
- 学科：{{ subject }}；年级：{{ grade }}。
- 只依据我提供的资料（知识库检索片段与题干）。资料缺失或矛盾时，请明确说"我不确定"。

【题目/问题】
{{ user_query }}

【输出格式（严格遵守）】
1. **解题思路**
2. **步骤**
3. **答案**
4. **易错点/检查**
5. **参考资料**
---META---
{"subject":"{{subject}}","grade":"{{grade}}"}
```

### 输出格式

AI 会按照以下结构化格式回答：

1. **解题思路** - 分析问题的思路
2. **步骤** - 详细的解题步骤
3. **答案** - 最终答案
4. **易错点/检查** - 常见错误和检查要点
5. **参考资料** - 相关参考资料

## API 端点

### POST /api/qa/stream

流式问答接口，支持实时返回 AI 回答。

**请求体：**
```json
{
  "query": "解方程：2x + 5 = 13",
  "subject": "数学",
  "grade": "初二",
  "conversationId": "optional-conversation-id"
}
```

**响应：**
Server-Sent Events (SSE) 格式：

```
data: {"event":"workflow_started","task_id":"xxx"}

data: {"event":"agent_message","answer":"根据题目..."}

data: {"event":"message_end","metadata":{...}}
```

## 故障排除

### 常见错误

1. **401 Unauthorized**
   - 检查 API Key 是否正确
   - 确认 API Key 是否有效且未过期

2. **404 Not Found**
   - 检查工作流 ID 是否正确
   - 确认工作流是否已发布

3. **403 Forbidden**
   - 检查 API Key 权限
   - 确认账户有访问工作流的权限

4. **429 Too Many Requests**
   - 请求过于频繁，等待后重试
   - 考虑实现请求限流

### 调试建议

1. 使用测试脚本验证基本配置
2. 检查网络连接
3. 查看应用日志获取详细错误信息
4. 在开发环境中启用详细错误信息

## 性能优化

1. **缓存机制**: 相同问题的答案会被缓存，避免重复调用
2. **流式响应**: 使用流式模式获得更好的用户体验
3. **错误重试**: 自动重试失败的请求
4. **请求限流**: 防止过于频繁的请求

## 安全考虑

1. **API Key 保护**: 绝不在客户端暴露 API Key
2. **用户认证**: 确保只有授权用户可以访问 API
3. **请求验证**: 验证所有输入参数
4. **错误处理**: 不在错误信息中暴露敏感信息

## 监控和日志

应用会自动记录：
- API 调用统计
- 响应时间 (TTFT - Time to First Token)
- 错误日志
- 用户行为审计

查看日志以监控系统健康状况和性能。
