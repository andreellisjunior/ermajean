module.exports = {
  siteUrl: process.env.SITE_URL || 'https://ermajean.com',
  generateRobotsTxt: true,
  exclude: ['/twitter-image.*', '/opengraph-image.*', '/icon.*', '/design-preview/*', '/kitchen', '/recipes*', '/meal-plans*', '/shop', '/dashboard*', '/auth/*', '/api/*'],
  robotsTxtOptions: { policies: [{ userAgent: '*', allow: '/', disallow: ['/design-preview/', '/api/'] }] },
};
