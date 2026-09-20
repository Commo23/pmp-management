/** Curated text-only Gemini models (no image/video). */

export type GeminiModelId =
  | 'gemini-3.5-flash-lite'
  | 'gemini-2.5-flash'
  | 'gemini-3.6-flash';

export interface GeminiModelOption {
  id: GeminiModelId;
  label: string;
  cost: 'Lowest' | 'Balanced' | 'Standard';
  description: string;
}

/** Default = cheapest text model for Q&A. */
export const DEFAULT_GEMINI_MODEL: GeminiModelId = 'gemini-3.5-flash-lite';

/** @deprecated Prefer getGeminiModel() from settings. Kept as fallback id. */
export const GEMINI_MODEL = DEFAULT_GEMINI_MODEL;

/** Old ids → current ids (Google retires models for new API keys). */
const MODEL_MIGRATIONS: Record<string, GeminiModelId> = {
  'gemini-2.5-flash-lite': 'gemini-3.5-flash-lite',
};

export const GEMINI_MODEL_OPTIONS: GeminiModelOption[] = [
  {
    id: 'gemini-3.5-flash-lite',
    label: 'Flash-Lite 3.5',
    cost: 'Lowest',
    description: 'Cheapest text model — best for everyday Q&A',
  },
  {
    id: 'gemini-2.5-flash',
    label: 'Flash 2.5',
    cost: 'Balanced',
    description: 'Good quality with moderate cost',
  },
  {
    id: 'gemini-3.6-flash',
    label: 'Flash 3.6',
    cost: 'Standard',
    description: 'Current generation Flash — use if Lite is unavailable',
  },
];

export function isGeminiModelId(value: string): value is GeminiModelId {
  return GEMINI_MODEL_OPTIONS.some((o) => o.id === value);
}

export function resolveGeminiModelId(value: string): GeminiModelId | null {
  const migrated = MODEL_MIGRATIONS[value] ?? value;
  return isGeminiModelId(migrated) ? migrated : null;
}
