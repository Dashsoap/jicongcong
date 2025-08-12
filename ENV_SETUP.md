# 🔧 生产环境变量配置指南

## 问题诊断

你的应用已经成功部署到 Vercel，但登录功能失败的原因是缺少必要的环境变量。

## 必需的环境变量

在 Vercel 控制台中配置以下环境变量：

### 1. 访问 Vercel 控制台
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择 `jicongcong-ai` 项目
3. 进入 `Settings` → `Environment Variables`

### 2. 添加环境变量

| 变量名 | 值 | 说明 |
|--------|----|----|
| `AUTH_SECRET` | `your-super-secret-key-here` | NextAuth 密钥（必需） |
| `NEXTAUTH_SECRET` | `your-super-secret-key-here` | NextAuth 密钥（必需） |
| `NEXTAUTH_URL` | `https://jicongcong-ai.vercel.app` | 应用URL（必需） |
| `DATABASE_URL` | `your-database-url` | 数据库连接（可选，当前使用SQLite） |
| `DIFY_API_KEY` | `your-dify-api-key` | Dify API密钥（可选） |
| `DIFY_API_BASE_URL` | `https://api.dify.ai/v1` | Dify API基础URL（可选） |
| `NEXT_PUBLIC_APP_NAME` | `岭鹿AI` | 应用名称（可选） |

### 3. 快速配置步骤

#### 步骤1：生成密钥
```bash
# 生成一个安全的密钥
openssl rand -base64 32
```

#### 步骤2：在Vercel控制台添加变量
1. 变量名：`AUTH_SECRET`
2. 值：使用上面生成的密钥
3. 环境：Production, Preview, Development
4. 点击 "Add"

#### 步骤3：添加其他变量
- `NEXTAUTH_SECRET`：使用相同的密钥
- `NEXTAUTH_URL`：`https://jicongcong-ai.vercel.app`

### 4. 重新部署

配置完环境变量后，重新部署应用：

```bash
vercel --prod
```

## 测试登录

配置完成后，使用以下凭据测试登录：

- **用户名**: `demo`
- **密码**: `password`

或者：

- **用户名**: `teacher@example.com`
- **密码**: `teacher123`

## 故障排除

### 1. 如果仍然登录失败
检查 Vercel 函数日志：
1. 进入 Vercel 控制台
2. 选择 `Functions` 标签
3. 查看 `/api/auth/[...nextauth]` 函数的日志

### 2. 数据库连接问题
如果使用 SQLite，确保：
- 数据库文件在项目根目录
- 文件权限正确

### 3. 环境变量未生效
- 确保变量名拼写正确
- 确保选择了正确的环境（Production）
- 重新部署应用

## 验证配置

配置完成后，访问以下URL验证：

- 主页：https://jicongcong-ai.vercel.app
- 登录页：https://jicongcong-ai.vercel.app/login
- API状态：https://jicongcong-ai.vercel.app/api/auth/csrf

## 下一步

配置完环境变量后，你的应用应该能够：
- ✅ 正常登录
- ✅ 创建和管理对话
- ✅ 使用AI问答功能
- ✅ 删除对话

如果仍有问题，请检查 Vercel 函数日志获取详细错误信息。
