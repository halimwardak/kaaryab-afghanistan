const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/$/, '');
export async function api(path, { method = 'GET', body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { method, credentials: 'include', cache: 'no-store', signal,
      headers: { 'Content-Type': 'application/json', 'X-KaarYab-Request': '1', 'X-KaarYab-Language': typeof document === 'undefined' ? 'en' : document.documentElement.lang },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Cannot connect to the server. Please try again.');
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.details?.map(item => `${item.field}: ${item.message}`).join(' ') || data.error || 'The request could not be completed.');
    error.status = response.status;
    throw error;
  }
  return data;
}
