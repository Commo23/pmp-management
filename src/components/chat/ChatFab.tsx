import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChatPanel } from './ChatPanel';
import { Bot } from 'lucide-react';

export function ChatFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
        aria-label="Open PMP assistant"
      >
        <Bot className="h-5 w-5" />
      </Button>
      <ChatPanel open={open} onOpenChange={setOpen} />
    </>
  );
}
