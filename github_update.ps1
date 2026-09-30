#PowerShell
#本地构建检查
npm run docs:build
npm run docs:check
#提交并推送
git add .
git commit -m "update wiki"
git push