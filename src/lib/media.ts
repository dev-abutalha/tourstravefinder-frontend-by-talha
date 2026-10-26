const LIVE_MEDIA_BASE = 'https://tourstravelfinder.com/wp-content/uploads/';
const MEDIA_PREFIX = '/media/wp/';

export type MediaValue = string | { url?: string } | null | undefined;

/** Resolve a media path/object to the live WordPress upload URL. */
export function mediaUrl(value: MediaValue): string {
  const raw = typeof value === 'string' ? value : (value?.url ?? '');
  if (!raw) return '';
  if (raw.startsWith(MEDIA_PREFIX)) return `${LIVE_MEDIA_BASE}${raw.slice(MEDIA_PREFIX.length)}`;
  return raw;
}

/** Rewrite local `/media/wp/...` references inside arbitrary strings (e.g. HTML). */
export function rewriteMediaString(value: string): string {
  if (!value.includes(MEDIA_PREFIX)) return value;
  let out = '';
  let cursor = 0;
  while (true) {
    const idx = value.indexOf(MEDIA_PREFIX, cursor);
    if (idx === -1) {
      out += value.slice(cursor);
      break;
    }
    let start = idx;
    while (start > 0 && !/[\s"'<>()=]/.test(value[start - 1])) start -= 1;
    const prefix = value.slice(start, idx);
    if (prefix.includes('://')) {
      out += value.slice(cursor, idx + MEDIA_PREFIX.length);
    } else {
      out += value.slice(cursor, idx) + LIVE_MEDIA_BASE;
    }
    cursor = idx + MEDIA_PREFIX.length;
  }
  return out;
}
