# Hikariers Wiki

基于 VitePress 的中文世界观 Wiki，包含公共数据库、额外数据库、全文搜索、深浅色主题和移动端阅读。已配置 GitHub Pages 自动构建与部署。

## 本地运行

使用 Node.js 22 或更高版本（推荐 Node.js 22 LTS），在本目录执行：

```sh
npm ci
npm run docs:dev
```

打开终端输出的地址。开发服务器仅用于本地编辑，不要暴露到公网。

```sh
npm run docs:build
npm run docs:check
npm run docs:preview
```

生产文件位于 `docs/.vitepress/dist/`。检查脚本会验证输出页面、站内链接和静态资源是否存在，以及构建说明是否被排除。

## 部署到 GitHub Pages

### 1. 创建仓库并上传源文件

在 GitHub 新建仓库，例如 `Hikariers_wiki`。推荐使用公开仓库以使用免费的 Pages。创建空仓库时不要勾选初始化 README，以便直接推送本地项目。

在本项目根目录执行下面的命令，将 `YOUR_USERNAME` 换成你的 GitHub 用户名，仓库名按实际情况修改：

```sh
git init
git branch -M main
git add . #日后更新
git commit -m "Prepare Hikariers Wiki for GitHub Pages" #日后更新
git remote add origin https://github.com/YOUR_USERNAME/Hikariers_wiki.git
git push -u origin main #日后更新
```

推送时需要你自己的 GitHub 登录凭据。也可以用 GitHub Desktop 发布此目录，但请确保默认分支是 `main`。

**上传整个项目源文件，而不是只上传 `docs` 文件夹。** 必须包含 `package.json`、`package-lock.json`、`scripts/` 和 `.github/workflows/deploy.yml`。`.gitignore` 已排除依赖、缓存及构建产物。

### 2. 启用 Pages

进入仓库 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。

如果首次推送时还没启用 Pages，进入 **Actions → Deploy VitePress to GitHub Pages → Run workflow**，选择 `main` 手动运行。首次失败的工作流也可在设置好 Pages 后重新运行。

### 3. 访问网站

等待 Actions 中 `build` 和 `deploy` 都成功，部署结果中的 `github-pages` 环境会显示实际网址。普通项目仓库通常是：

```text
https://YOUR_USERNAME.github.io/Hikariers_wiki/
```

如果仓库名是 `YOUR_USERNAME.github.io`，则网址通常是 `https://YOUR_USERNAME.github.io/`。工作流通过 GitHub Pages 设置自动获取部署子路径，不必在代码中填写用户名或仓库名。

后续修改 Markdown 并推送到 `main`，网站就会自动更新。不需要额外的部署 Token，也不需要维护 `gh-pages` 分支。

## 模拟仓库子路径

GitHub Actions 自动设置 `VITEPRESS_BASE`。本地默认使用 `/`；如需模拟项目仓库部署，在 PowerShell 中执行：

```powershell
$env:VITEPRESS_BASE = '/Hikariers_wiki/'
npm run docs:build
npm run docs:check
npm run docs:preview
# 预览时访问终端地址下的 /Hikariers_wiki/ 路径
# 结束后可清除变量：Remove-Item Env:VITEPRESS_BASE
```

Bash 中可分别使用 `VITEPRESS_BASE=/Hikariers_wiki/ npm run docs:build`、`VITEPRESS_BASE=/Hikariers_wiki/ npm run docs:check` 和 `VITEPRESS_BASE=/Hikariers_wiki/ npm run docs:preview`。

保留 `cleanUrls: false`，以适配 GitHub Pages 的 `.html` 页面访问，不依赖服务器重写规则。

## 维护内容

- `docs/index.md`：首页。
- `docs/data_public/`：公共数据库。
- `docs/data_private/`：额外数据库，**已按作者确认公开发布**。
- `docs/about.md`：关于页面。
- `docs/.vitepress/config.mts`：导航、侧边栏、搜索和站点配置。
- `docs/构建说明_不要加进网站页面里.md`：编写指南，已从网站构建中排除；公开源码仓库仍可查看该文件。

新增 Markdown 页面后，在配置文件侧边栏或已有页面中添加链接，然后运行构建与检查。VitePress 构建保留默认的无效文档链接检查。

## 公开范围与安全

GitHub Pages 是静态公开站点，不会验证“内部数据库”的访问权限；此命名属于世界观设定，不是安全边界。不要提交密码、Token 或真实私密资料。

当前锁定 VitePress 1.6.4。安装审计报告中，其间接依赖 Vite / esbuild 存在开发服务器相关安全告警，`npm audit` 暂未给出可用的直接修复。GitHub Pages 只托管生成的静态文件，不运行这些开发服务器；本地开发和预览也不应暴露到公网。后续升级依赖时请重新构建、检查并审计，不要盲目使用 `npm audit fix --force`。

## 常见问题

- **Actions 找不到 Pages 站点**：先在 Settings → Pages 选择 GitHub Actions，再重新运行。
- **没有自动触发部署**：确认推送的是 `main` 分支，且仓库允许使用 GitHub Actions。
- **页面样式丢失或子页面 404**：使用本项目工作流重新构建，不要把以根路径生成的旧产物上传到仓库子路径；直接访问文档时使用带 `.html` 的链接。
- **更新后仍看到旧页面**：先确认最新部署成功，再刷新浏览器缓存。
