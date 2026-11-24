import type { APIRoute } from 'astro';
import { SITE_URL, withBase } from '../lib/url';

export const GET: APIRoute = ({ site }) => {
  const baseSite = site?.toString() ?? SITE_URL;
  const sitemapUrl = new URL(withBase('/sitemap.xml'), baseSite).toString();
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
