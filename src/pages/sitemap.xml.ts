import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_URL, withBase } from '../lib/url';

export const GET: APIRoute = async () => {
  const documentos = await getCollection('documentos');
  const actas = await getCollection('actas');
  const staticPaths = [
    '/',
    '/estructura/',
    '/transparencia/',
    '/biblioteca/',
    '/militancia/',
    '/escuela-politica/',
    ...documentos.map((doc) => `/biblioteca/${doc.id}/`),
    ...actas.map((acta) => `/transparencia/actas/${acta.id}/`),
  ];

  const urls = staticPaths
    .map((path) => {
      const fullUrl = new URL(withBase(path), SITE_URL).toString();
      return `  <url>\n    <loc>${fullUrl}</loc>\n  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
