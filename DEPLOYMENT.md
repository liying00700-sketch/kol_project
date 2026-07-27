# GitHub Pages 部署方案与执行 TODO

## 目标

- 源码仓库：`liying00700-sketch/kol_project`
- 生产地址：`https://liying00700-sketch.github.io/kol_project/`
- 发布分支：`main`
- 发布方式：GitHub Actions → GitHub Pages

## 自动化链路

1. 开发者将代码推送到 `main`。
2. GitHub Actions 使用 Node 22 与 pnpm 10 安装锁定依赖。
3. Vite 按 `/kol_project/` 基础路径生成生产文件。
4. Actions 上传 `dist` 产物并部署到 GitHub Pages。
5. `github-pages` 环境回传正式链接。

## 执行 TODO

- [x] 检查本地 Git 状态与项目构建方式
- [x] 增加 Vite GitHub Pages 基础路径
- [x] 增加 GitHub Actions 自动部署工作流
- [x] 增加项目与部署说明
- [x] 完成生产构建验证
- [ ] 创建 Git 首次提交并添加远程仓库
- [ ] 推送 `main` 到 GitHub
- [ ] 确认 Actions 构建与 Pages 部署成功
- [ ] 回归测试首页、红人资源、产品中心、广告放大和经营驾驶舱

## GitHub 仓库设置

若首次 Actions 运行提示 Pages 尚未启用：

1. 打开仓库 `Settings → Pages`。
2. 将 `Build and deployment → Source` 设置为 `GitHub Actions`。
3. 回到 `Actions` 重新运行 `Deploy Starlink to GitHub Pages`。

工作流已启用 `configure-pages` 自动配置，通常无需额外操作。
