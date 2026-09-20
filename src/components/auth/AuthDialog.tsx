import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { DEMO_EMAIL, DEMO_PASSWORD } from '@/lib/demo';
import { toast } from 'sonner';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const result =
      mode === 'signin'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);
    setBusy(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(
      mode === 'signin'
        ? 'Signed in successfully'
        : 'Account created — check your email if confirmation is enabled'
    );
    onOpenChange(false);
    setPassword('');
  };

  const handleDemo = async () => {
    setBusy(true);
    const result = await signIn(DEMO_EMAIL, DEMO_PASSWORD);
    setBusy(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </DialogTitle>
          <DialogDescription>
            Sync your PMP project with Supabase (cloud + device).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-password">Password</Label>
            <Input
              id="auth-password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button type="submit" className="w-full" disabled={busy}>
              {busy
                ? 'Loading…'
                : mode === 'signin'
                  ? 'Sign in'
                  : 'Create account'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={busy}
              onClick={handleDemo}
            >
              Demo account (sample data)
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {DEMO_EMAIL} — seed is restored on every demo sign-in
            </p>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={busy}
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            >
              {mode === 'signin'
                ? 'No account? Sign up'
                : 'Already have an account? Sign in'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
