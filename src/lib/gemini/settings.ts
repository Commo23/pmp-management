import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  DEFAULT_GEMINI_MODEL,
  resolveGeminiModelId,
  type GeminiModelId,
} from '@/lib/gemini/model';

const GEMINI_KEY_STORAGE = 'pmp-gemini-api-key';
const GEMINI_MODEL_STORAGE = 'pmp-gemini-model';
export const GEMINI_KEY_EVENT = 'pmp-gemini-key-changed';

export function getGeminiApiKey(): string {
  try {
    return localStorage.getItem(GEMINI_KEY_STORAGE)?.trim() ?? '';
  } catch {
    return '';
  }
}

export function setGeminiApiKey(key: string): void {
  const trimmed = key.trim();
  if (!trimmed) {
    localStorage.removeItem(GEMINI_KEY_STORAGE);
  } else {
    localStorage.setItem(GEMINI_KEY_STORAGE, trimmed);
  }
  window.dispatchEvent(new Event(GEMINI_KEY_EVENT));
}

export function getGeminiModel(): GeminiModelId {
  try {
    const raw = localStorage.getItem(GEMINI_MODEL_STORAGE)?.trim() ?? '';
    const resolved = raw ? resolveGeminiModelId(raw) : null;
    if (resolved) {
      // Persist migration away from retired model ids
      if (raw !== resolved) {
        localStorage.setItem(GEMINI_MODEL_STORAGE, resolved);
      }
      return resolved;
    }
  } catch {
    // ignore
  }
  return DEFAULT_GEMINI_MODEL;
}

export function setGeminiModel(model: GeminiModelId): void {
  localStorage.setItem(GEMINI_MODEL_STORAGE, model);
  window.dispatchEvent(new Event(GEMINI_KEY_EVENT));
}

export function hasGeminiApiKey(): boolean {
  return getGeminiApiKey().length > 0;
}

export async function testGeminiApiKey(
  apiKey: string,
  modelId?: GeminiModelId
): Promise<{ ok: boolean; error?: string }> {
  const key = apiKey.trim();
  if (!key) return { ok: false, error: 'API key missing' };

  const model = modelId ?? getGeminiModel();

  try {
    const genAI = new GoogleGenerativeAI(key);
    const generativeModel = genAI.getGenerativeModel({ model });
    const result = await generativeModel.generateContent('Reply only: OK');
    const text = result.response.text();
    if (!text) return { ok: false, error: 'Empty model response' };
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Gemini connection failed';
    return { ok: false, error: message };
  }
}
