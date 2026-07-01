/** Extract a user-visible message from an axios/API error. */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: { message?: string | string[] }; status?: number } })
      .response?.data;
    if (Array.isArray(data?.message)) return data.message.join(', ');
    if (typeof data?.message === 'string' && data.message) return data.message;
  }

  if (err instanceof Error) {
    if (/network error|failed to fetch|ECONNREFUSED/i.test(err.message)) {
      return 'Cannot reach API server — make sure it is running (port 3000).';
    }
  }

  return fallback;
}
