/**
 * Helper to build shareable room URLs that preserve GitHub Pages repository subpaths
 * e.g., https://username.github.io/repo-name/?room=ABCD
 */
export function getRoomShareUrl(roomCode: string): string {
  if (typeof window === 'undefined') return '';
  try {
    const url = new URL(window.location.href);
    url.hash = '';
    url.searchParams.set('room', roomCode.toUpperCase());
    return url.toString();
  } catch {
    const base = window.location.origin + window.location.pathname;
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    return `${cleanBase}?room=${roomCode.toUpperCase()}`;
  }
}
