# Lynn_KOL_StarLink

Lynn_KOL_StarLink 是由 StarAgent 驱动的红人营销经营系统原型，覆盖智能方案、红人和产品资源、合作执行、增长放大与 BI 经营分析。

## 在线原型

- GitHub Pages: https://liying00700-sketch.github.io/kol_project/
- Repository: https://github.com/liying00700-sketch/kol_project

## 本地开发

```bash
pnpm install
pnpm run dev
```

访问 http://localhost:5173/。

### 内容洞察 Agent

“内容洞察 Agent”已复用育见的真实评论洞察 API。它支持两种输入：

- 链接采集：由育见的只读采集适配器读取公开内容评论；
- 导入评论：粘贴逐行评论或评论 JSON，直接运行同一套确定性分析内核。

本地开发默认把 `/api/comment-analysis` 代理到 `http://localhost:3000`。先启动育见服务，再启动 StarLink；也可以通过 `YUJIAN_CONTENT_INSIGHT_ORIGIN` 指定代理地址。静态部署需要把已部署的育见 API 地址写入构建环境变量 `VITE_CONTENT_INSIGHT_API_URL`，并允许 StarLink 域名跨域访问。

内容洞察不会用演示评论替代真实采集。采集失败、覆盖不足、语境缺失或证据冲突时，页面会显示明确错误或降级为人工复核。

端到端契约测试：

```bash
node tests/content-insight-smoke.mjs
```

## 构建与部署

```bash
pnpm run build
pnpm run preview
```

推送到 `main` 后，GitHub Actions 会自动构建并部署到 GitHub Pages。完整流程见 [DEPLOYMENT.md](./DEPLOYMENT.md)。
