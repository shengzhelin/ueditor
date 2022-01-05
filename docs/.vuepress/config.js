module.exports = {
	base: '/LuckysheetDocs/',
	locales: {
		// 鍵名是該語言所屬的子路徑
		// 作為特例，默認語言可以使用 '/' 作為其路徑。
		'/': {
			lang: 'en-US', // 將會被設置為 <html> 的 lang 屬性
			title: 'Luckysheet Document',
			description: 'Luckysheet is an online spreadsheet like excel that is powerful, simple to configure, and completely open source.This site contains official configuration document, API, and tutorial.'
		},
		'/zh/': {
			lang: 'zh-CN',
			title: 'Luckysheet文檔',
			description: 'Luckysheet ，一款純前端類似excel的在線表格，功能強大、配置簡單、完全開源。本站包含官方配置文檔,API,教程。'
		},
		
	},
	themeConfig: {
		domain: 'https://mengshukeji.github.io/LuckysheetDemo',
		logo: '/img/logo.png',
		author: 'Luckysheet',
		// 倉庫地址
		repo: 'mengshukeji/Luckysheet',
		// 允許編輯鏈接文字
		editLinks: true,
		// 倉庫的文檔目錄 
		docsDir: 'docs',
		// 頁面滾動
		smoothScroll: true,
		locales: {
			'/': {
				selectText: 'Languages',
				label: 'English',
				ariaLabel: 'Select language',
				editLinkText: 'Edit this page on GitHub',
				lastUpdated: 'Last Updated',
				serviceWorker: {
					updatePopup: {
						message: "New content is available.",
						buttonText: "Refresh"
					}
				},
				nav: [
					{ text: 'Home', link: '/' },
					{ text: 'Guide', link: '/guide/' },
					{ text: 'Demo', link: 'https://mengshukeji.github.io/LuckysheetDemo/' },
					{
						text: 'More',
						ariaLabel: 'More',
						items: [
						  { text: 'About', link: '/about/' }
						]
					},
				],
				// 側邊欄 
				sidebar: {
					'/guide/': [
						'',
						'config',
						'sheet',
						'cell',
						'operate',
						'api',
						'resource',
						'FAQ',
						'contribute'
					],
					'/about/': [
						'',
						'sponsor',
						'company'
					],
				},
			},
			'/zh/': {
				// 多語言下拉菜單的標題
				selectText: '選擇語言',
				// 該語言在下拉菜單中的標簽
				label: '簡體中文',
				ariaLabel: '選擇語言',
				// 編輯鏈接文字
				editLinkText: '在 GitHub 上編輯此頁',
				lastUpdated: '上次更新',
				// Service Worker 的配置
				serviceWorker: {
					updatePopup: {
						message: "發現新內容可用.",
						buttonText: "刷新"
					}
				},
				// 導航欄
				nav: [
					{ text: '首頁', link: '/zh/' },
					{ text: '指南', link: '/zh/guide/' },
					{ text: '演示', link: 'https://mengshukeji.github.io/LuckysheetDemo/' },
					{
						text: '了解更多',
						ariaLabel: '了解更多',
						items: [
						  { text: '關於', link: '/zh/about/' }
						]
					},
				],
				// 側邊欄 
				sidebar: {
					'/zh/guide/': [
						'',
						'config',
						'sheet',
						'cell',
						'operate',
						'api',
						'resource',
						'FAQ',
						'contribute'
					],
					'/zh/about/': [
						'',
						'sponsor',
						'company'
					],
				},
			},
			
		},	
	},
	plugins: {
		'vuepress-plugin-baidu-autopush': {},
		'sitemap': {
			hostname: 'https://mengshukeji.github.io/LuckysheetDocs'
		},
		'vuepress-plugin-code-copy': true,
		'seo': {
			siteTitle: (_, $site) => $site.title,
			title: $page => $page.title,
			description: $page => $page.frontmatter.description,
			author: (_, $site) => $site.themeConfig.author,
			tags: $page => $page.frontmatter.tags,
			twitterCard: _ => 'summary_large_image',
			type: $page => ['guide'].some(folder => $page.regularPath.startsWith('/' + folder)) ? 'article' : 'website',
			url: (_, $site, path) => ($site.themeConfig.domain || '') + path,
			image: ($page, $site) => $page.frontmatter.image && (($site.themeConfig.domain && !$page.frontmatter.image.startsWith('http') || '') + $page.frontmatter.image),
			publishedAt: $page => $page.frontmatter.date && new Date($page.frontmatter.date),
			modifiedAt: $page => $page.lastUpdated && new Date($page.lastUpdated),
		}
	}
}