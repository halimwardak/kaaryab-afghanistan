// Configuration only: never infer trust from Host, Origin or forwarded headers.
export function buildTrustedOrigins(frontendUrl, additionalOrigins = '', production = false) {
  const values = [frontendUrl, ...additionalOrigins.split(',').map(value => value.trim()).filter(Boolean)];
  return new Set(values.map(value => {
    let url;
    try { url = new URL(value); } catch { throw new Error('Trusted origins must be absolute HTTP(S) URLs.'); }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
        url.hostname.includes('*') || url.pathname !== '/' || url.search || url.hash ||
        (production && url.protocol !== 'https:')) {
      throw new Error('Trusted origins must be exact HTTP(S) origins without credentials, paths or wildcards; production requires HTTPS.');
    }
    return url.origin;
  }));
}
