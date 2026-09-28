import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../docs/.vitepress/dist/', import.meta.url))
const segments = (process.env.VITEPRESS_BASE || '/').split('/').filter(Boolean)
const base = segments.length ? `/${segments.join('/')}/` : '/'
const origin = 'https://wiki.invalid'
const failures = []
let count = 0

async function walk(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(target))
    else files.push(target)
  }
  return files
}

try {
  const files = await walk(root)
  for (const required of ['index.html', '404.html', 'about.html', 'data_public/index.html', 'data_private/index.html']) {
    if (!files.includes(path.join(root, required))) failures.push(`缺少页面：${required}`)
  }
  if (files.some(file => file.includes('构建说明_不要加进网站页面里'))) {
    failures.push('构建说明不应出现在公开站点中')
  }
  for (const file of files.filter(file => file.endsWith('.html'))) {
    count++
    const relative = path.relative(root, file).split(path.sep).join('/')
    const html = await readFile(file, 'utf8')
    const pageUrl = new URL(base + relative, origin)
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const value = match[1].replaceAll('&amp;', '&')
      if (!value || value.startsWith('#') || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) continue
      const url = new URL(value, pageUrl)
      const pathname = decodeURIComponent(url.pathname)
      if (!pathname.startsWith(base)) {
        failures.push(`${relative}: 链接未使用部署子路径 ${value}`)
        continue
      }
      let target = path.join(root, pathname.slice(base.length))
      try {
        if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html')
        if (!(await stat(target)).isFile()) throw new Error('not a file')
      } catch {
        failures.push(`${relative}: 链接或资源不存在 ${value}`)
      }
    }
  }
  if (failures.length) throw new Error([...new Set(failures)].join('\n'))
  console.log(`检查通过：${count} 个 HTML 页面，站内链接与静态资源均存在，部署路径为 ${base}`)
} catch (error) {
  console.error(`站点检查失败：\n${error.message}\n请先执行 npm run docs:build，并确保检查与构建使用相同的 VITEPRESS_BASE。`)
  process.exitCode = 1
}
