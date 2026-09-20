import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SampleDataBannerProps {
  className?: string;
  children?: string;
}

/** Honest label for seed / illustrative charts and timelines. */
export function SampleDataBanner({
  className,
  children = 'Sample data — illustrative only, not synced with live project edits.',
}: SampleDataBannerProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border border-dashed border-warning/40 bg-warning/10 px-3 py-2 text-xs text-muted-foreground',
        className
      )}
      role="status"
    >
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
      <span>{children}</span>
    </div>
  );
}
