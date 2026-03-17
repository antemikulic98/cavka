/**
 * XSS Protection Library
 *
 * SECURITY: Sanitize all user-generated content and database data before rendering
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Use this for any user-generated content or database data before rendering
 */
export function sanitizeHTML(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize plain text - removes all HTML tags
 * Use for vehicle names, descriptions, user names, etc.
 */
export function sanitizeText(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    KEEP_CONTENT: true, // Keep text content
  });
}

/**
 * Sanitize for safe URL attribute
 */
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const sanitized = DOMPurify.sanitize(url);

  // Additional check: must start with http(s) or /
  if (!/^(https?:\/\/|\/)/i.test(sanitized)) {
    return '';
  }

  return sanitized;
}

/**
 * React component helper for dangerouslySetInnerHTML
 * Use: <div dangerouslySetInnerHTML={createSafeHTML(content)} />
 */
export function createSafeHTML(dirty: string) {
  return {
    __html: sanitizeHTML(dirty),
  };
}

/**
 * Escape special characters for display
 * Alternative to sanitization when you want to show the exact input
 */
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
