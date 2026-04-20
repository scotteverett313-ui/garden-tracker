const PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-seed`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function callClaude(messages, { maxTokens = 1000, model = "claude-sonnet-4-20250514" } = {}) {
  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Proxy error ${res.status}`);
  }
  const data = await res.json();
  const text = data.content?.find(b => b.type === "text")?.text || "";
  return text;
}
