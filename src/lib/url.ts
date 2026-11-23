export const SITE_URL = 'https://partido-plus-ultra.github.io';
export const REPO_URL = 'https://github.com/Partido-Plus-Ultra/partido-plus-ultra.github.io';

export function withBase(path: string): string {
  if (/^(https?:|mailto:|tel:|#)/i.test(path)) {
    return path;
  }
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${normalizedBase}${normalizedPath}`;
}
