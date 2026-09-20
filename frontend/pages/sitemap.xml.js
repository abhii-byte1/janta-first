// pages/sitemap.xml.js
// Accessed as /sitemap.xml — returns XML, not HTML

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SITE_URL = process.env.SITE_URL || 'https://example.com';

function buildSitemap(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, lastmod, priority = '0.7' }) => `  <url>
    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
    <priority>${priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  try {
    const [artRes, catRes] = await Promise.all([
      fetch(`${API_URL}/api/articles?limit=1000`),
      fetch(`${API_URL}/api/categories`),
    ]);

    const { articles = [] } = artRes.ok ? await artRes.json() : {};
    const categories = catRes.ok ? await catRes.json() : [];

    const urls = [
      // Homepage
      { loc: `${SITE_URL}/`, priority: '1.0' },
      // Search page
      { loc: `${SITE_URL}/search`, priority: '0.5' },
    ];

    // Category pages
    for (const cat of categories) {
      urls.push({
        loc: `${SITE_URL}/category/${cat.slug}`,
        priority: '0.8',
      });
    }

    // Article pages
    for (const article of articles) {
      urls.push({
        loc: `${SITE_URL}/article/${article.slug}`,
        lastmod: article.publishedAt
          ? new Date(article.publishedAt).toISOString().split('T')[0]
          : undefined,
        priority: '0.9',
      });
    }

    const sitemap = buildSitemap(urls);

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.write(sitemap);
    res.end();
  } catch {
    res.status(500).end();
  }

  return { props: {} };
}

// No UI component needed — this route only writes raw XML
export default function SitemapXml() {
  return null;
}
