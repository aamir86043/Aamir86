// Client for the server-side Gemini proxy. The API key lives ONLY in the server's GEMINI_API_KEY
// environment variable (Railway Variables) and is never sent to the browser.
async function call(path, opts) {
  let res;
  try { res = await fetch(path, opts); }
  catch (_) { throw Object.assign(new Error('Cannot reach the Saathi server. Check your internet.'), { code: 'network' }); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    const e = data.error || {};
    throw Object.assign(new Error(e.message || `Server error (${res.status}).`), { code: e.code || 'http', status: res.status });
  }
  return data;
}

export const Gemini = {
  /** Resolves null when the key works, otherwise an Error with .code: missing | invalid | blocked | quota | network. */
  async verify() {
    try { await call('/api/status'); return null; } catch (e) { return e; }
  },
  async describe(jpegDataUrl) {
    const data = await call('/api/describe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: jpegDataUrl.split(',')[1] })
    });
    return data.text;
  }
};
