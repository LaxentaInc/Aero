/** @type {import('next-sitemap').IConfig} */
module.exports = {
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