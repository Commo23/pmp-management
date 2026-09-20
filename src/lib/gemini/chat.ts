import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT, type AppContextInput } from '@/lib/gemini/context';
import { buildFocusedAppContext } from '@/lib/gemini/context';
import {
  OFF_TOPIC_REPLY,
  classifyTopicAsync,
  enforceScope,
} from '@/lib/gemini/guardrails';
import { getGeminiApiKey, getGeminiModel } from '@/lib/gemini/settings';
import { checkGeminiRateLimit, recordGeminiRequest } from '@/lib/gemini/rateLimit';
import { streamViaGeminiProxy } from '@/lib/gemini/proxy';
import { supabase } from '@/lib/supabase/client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

/** Condenses older turns so the prompt stays small. */
export function buildHistoryBlock(history: ChatMessage[]): string {
  if (history.length === 0) return '';

  const RECENT = 6;
  if (history.length <= RECENT) {
    return history
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');
  }

  const older = history.slice(0, -RECENT);
  const recent = history.slice(-RECENT);

  const summaryParts = older.map((m) => {
    const role = m.role === 'user' ? 'U' : 'A';
    const snippet = m.content.replace(/\s+/g, ' ').slice(0, 120);
    return `${role}: ${snippet}${m.content.length > 120 ? '…' : ''}`;
  });

  const summary = `HISTORY SUMMARY (older):\n${summaryParts.join(' | ')}`;
  const recentBlock = recent
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  return `${summary}\n\nRECENT HISTORY:\n${recentBlock}`;
}

async function streamDirect(params: {
  apiKey: string;
  prompt: string;
  signal?: AbortSignal;
  onChunk?: (text: string) => void;
}): Promise<string> {
  const genAI = new GoogleGenerativeAI(params.apiKey);
  const model = genAI.getGenerativeModel({
    model: getGeminiModel(),
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024,
    },
  });

  const stream = await model.generateContentStream(params.prompt);
  let raw = '';

  for await (const chunk of stream.stream) {
    if (params.signal?.aborted) break;
    const piece = chunk.text();
    if (piece) {
      raw += piece;
      params.onChunk?.(raw);
    }
  }

  return raw;
}

export async function askProjectAssistantStream(params: {
  question: string;
  contextInput: AppContextInput;
  history?: ChatMessage[];
  apiKey?: string;
  onChunk?: (text: string) => void;
  signal?: AbortSignal;
  preferProxy?: boolean;
}): Promise<{ answer: string; blocked: boolean; domains: string[]; viaProxy: boolean }> {
  const question = params.question.trim();
  if (!question) {
    return {
      answer: 'Ask a question about your project or the application.',
      blocked: true,
      domains: [],
      viaProxy: false,
    };
  }

  const rate = checkGeminiRateLimit();
  if (rate.ok === false) {
    const msg = `Rate limit reached (${rate.retryAfterSec}s). Try again soon to avoid saturating the Gemini API.`;
    params.onChunk?.(msg);
    return { answer: msg, blocked: true, domains: [], viaProxy: false };
  }

  const apiKey = (params.apiKey ?? getGeminiApiKey()).trim();
  if (!apiKey) {
    const msg =
      'No Gemini key configured. Go to Settings to add your Google Gemini API key.';
    params.onChunk?.(msg);
    return { answer: msg, blocked: true, domains: [], viaProxy: false };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const hasSession = Boolean(sessionData.session?.access_token);
  const preferProxy = params.preferProxy ?? hasSession;

  const topic = await classifyTopicAsync(question, {
    apiKey,
    preferProxy,
    signal: params.signal,
  });
  if (topic === 'off_topic') {
    params.onChunk?.(OFF_TOPIC_REPLY);
    return { answer: OFF_TOPIC_REPLY, blocked: true, domains: [], viaProxy: false };
  }

  const focused = buildFocusedAppContext(params.contextInput, question);
  const historyBlock = buildHistoryBlock(params.history ?? []);

  const prompt = [
    SYSTEM_PROMPT,
    '',
    'TARGETED PROJECT CONTEXT (JSON):',
    focused.json,
    '',
    historyBlock ? `${historyBlock}\n` : '',
    `USER QUESTION:\n${question}`,
    '',
    'Answer now while respecting the strict scope and OUTPUT FORMAT (no markdown stars).',
  ]
    .filter(Boolean)
    .join('\n');

  recordGeminiRequest();

  try {
    if (params.signal?.aborted) {
      return { answer: '', blocked: true, domains: focused.domains, viaProxy: false };
    }

    let raw = '';
    let viaProxy = false;

    if (preferProxy) {
      try {
        raw = await streamViaGeminiProxy({
          prompt,
          apiKey,
          signal: params.signal,
          onChunk: params.onChunk,
        });
        viaProxy = true;
      } catch (proxyErr) {
        console.warn('Gemini proxy unavailable, falling back to direct', proxyErr);
        raw = await streamDirect({
          apiKey,
          prompt,
          signal: params.signal,
          onChunk: params.onChunk,
        });
      }
    } else {
      raw = await streamDirect({
        apiKey,
        prompt,
        signal: params.signal,
        onChunk: params.onChunk,
      });
    }

    const trimmed = raw.trim() || 'No response.';
    const answer = enforceScope(trimmed, question);
    if (answer !== raw.trim()) {
      params.onChunk?.(answer);
    }
    return {
      answer,
      blocked: answer === OFF_TOPIC_REPLY,
      domains: focused.domains,
      viaProxy,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Gemini error';
    let answer: string;
    if (/API_KEY|api key|403|401/i.test(message)) {
      answer = 'Invalid or rejected Gemini API key. Check it in Settings.';
    } else if (/abort/i.test(message)) {
      answer = 'Generation interrupted.';
    } else {
      answer = `Error calling Gemini: ${message}`;
    }
    params.onChunk?.(answer);
    return { answer, blocked: true, domains: focused.domains, viaProxy: false };
  }
}

/** Non-streaming wrapper (tests / fallback). */
export async function askProjectAssistant(params: {
  question: string;
  contextInput: AppContextInput;
  history?: ChatMessage[];
  apiKey?: string;
}): Promise<{ answer: string; blocked: boolean }> {
  const result = await askProjectAssistantStream(params);
  return { answer: result.answer, blocked: result.blocked };
}
