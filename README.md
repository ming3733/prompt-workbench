# Prompt Workbench

本地优先的提示词库和 UI 分析工作台。

## 本地运行

```bash
npm install
npm run dev
```

## GitHub Pages 部署

推送到 GitHub 仓库的 `main` 分支后，GitHub Actions 会自动构建并发布 `dist` 到 GitHub Pages。

在仓库设置里确认：

- Settings → Pages → Build and deployment → Source 选择 `GitHub Actions`

## DeepSeek

本地开发可以在 `.env.local` 里配置：

```bash
DEEPSEEK_API_KEY=your_key
DEEPSEEK_MODEL=deepseek-v4-flash
```

GitHub Pages 只支持静态前端，不会运行 `/api/analyze-ui` 中转接口。线上 DeepSeek 分析建议部署到 Vercel、Netlify Functions 或自有服务器。
