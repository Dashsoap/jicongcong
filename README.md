# 智慧辅导系统 MVP++

一个基于Next.js 14+和Dify AI的智能辅导系统，支持个性化问答、自适应练习、掌握度追踪和教师管理功能。

## 🚀 MVP++ 功能特性

### 🎓 学生功能
- **AI智能问答**: 基于Dify的流式对话，支持学科和年级个性化
- **对话历史**: 自动保存对话记录，支持恢复和继续对话
- **答案缓存**: 智能缓存常见问题，提升响应速度
- **自适应练习**: 基于ELO算法的个性化题目推荐
- **掌握度追踪**: 实时θ值计算和可视化进度显示
- **多学科支持**: 数学、物理、化学等多学科内容

### 👨‍🏫 教师功能
- **班级管理**: 创建和管理班级，查看学生列表
- **作业分配**: 创建作业并分配给特定班级
- **进度监控**: 查看学生学习进度和掌握度
- **数据分析**: 班级统计和学习分析报告

### 🔧 技术特性
- **角色权限**: 学生/教师/管理员三级权限控制
- **数据持久化**: 完整的Prisma数据模型和SQLite数据库
- **审计日志**: 全面的用户操作记录和性能监控
- **错误处理**: 统一的错误处理和用户友好的提示
- **响应式设计**: 支持桌面端和移动端访问

## 📁 项目结构

```
jicongcong-ai/
├── prisma/                    # 数据库模式和种子数据
│   ├── schema.prisma         # 数据模型定义
│   └── seed.ts              # 初始化数据
├── src/
│   ├── app/                  # Next.js 14 App Router
│   │   ├── api/             # API路由
│   │   │   ├── qa/stream/   # AI问答流式接口
│   │   │   ├── practice/    # 练习题接口
│   │   │   ├── attempt/     # 答题提交接口
│   │   │   ├── mastery/     # 掌握度接口
│   │   │   └── teacher/     # 教师管理接口
│   │   ├── ask/             # 问答页面
│   │   ├── practice/        # 练习页面
│   │   ├── teacher/         # 教师控制台
│   │   └── login/           # 登录页面
│   ├── components/          # React组件
│   │   ├── Chat.tsx         # 聊天组件
│   │   ├── ConversationList.tsx  # 对话列表
│   │   └── MessageBubble.tsx     # 消息气泡
│   └── lib/                 # 工具库
│       ├── prisma.ts        # 数据库客户端
│       ├── dify.ts          # Dify API集成
│       ├── elo.ts           # ELO算法实现
│       ├── cache.ts         # 答案缓存系统
│       ├── authz.ts         # 权限控制
│       └── normalizer.ts    # 查询标准化
├── auth.ts                  # NextAuth配置
├── middleware.ts            # 路由中间件
└── types/                   # TypeScript类型定义
```

## 🛠️ 技术栈

- **前端**: Next.js 14 (App Router), React 19, TypeScript, TailwindCSS
- **后端**: Next.js API Routes, Prisma ORM, SQLite
- **认证**: NextAuth.js v5
- **AI集成**: Dify API (流式聊天) - 专用教学工作流
- **UI组件**: Radix UI, Lucide Icons, Sonner (Toast)
- **开发工具**: ESLint, TypeScript, pnpm

## 📊 数据模型

### 核心实体
- **User**: 用户信息和角色管理
- **Classroom**: 班级管理
- **Enrollment**: 用户班级关联
- **Concept**: 知识概念定义
- **Item**: 练习题目
- **Attempt**: 答题记录
- **Mastery**: 掌握度追踪(θ值)
- **Conversation/Message**: 对话历史
- **Assignment**: 作业分配
- **AnswerCache**: 答案缓存
- **AuditLog**: 审计日志

## 🚀 快速开始

### 环境要求
- Node.js 18+
- pnpm 8+

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd jicongcong-ai
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **环境配置**
   ```bash
   # 复制环境变量模板
   cp .env.example .env
   
   # 编辑环境变量
   nano .env
   ```

   必需的环境变量：
   ```env
   # 数据库
   DATABASE_URL="file:./dev.db"
   
   # NextAuth
   AUTH_SECRET="dev-secret-key-change-in-production-岭鹿AI-2024"
   NEXTAUTH_URL="http://localhost:3009"
   
   # Dify配置 (已配置专用聊天工作流)
   DIFY_API_BASE_URL="https://api.dify.ai/v1"
   DIFY_APP_ID="320891a2-42ec-4eee-b237-c79ceea5a4f8"
   DIFY_API_KEY="app-NgC9xYQyWzpPuby3ggPGDaoK"
   
   # 应用配置
   NEXT_PUBLIC_APP_NAME="岭鹿AI"
   NEXT_PUBLIC_APP_URL="http://localhost:3009"
   ```

4. **数据库初始化**
   ```bash
   # 创建数据库
   npx prisma db push
   
   # 运行种子数据
   npx tsx prisma/seed.ts
   ```

