export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/room/', '/room2/'],
    },
    sitemap: 'https://rolevate.com/sitemap.xml',
  }
}
