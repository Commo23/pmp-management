import { Fragment, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Strip leftover markdown emphasis so stars never show in the UI. */
export function stripMarkdownStars(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(?<!\w)\*([^*\n]+)\*(?!\w)/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/(?<!\w)_([^_\n]+)_(?!\w)/g, '$1');
}

interface Block {
  type: 'p' | 'ul' | 'h';
  lines: string[];
}

function parseBlocks(raw: string): Block[] {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    // Bullet: *, -, •
    if (/^[-*•]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (!t) break;
        if (/^[-*•]\s+/.test(t)) {
          items.push(t.replace(/^[-*•]\s+/, ''));
          i += 1;
          continue;
        }
        // Continuation of previous bullet (indented)
        if (/^\s{2,}/.test(lines[i]) && items.length > 0) {
          items[items.length - 1] += ` ${t}`;
          i += 1;
          continue;
        }
        break;
      }
      blocks.push({ type: 'ul', lines: items });
      continue;
    }

    // Heading-like: short line ending with : or ALL CAPS section
    if (
      (trimmed.endsWith(':') && trimmed.length < 80 && !trimmed.includes('. ')) ||
      /^#{1,3}\s+/.test(trimmed)
    ) {
      blocks.push({
        type: 'h',
        lines: [trimmed.replace(/^#{1,3}\s+/, '').replace(/:$/, '')],
      });
      i += 1;
      continue;
    }

    const paras: string[] = [trimmed];
    i += 1;
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t || /^[-*•]\s+/.test(t) || (t.endsWith(':') && t.length < 80)) break;
      paras.push(t);
      i += 1;
    }
    blocks.push({ type: 'p', lines: [paras.join(' ')] });
  }

  return blocks;
}

function InlineText({ text }: { text: string }) {
  // Convert **bold** / *italic* to spans, then strip any leftover stars
  const parts: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*\n]+)\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(stripMarkdownStars(text.slice(last, match.index)));
    }
    if (match[1]) {
      parts.push(
        <span key={key++} className="font-semibold text-foreground">
          {match[1]}
        </span>
      );
    } else if (match[2]) {
      parts.push(
        <span key={key++} className="text-foreground/90">
          {match[2]}
        </span>
      );
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push(stripMarkdownStars(text.slice(last)));
  }

  return <>{parts}</>;
}

interface ChatMessageContentProps {
  content: string;
  className?: string;
}

/** User-friendly assistant message: lists, headings, no visible markdown stars. */
export function ChatMessageContent({ content, className }: ChatMessageContentProps) {
  const blocks = parseBlocks(content.trim());

  if (blocks.length === 0) return null;

  return (
    <div className={cn('space-y-2.5 text-sm leading-relaxed', className)}>
      {blocks.map((block, bi) => {
        if (block.type === 'h') {
          return (
            <p
              key={bi}
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-1 first:pt-0"
            >
              <InlineText text={block.lines[0]} />
            </p>
          );
        }
        if (block.type === 'ul') {
          return (
            <ul key={bi} className="space-y-1.5 pl-0 list-none">
              {block.lines.map((item, ii) => (
                <li key={ii} className="flex gap-2">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70"
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <InlineText text={item} />
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <Fragment key={bi}>
            {block.lines.map((line, li) => (
              <p key={li} className="text-foreground">
                <InlineText text={line} />
              </p>
            ))}
          </Fragment>
        );
      })}
    </div>
  );
}
