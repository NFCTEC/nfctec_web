import { extname } from 'path';

export function buildDownloadFilename(displayName: string, fileUrl: string): string {
  let ext = '';
  try {
    ext = extname(new URL(fileUrl).pathname);
  } catch {
    ext = extname(fileUrl);
  }

  const safe = displayName.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'download';
  if (ext && !safe.toLowerCase().endsWith(ext.toLowerCase())) {
    return `${safe}${ext}`;
  }
  return safe;
}

/** RFC 5987 — keeps Chinese and other non-ASCII names. */
export function contentDispositionHeader(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7E]/g, '_').replace(/\\/g, '_').replace(/"/g, "'");
  const encoded = encodeURIComponent(filename);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}
