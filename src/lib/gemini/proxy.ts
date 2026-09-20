import { supabase } from '@/lib/supabase/client';
import { getGeminiModel } from '@/lib/gemini/settings';

const PROXY_PATH = '/functions/v1/gemini-proxy';

export function getGeminiProxyUrl(): string | null {
  const base = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
  if (!base) return null;
  return `${base}${PROXY_PATH}`;
}

/** Streams text chunks from the Edge Function SSE proxy. Falls back by throwing. */
export async function streamViaGeminiProxy(params: {
  prompt: string;
  apiKey: string;
  signal?: AbortSignal;
  onChunk?: (text: string) => void;
}): Promise<string> {
  const url = getGeminiProxyUrl();
  if (!url) throw new Error('Supabase URL missing');

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error('Session required for proxy');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '',
    },
    body: JSON.stringify({
      prompt: params.prompt,
      apiKey: params.apiKey,
      model: getGeminiModel(),
      stream: true,
    }),
    signal: params.signal,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || `Proxy HTTP ${res.status}`);
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const json = (await res.json()) as { text?: string; error?: string };
    if (json.error) throw new Error(json.error);
    const text = json.text ?? '';
    params.onChunk?.(text);
    return text;
  }

  if (!res.body) {
    const text = await res.text();
    params.onChunk?.(text);
    return text;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split('\n');
    buffer = parts.pop() ?? '';

    for (const line of parts) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const parsed = JSON.parse(payload) as { text?: string; error?: string };
        if (parsed.error) throw new Error(parsed.error);
        if (parsed.text) {
          full += parsed.text;
          params.onChunk?.(full);
        }
      } catch (e) {
        if (e instanceof SyntaxError) continue;
        throw e;
      }
    }
  }

  return full;
}

/** Non-streaming classify helper via proxy (or throws). */
export async function classifyViaGeminiProxy(params: {
  prompt: string;
  apiKey: string;
  signal?: AbortSignal;
}): Promise<string> {
  const url = getGeminiProxyUrl();
  if (!url) throw new Error('Supabase URL missing');

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error('Session required for proxy');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '',
    },
    body: JSON.stringify({
      prompt: params.prompt,
      apiKey: params.apiKey,
      model: getGeminiModel(),
      stream: false,
      maxOutputTokens: 16,
      temperature: 0,
    }),
    signal: params.signal,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || `Proxy HTTP ${res.status}`);
  }

  const json = (await res.json()) as { text?: string; error?: string };
  if (json.error) throw new Error(json.error);
  return json.text ?? '';
}
