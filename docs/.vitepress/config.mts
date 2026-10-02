import { defineConfig } from 'vitepress'

// GitHub Actions 从 Pages 设置传入路径；本地开发默认使用根路径。
const basePath = (process.env.VITEPRESS_BASE || '/').trim().split('/').filter(Boolean).join('/')
const base = basePath ? `/${basePath}/` : '/'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Hikariers Wiki',
  description: 'Hikariers Wiki — 知识、指南与资料的汇集之地',
  base,
  head: [['meta', { name: 'theme-color', content: '#646cff' }]],
  // GitHub Pages 不提供通用的无扩展名 HTML 路由重写。
  cleanUrls: false,
  srcExclude: ['构建说明_不要加进网站页面里.md'],
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '公共数据库', link: '/data_public/' },
      { text: '额外数据库', link: '/data_private/' },
      { text: '关于', link: '/about' }
    ],
    sidebar: {
      '/data_public/': [
        {
          text: '喵星公共数据库',
          items: [
            { text: '导航页', link: '/data_public/' },
            { text: 'Hikarier.Kittens个人档案', link: '/data_public/Hikariers.md' },
			{ text: '杂项故事与设定', link: '/data_public/杂项故事.md' },
			{ text: '编年史', link: '/data_public/编年史.md' },
			{ text: '喵星系天体系统', link: '/data_public/Kittens_System.md' },
			{ text: '干员属性', link: '/data_public/干员属性.md' },
			{ text: '奇观建筑', link: '/data_public/奇观建筑.md' },

          ]
        }
      ],
      '/data_private/': [
        {
          text: '喵星内部数据库',
          items: [
		{ text: '注意事项', link: '/data_private/' },
		{ text: '历代神明日志', link: '/data_private/历代神明日志.md' },
		{ text: '米拉星系', link: '/data_private/米拉星系.md' },

		  ]
		  
        }
      ]
    },
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
              modal: {
                noResultsText: '没有找到相关结果',
                resetButtonTitle: '清除搜索',
                footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
              }
            }
          }
        }
      }
    },
    outline: { label: '本页目录', level: [2, 3] },
    docFooter: { prev: '上一篇', next: '下一篇' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '切换主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    notFound: {
      title: '页面不存在',
      quote: '这个页面可能已被移动，或还在编写中。',
      linkLabel: '返回首页',
      linkText: '返回首页'
    },
    footer: {
      message: '使用 VitePress 构建 · Hikariers Wiki',
      copyright: '数据持续更新中'
    }
  }
})
