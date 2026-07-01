/** Convert legacy section array or HTML string for display/editing. */
export type PostBodySection = { heading?: string; text: string };

export function bodyToHtml(body: unknown): string {
  if (typeof body === 'string') return body;
  if (!Array.isArray(body)) return '';
  return (body as PostBodySection[])
    .map((s) => {
      const h = s.heading?.trim() ? `<h2>${escapeHtml(s.heading)}</h2>` : '';
      const p = s.text?.trim() ? `<p>${escapeHtml(s.text).replace(/\n/g, '<br>')}</p>` : '';
      return `${h}${p}`;
    })
    .join('');
}

export function isHtmlBody(body: unknown): body is string {
  return typeof body === 'string';
}

export function isSectionBody(body: unknown): body is PostBodySection[] {
  return Array.isArray(body);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
