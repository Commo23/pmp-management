import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getGeminiApiKey,
  getGeminiModel,
  setGeminiApiKey,
  setGeminiModel,
  testGeminiApiKey,
} from '@/lib/gemini/settings';
import {
  GEMINI_MODEL_OPTIONS,
  isGeminiModelId,
  type GeminiModelId,
} from '@/lib/gemini/model';
import { Eye, EyeOff, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsPage() {
  const [apiKey, setApiKey] = useState(() => getGeminiApiKey());
  const [model, setModel] = useState<GeminiModelId>(() => getGeminiModel());
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSave = () => {
    setGeminiApiKey(apiKey);
    setGeminiModel(model);
    toast.success(
      apiKey.trim()
        ? `Saved — using ${GEMINI_MODEL_OPTIONS.find((o) => o.id === model)?.label ?? model}`
        : 'Gemini key cleared (model preference kept)'
    );
  };

  const handleTest = async () => {
    setBusy(true);
    const result = await testGeminiApiKey(apiKey, model);
    setBusy(false);
    if (result.ok) {
      setGeminiApiKey(apiKey);
      setGeminiModel(model);
      toast.success(`Gemini connection OK (${model})`);
    } else {
      toast.error(result.error ?? 'Test failed');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Configure the AI assistant (Google Gemini). The key stays in your browser.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Gemini API key</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Get a key from Google AI Studio. It is not sent to Supabase — only to the
              Google API for chat. Project data is included in the prompts.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gemini-key">API Key</Label>
          <div className="flex gap-2">
            <Input
              id="gemini-key"
              type={show ? 'text' : 'password'}
              autoComplete="off"
              placeholder="AIza…"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Hide' : 'Show'}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gemini-model">Gemini model</Label>
          <Select
            value={model}
            onValueChange={(v) => {
              if (isGeminiModelId(v)) setModel(v);
            }}
          >
            <SelectTrigger id="gemini-model" className="w-full">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {GEMINI_MODEL_OPTIONS.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.label} — {opt.cost}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Text-only chat. Flash-Lite uses the least quota.{' '}
            {GEMINI_MODEL_OPTIONS.find((o) => o.id === model)?.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSave}>Save</Button>
          <Button variant="secondary" onClick={handleTest} disabled={busy || !apiKey.trim()}>
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Testing…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Test connection
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setApiKey('');
              setGeminiApiKey('');
              toast.success('Key cleared');
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground space-y-2">
        <p>
          The assistant only answers questions related to PMP Flow Designer and your
          project data. Off-topic questions are refused.
        </p>
        <p>
          Signed in: calls go through the Supabase Edge Function proxy (JWT required), with
          a direct fallback if the proxy is unavailable. Chat history is synced per
          project. Local limit: 20 requests / 5 min.
        </p>
      </div>
    </div>
  );
}
