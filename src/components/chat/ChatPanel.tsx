import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useProject } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { getContextStats, type AppContextInput } from '@/lib/gemini/context';
import { askProjectAssistantStream, type ChatMessage } from '@/lib/gemini/chat';
import { getSuggestionsForRoute } from '@/lib/gemini/tools';
import { GEMINI_KEY_EVENT, hasGeminiApiKey } from '@/lib/gemini/settings';
import { getGeminiRateLimitInfo } from '@/lib/gemini/rateLimit';
import {
  appendCloudChatMessages,
  clearCloudChatHistory,
  clearLocalChatHistory,
  copyText,
  exportConversationMarkdown,
  loadCloudChatHistory,
  loadLocalChatHistory,
  saveLocalChatHistory,
} from '@/lib/gemini/history';
import { Bot, Copy, Download, Loader2, Send, Trash2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ChatMessageContent, stripMarkdownStars } from '@/components/chat/ChatMessageContent';

interface ChatPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatPanel({ open, onOpenChange }: ChatPanelProps) {
  const location = useLocation();
  const { user } = useAuth();
  const {
    mode,
    phases,
    tasks,
    backlog,
    risks,
    stakeholders,
    requirements,
    wbs,
    raci,
    selectedPhase,
    cloudProjectId,
  } = useProject();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [configured, setConfigured] = useState(() => hasGeminiApiKey());
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [viaProxy, setViaProxy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const contextInput: AppContextInput = useMemo(
    () => ({
      mode,
      currentPath: location.pathname,
      phases,
      tasks,
      backlog,
      risks,
      stakeholders,
      requirements,
      wbs,
      raci,
      selectedPhaseId: selectedPhase?.id,
    }),
    [
      mode,
      location.pathname,
      phases,
      tasks,
      backlog,
      risks,
      stakeholders,
      requirements,
      wbs,
      raci,
      selectedPhase?.id,
    ]
  );

  const stats = useMemo(() => getContextStats(contextInput), [contextInput]);
  const suggestions = useMemo(
    () => getSuggestionsForRoute(location.pathname),
    [location.pathname]
  );
  const rateInfo = getGeminiRateLimitInfo();

  useEffect(() => {
    const refresh = () => setConfigured(hasGeminiApiKey());
    refresh();
    window.addEventListener(GEMINI_KEY_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(GEMINI_KEY_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  useEffect(() => {
    if (open) setConfigured(hasGeminiApiKey());
  }, [open]);

  // Load history: cloud when project synced, else local
  useEffect(() => {
    let cancelled = false;
    setHydrated(false);

    (async () => {
      if (user && cloudProjectId) {
        const cloud = await loadCloudChatHistory(cloudProjectId);
        if (cancelled) return;
        if (cloud.length > 0) {
          setMessages(cloud);
          saveLocalChatHistory(cloudProjectId, cloud);
        } else {
          const local = loadLocalChatHistory(cloudProjectId);
          setMessages(local);
        }
      } else {
        setMessages(loadLocalChatHistory(null));
      }
      if (!cancelled) setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, cloudProjectId]);

  useEffect(() => {
    if (!hydrated) return;
    saveLocalChatHistory(cloudProjectId, messages);
  }, [messages, cloudProjectId, hydrated]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, busy, streamingId]);

  const persistPair = async (userMsg: ChatMessage, assistantMsg: ChatMessage) => {
    if (!user || !cloudProjectId) return;
    await appendCloudChatMessages(cloudProjectId, user.id, [
      { role: userMsg.role, content: userMsg.content, createdAt: userMsg.createdAt },
      { role: assistantMsg.role, content: assistantMsg.content, createdAt: assistantMsg.createdAt },
    ]);
  };

  const send = async (preset?: string) => {
    const question = (preset ?? input).trim();
    if (!question || busy) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMsg: ChatMessage = {
      id: `u${Date.now()}`,
      role: 'user',
      content: question,
      createdAt: new Date().toISOString(),
    };
    const assistantId = `a${Date.now()}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
    setInput('');
    setBusy(true);
    setStreamingId(assistantId);
    setViaProxy(false);

    const historyForPrompt = [...messages, userMsg];

    const result = await askProjectAssistantStream({
      question,
      contextInput,
      history: historyForPrompt,
      signal: controller.signal,
      onChunk: (text) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: text } : m))
        );
      },
    });

    setViaProxy(result.viaProxy);
    setBusy(false);
    setStreamingId(null);

    const finalAssistant: ChatMessage = {
      ...assistantPlaceholder,
      content: result.answer,
    };
    setMessages((prev) =>
      prev.map((m) => (m.id === assistantId ? finalAssistant : m))
    );

    if (result.answer && !result.blocked) {
      void persistPair(userMsg, finalAssistant);
    } else if (result.answer) {
      // Persist refusals too so cloud history matches
      void persistPair(userMsg, finalAssistant);
    }
  };

  const handleExport = () => {
    const md = exportConversationMarkdown(messages);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pmp-chat-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Conversation exported');
  };

  const handleCopyLast = async () => {
    const last = [...messages].reverse().find((m) => m.role === 'assistant' && m.content);
    if (!last) {
      toast.error('No reply to copy');
      return;
    }
    const ok = await copyText(stripMarkdownStars(last.content));
    toast[ok ? 'success' : 'error'](ok ? 'Reply copied' : 'Could not copy');
  };

  const handleClear = async () => {
    abortRef.current?.abort();
    setMessages([]);
    setBusy(false);
    setStreamingId(null);
    clearLocalChatHistory(cloudProjectId);
    if (cloudProjectId) await clearCloudChatHistory(cloudProjectId);
    toast.success('History cleared');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-4 py-3 text-left space-y-2">
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            PMP Assistant
          </SheetTitle>
          <SheetDescription asChild>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                {stats.mode} · {stats.path} · {stats.tasks} tasks · {stats.risks} risks (
                {stats.criticalRisks} critical) · {stats.backlogPoints} backlog pts
              </p>
              <p>
                {cloudProjectId ? 'Cloud history' : 'Local history'}
                {viaProxy ? ' · proxy' : ''}
                {` · quota ${rateInfo.used}/${rateInfo.max}`}
              </p>
            </div>
          </SheetDescription>
        </SheetHeader>

        {!configured && (
          <div className="m-4 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
            <p className="text-foreground mb-2">Add your Gemini key to enable chat.</p>
            <Button asChild size="sm" variant="outline">
              <Link to="/settings" className="gap-2" onClick={() => onOpenChange(false)}>
                <Settings className="h-4 w-4" />
                Open Settings
              </Link>
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {!hydrated && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading history…
            </div>
          )}
          {hydrated && messages.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              Ask a question or pick a suggestion. Context adapts to the page; history syncs when
              you are signed in.
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                'group relative rounded-lg px-3 py-2.5 text-sm',
                m.role === 'user'
                  ? 'ml-8 bg-primary text-primary-foreground whitespace-pre-wrap'
                  : 'mr-4 bg-muted text-foreground'
              )}
            >
              {!m.content && m.id === streamingId ? (
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Analyzing…
                </span>
              ) : m.role === 'assistant' && m.content ? (
                <ChatMessageContent content={m.content} />
              ) : (
                m.content
              )}
              {m.role === 'assistant' && m.content && m.id !== streamingId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute -right-1 -top-1 h-7 w-7 opacity-0 group-hover:opacity-100"
                  title="Copy"
                  onClick={async () => {
                    const ok = await copyText(stripMarkdownStars(m.content));
                    toast[ok ? 'success' : 'error'](ok ? 'Copied' : 'Copy failed');
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border p-3 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <Button
                key={s}
                type="button"
                variant="outline"
                size="sm"
                className="h-auto max-w-full whitespace-normal text-left text-xs py-1 px-2"
                disabled={busy || !configured}
                onClick={() => void send(s)}
              >
                {s}
              </Button>
            ))}
          </div>

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the project…"
            rows={3}
            disabled={busy}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1"
                disabled={messages.length === 0 && !busy}
                onClick={() => void handleClear()}
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1"
                disabled={messages.length === 0}
                onClick={handleExport}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1"
                disabled={!messages.some((m) => m.role === 'assistant' && m.content)}
                onClick={() => void handleCopyLast()}
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
            <Button
              type="button"
              size="sm"
              className="gap-2"
              disabled={busy || !input.trim()}
              onClick={() => void send()}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
