/**
 * XSS helpers
 *
 * React already escapes text rendered in JSX. These helpers only strip
 * markup from strings that came from the database (vehicle names etc.)
 * so no HTML sneaks into PDFs, emails or Stripe product names.
 *
 * Deliberately dependency-free: isomorphic-dompurify pulls jsdom into the
 * server bundle, which crashed SSR of /search (ENOENT default-stylesheet.css).
 */

/** Remove all HTML tags, keep the text content. */
export function sanitizeText(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }
  return dirty
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;|&gt;/g, '')
    .trim();
}

/** Escape special characters so a string can be embedded in HTML safely. */
export function escapeHTML(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'\/]/g, (match) => htmlEscapes[match]);
}

/** Only allow http(s) or site-relative URLs. */
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }
  const trimmed = url.trim();
  if (!/^(https?:\/\/|\/)/i.test(trimmed)) {
    return '';
  }
  return trimmed;
}
