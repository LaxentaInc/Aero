import { IConfig } from 'next-sitemap'

const config: IConfig = {
  siteUrl: 'https://www.laxenta.tech',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
  exclude: ['/api/*', '/server-sitemap.xml'],
  changefreq: 'daily',
  priority: 0.7,
}

export default config