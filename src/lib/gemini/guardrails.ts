import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiApiKey, getGeminiModel } from '@/lib/gemini/settings';
import { classifyViaGeminiProxy } from '@/lib/gemini/proxy';

export const OFF_TOPIC_REPLY =
  "I can only answer questions related to PMP Flow Designer and project management (project data, PMBOK/Agile, app navigation). Please rephrase your question within that scope.";

const OFF_TOPIC_PATTERNS = [
  /\b(recette|cuisine|football|bitcoin|crypto|politique|élection|onlyfans)\b/i,
  /\b(capitale de|qui a gagné|blague|joke|horoscope)\b/i,
  /\b(ignore (tes|vos|all) (instructions|règles|rules))\b/i,
  /\b(ignore previous|jailbreak|dan mode)\b/i,
];

const ON_TOPIC_HINTS = [
  /\b(projet|project|tâche|task|kanban|backlog|sprint|risque|risk|stakeholder|exigence|requirement|wbs|raci|gantt|phase|waterfall|agile|scrum|pmbok|burndown|velocity)\b/i,
  /\b(comment|combien|liste|résume|explique|où|statut|priority|priorité)\b/i,
  /\b(flow|timeline|matrice|registre|livrable|milestone)\b/i,
];

export type TopicVerdict = 'on_topic' | 'off_topic' | 'unclear';

export function classifyTopic(question: string): TopicVerdict {
  const q = question.trim();
  if (!q) return 'unclear';

  if (OFF_TOPIC_PATTERNS.some((re) => re.test(q))) {
    const strongOnTopic = ON_TOPIC_HINTS.filter((re) => re.test(q)).length >= 2;
    if (!strongOnTopic) return 'off_topic';
  }

  if (ON_TOPIC_HINTS.some((re) => re.test(q))) return 'on_topic';

  if (q.length < 80) return 'unclear';

  return 'unclear';
}

const CLASSIFY_PROMPT = `You are a strict classifier for the PMP Flow Designer app.
Reply ONLY with ON or OFF (a single word).
ON = question related to project management, PMBOK/Agile/Scrum, or app data/features (kanban, backlog, risks, WBS, RACI, requirements, stakeholders, gantt, phases).
OFF = everything else (news, cooking, sports, general homework, code unrelated to the project, etc.).

Question: `;

/** Regex first; for unclear cases, ask Gemini (proxy or direct). */
export async function classifyTopicAsync(
  question: string,
  options?: { apiKey?: string; preferProxy?: boolean; signal?: AbortSignal }
): Promise<TopicVerdict> {
  const base = classifyTopic(question);
  if (base !== 'unclear') return base;

  const apiKey = (options?.apiKey ?? getGeminiApiKey()).trim();
  if (!apiKey) return 'unclear';

  const prompt = `${CLASSIFY_PROMPT}${question.trim()}\n\nAnswer:`;

  try {
    let raw = '';
    if (options?.preferProxy !== false) {
      try {
        raw = await classifyViaGeminiProxy({
          prompt,
          apiKey,
          signal: options?.signal,
        });
      } catch {
        // fall through to direct
      }
    }

    if (!raw) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: getGeminiModel(),
        generationConfig: { temperature: 0, maxOutputTokens: 8 },
      });
      const result = await model.generateContent(prompt);
      raw = result.response.text();
    }

    const token = raw.trim().toUpperCase();
    if (token.startsWith('OFF')) return 'off_topic';
    if (token.startsWith('ON')) return 'on_topic';
    return 'unclear';
  } catch {
    return 'unclear';
  }
}

export function looksLikeRefusal(text: string): boolean {
  return /je (ne )?(peux|puis) (pas|uniquement)|hors (sujet|périmètre)|uniquement.*(projet|application)|i (can|will) only|only answer.*(project|pmp)|off[- ]?topic|outside (the )?scope/i.test(
    text
  );
}

/** Soft post-filter: strip markdown stars and catch off-topic drift. */
export function enforceScope(answer: string, question: string): string {
  const topic = classifyTopic(question);
  if (topic === 'off_topic') return OFF_TOPIC_REPLY;

  const cleaned = answer
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|\s)\*([^*\n]+)\*(?=\s|$|[.,;:!?])/g, '$1$2')
    .replace(/__([^_]+)__/g, '$1')
    .trim();

  const hasPmpAnchor =
    /\b(tâche|task|risque|backlog|kanban|phase|wbs|raci|sprint|stakeholder|exigence|projet|PMP)\b/i.test(
      cleaned
    ) || looksLikeRefusal(cleaned);

  const drifted =
    /\b(recette|ingrédients|météo|horoscope|cote de bourse)\b/i.test(cleaned) && !hasPmpAnchor;

  if (drifted) return OFF_TOPIC_REPLY;
  return cleaned;
}