5. **启动开发服务器**
   ```bash
   pnpm dev
   ```

   访问 http://localhost:3009

### 默认账号
- **学生账号**: demo@example.com / password
- **教师账号**: teacher@example.com / teacher123

## 🔄 数据库迁移

当数据模型发生变化时：

```bash
# 生成迁移文件
npx prisma migrate dev --name migration_name

# 或者直接推送到数据库（开发环境）
npx prisma db push

# 重新生成Prisma客户端
npx prisma generate
```

## 💾 缓存系统

### 答案缓存工作原理
1. **查询标准化**: 清理用户输入，去除标点和多余空格
2. **哈希生成**: 基于`normalized_query + subject + grade`生成SHA-256哈希
3. **缓存策略**: 
   - 新对话时检查缓存，命中则流式返回缓存内容
   - 继续对话时跳过缓存，确保上下文连续性
4. **性能优化**: 缓存命中可减少90%的Dify API调用

### 缓存验证
```bash
# 测试缓存功能
curl -X POST http://localhost:3000/api/qa/stream \
  -H "Content-Type: application/json" \
  -d '{"query":"什么是二次方程","subject":"数学","grade":"八年级"}'

# 重复相同请求，第二次应该从缓存返回
```

## 🧮 ELO算法

### 掌握度计算
使用改进的ELO评分系统追踪学生掌握度：

```typescript
// θ值更新公式
θ_new = θ_old + k * (score - expected_probability)

// 预期正确率（IRT模型）
p = 1 / (1 + 10^((difficulty - θ) / 400))
```

### 自适应推荐
- **80%利用**: 优先推荐掌握度低的概念
- **20%探索**: 随机选择题目避免过拟合
- **权重考虑**: 概念重要性影响推荐优先级

## 🔐 权限控制

### 角色定义
- **STUDENT**: 访问问答和练习功能
- **TEACHER**: 管理班级和作业，查看学生进度
- **ADMIN**: 全部权限

### 路由保护
- `/ask`, `/practice`: 需要登录
- `/teacher/**`: 需要TEACHER或ADMIN角色
- API路由根据功能要求相应权限

## 📝 审计日志

系统自动记录所有重要操作：
- 用户登录/登出
- API调用（包含延迟和结果）
- 缓存命中/未命中
- 答题提交和掌握度更新
- 教师管理操作

查看审计日志：
```sql
SELECT * FROM AuditLog 
WHERE userId = 'user_id' 
ORDER BY createdAt DESC 
LIMIT 50;
```

## 🚧 开发指南

### 添加新的API端点
1. 在`src/app/api/`下创建路由文件
2. 使用`requireAuth()`或`requireTeacherAccess()`进行权限验证
3. 返回统一格式：`{ ok: boolean, data?, code?, message? }`
4. 添加审计日志记录

### 扩展数据模型
1. 修改`prisma/schema.prisma`
2. 运行`npx prisma db push`
3. 更新相关的API和组件
4. 添加种子数据（如需要）

### 自定义学科支持
1. 在`Concept`表中添加新学科数据
2. 创建对应的`Item`题目
3. 更新前端学科选择器
4. 配置Dify知识库（如需要）

## 🔍 故障排除

### 常见问题

**1. Dify API连接失败**
- 检查`DIFY_API_BASE_URL`和`DIFY_API_KEY`
- 确认Dify应用已正确配置
- 查看浏览器网络面板的错误信息

**2. 数据库连接问题**
```bash
# 重置数据库
rm prisma/dev.db
npx prisma db push
npx tsx prisma/seed.ts
```

**3. 缓存不工作**
- 检查数据库中`AnswerCache`表
- 确认查询标准化逻辑
- 查看控制台日志中的缓存命中信息

**4. 权限错误**
- 检查用户角色设置
- 确认中间件配置
- 查看审计日志了解访问尝试

### 调试技巧
```bash
# 查看数据库内容
npx prisma studio

# 检查类型错误
npx tsc --noEmit

# 运行linter
pnpm lint

# 查看实时日志
tail -f .next/server.log
```

## 📈 性能优化

### 已实现的优化
- **答案缓存**: 减少重复AI调用
- **数据库索引**: 优化查询性能
- **流式响应**: 改善用户体验
- **乐观更新**: 练习题提交的即时反馈

### 生产环境建议
- 使用PostgreSQL替代SQLite
- 配置Redis进行缓存
- 启用CDN加速静态资源
- 实现数据库连接池
- 添加监控和告警

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看[LICENSE](LICENSE)文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React全栈框架
- [Dify](https://dify.ai/) - AI应用开发平台
- [Prisma](https://prisma.io/) - 现代数据库工具包
- [NextAuth.js](https://next-auth.js.org/) - 认证解决方案
- [TailwindCSS](https://tailwindcss.com/) - 实用优先的CSS框架