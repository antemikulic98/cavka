/**
 * React Hook for CSRF Protection
 *
 * Automatically fetches and manages CSRF token for API requests
 */

import { useEffect, useState } from 'react';

export function useCSRF() {
  const [csrfToken, setCSRFToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCSRFToken();
  }, []);

  const fetchCSRFToken = async () => {
    try {
      const response = await fetch('/api/csrf');
      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      const data = await response.json();
      setCSRFToken(data.csrfToken);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('CSRF token fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get headers with CSRF token
   * Use this in fetch requests
   */
  const getHeaders = (additionalHeaders: Record<string, string> = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...additionalHeaders,
    };

    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }

    return headers;
  };

  /**
   * Make a protected fetch request with CSRF token
   */
  const protectedFetch = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    if (!csrfToken && !loading) {
      throw new Error('CSRF token not available');
    }

    // Wait for token if still loading
    if (loading) {
      await new Promise((resolve) => {
        const checkToken = setInterval(() => {
          if (!loading) {
            clearInterval(checkToken);
            resolve(null);
          }
        }, 100);
      });
    }

    const headers = getHeaders(options.headers as Record<string, string>);

    return fetch(url, {
      ...options,
      headers,
    });
  };

  return {
    csrfToken,
    loading,
    error,
    getHeaders,
    protectedFetch,
    refreshToken: fetchCSRFToken,
  };
}
