# 🚀 GitHub + Vercel CI/CD 配置指南

## ✅ 已完成步骤

1. ✅ 代码已推送到 GitHub: `https://github.com/LinluEdu/jicongcong-ai`
2. ✅ 项目已链接到 Vercel
3. ✅ 创建了 `vercel.json` 配置文件
4. ✅ 创建了 GitHub Actions 工作流

## 🔧 下一步配置

### 方法1: 使用 Vercel 自动部署（推荐）

这是最简单的方法，Vercel 会自动监听 GitHub 推送：

1. **访问 Vercel 控制台**：
   - 打开 [Vercel Dashboard](https://vercel.com/dashboard)
   - 选择 `jicongcong-ai` 项目
   - 进入 `Settings` → `Git`

2. **连接 GitHub 仓库**：
   - 点击 "Connect Git Repository"
   - 选择 `LinluEdu/jicongcong-ai`
   - 授权访问

3. **配置部署设置**：
   - **Production Branch**: `main`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./` (默认)
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `.next` (默认)

4. **配置环境变量**：
   - 进入 `Settings` → `Environment Variables`
   - 添加以下变量：
     ```
     AUTH_SECRET=guyUfmjss71KB32hDM4UUAvB1wkSQF8ULt1hO2rWJiA=
     NEXTAUTH_SECRET=guyUfmjss71KB32hDM4UUAvB1wkSQF8ULt1hO2rWJiA=
     NEXTAUTH_URL=https://jicongcong-ai.vercel.app
     ```

### 方法2: 使用 GitHub Actions（高级）

如果你想要更精细的控制，可以使用 GitHub Actions：

1. **获取 Vercel 配置信息**：
   ```bash
   vercel env pull .env.local
   ```

2. **在 GitHub 仓库设置 Secrets**：
   - 访问 `https://github.com/LinluEdu/jicongcong-ai/settings/secrets/actions`
   - 添加以下 secrets：
     - `VERCEL_TOKEN`: 从 Vercel 账户设置获取
     - `VERCEL_ORG_ID`: 从 `.vercel/project.json` 获取
     - `VERCEL_PROJECT_ID`: 从 `.vercel/project.json` 获取

## 🎯 测试 CI/CD

配置完成后，每次推送代码到 `main` 分支都会自动触发部署：

```bash
# 修改代码后
git add .
git commit -m "feat: 新功能"
git push origin main
```

## 📊 部署状态

- **GitHub Actions**: 查看 `.github/workflows/deploy.yml` 执行状态
- **Vercel 部署**: 在 Vercel 控制台查看部署历史
- **应用URL**: https://jicongcong-ai.vercel.app

## 🔍 监控和调试

### 1. 查看部署日志
- Vercel 控制台 → Deployments → 选择部署 → Functions Logs

### 2. 查看 GitHub Actions 日志
- GitHub 仓库 → Actions → 选择工作流运行

### 3. 环境变量检查
```bash
# 本地测试环境变量
vercel env ls
```

## 🚨 常见问题

### 1. 部署失败
- 检查构建日志中的错误信息
- 确保所有依赖都正确安装
- 验证环境变量配置

### 2. 环境变量未生效
- 确保在正确的环境（Production）中设置
- 重新部署应用
- 检查变量名拼写

### 3. 数据库连接问题
- 确保数据库URL正确
- 检查数据库权限
- 验证网络连接

## 📈 优化建议

1. **缓存优化**：
   - 使用 Vercel 的缓存功能
   - 配置 CDN 缓存策略

2. **性能监控**：
   - 启用 Vercel Analytics
   - 监控函数执行时间

3. **安全配置**：
   - 定期更新依赖
   - 使用环境变量存储敏感信息

## 🎉 完成

配置完成后，你将拥有：
- ✅ 自动化的 CI/CD 流程
- ✅ 代码推送即部署
- ✅ 环境变量管理
- ✅ 部署状态监控
- ✅ 回滚功能

现在每次推送代码到 GitHub 都会自动触发 Vercel 部署！
