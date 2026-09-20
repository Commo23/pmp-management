import { supabase } from '@/lib/supabase/client';
import type { ChatMessage } from '@/lib/gemini/chat';

export interface PmpChatMessageRow {
  id: string;
  owner_id: string;
  project_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

function localKey(projectId: string | null): string {
  return `pmp-chat-history:${projectId ?? 'local'}`;
}

export function loadLocalChatHistory(projectId: string | null): ChatMessage[] {
  try {
    const raw = localStorage.getItem(localKey(projectId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed.slice(-80) : [];
  } catch {
    return [];
  }
}

export function saveLocalChatHistory(projectId: string | null, messages: ChatMessage[]): void {
  try {
    localStorage.setItem(localKey(projectId), JSON.stringify(messages.slice(-80)));
  } catch {
    // ignore
  }
}

export function clearLocalChatHistory(projectId: string | null): void {
  try {
    localStorage.removeItem(localKey(projectId));
  } catch {
    // ignore
  }
}

export async function loadCloudChatHistory(
  projectId: string
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('pmp_chat_messages')
    .select('id, role, content, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })
    .limit(80);

  if (error || !data) {
    console.warn('loadCloudChatHistory', error?.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    role: row.role as 'user' | 'assistant',
    content: row.content,
    createdAt: row.created_at,
  }));
}

export async function appendCloudChatMessages(
  projectId: string,
  ownerId: string,
  messages: Array<Pick<ChatMessage, 'role' | 'content' | 'createdAt'>>
): Promise<void> {
  if (messages.length === 0) return;

  const rows = messages.map((m) => ({
    owner_id: ownerId,
    project_id: projectId,
    role: m.role,
    content: m.content,
    created_at: m.createdAt,
  }));

  const { error } = await supabase.from('pmp_chat_messages').insert(rows);
  if (error) console.warn('appendCloudChatMessages', error.message);
}

export async function clearCloudChatHistory(projectId: string): Promise<void> {
  const { error } = await supabase.from('pmp_chat_messages').delete().eq('project_id', projectId);
  if (error) console.warn('clearCloudChatHistory', error.message);
}

export function exportConversationMarkdown(messages: ChatMessage[]): string {
  const lines = [
    '# PMP Assistant Conversation',
    '',
    `Exported on ${new Date().toLocaleString('en-US')}`,
    '',
  ];
  for (const m of messages) {
    const who = m.role === 'user' ? 'User' : 'Assistant';
    lines.push(`## ${who}`, '', m.content, '');
  }
  return lines.join('\n');
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
