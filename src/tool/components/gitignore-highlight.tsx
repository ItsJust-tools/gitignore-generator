'use client';

import { useMemo } from 'react';

interface HighlightSegment {
  text: string;
  cls: string;
}

/** Classify one line of .gitignore syntax into styled segments. */
function highlightLine(line: string): HighlightSegment[] {
  if (!line) return [];
  const trimmed = line.trim();
  if (trimmed.startsWith('#')) {
    return [{ text: line, cls: 'gi-comment' }];
  }
  const segments: HighlightSegment[] = [];
  const pattern = /(!)|(\/\s*$)|(\*\*|\*|\?|\[[^\]]*\])|([^\s*?![\/]+)|([\s\S])/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: line.slice(lastIndex, match.index), cls: 'gi-plain' });
    }
    if (match[1]) segments.push({ text: match[1], cls: 'gi-negation' });
    else if (match[2]) segments.push({ text: match[2], cls: 'gi-dir' });
    else if (match[3]) segments.push({ text: match[3], cls: 'gi-glob' });
    else segments.push({ text: match[4] ?? match[5] ?? '', cls: 'gi-plain' });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) {
    segments.push({ text: line.slice(lastIndex), cls: 'gi-plain' });
  }
  return segments;
}

interface GitignoreHighlightProps {
  /** Value shown in the sibling transparent textarea; also rendered as the highlight layer. */
  value: string;
  /** Rendered inside the overlay so scrolling stays perfectly in sync — do not rely on it for export. */
  ariaHidden?: boolean;
}

/**
 * Syntax-highlight overlay for a .gitignore editor. Pair it with a transparent-text
 * textarea sharing the monospace metrics; the overlay sits underneath the caret layer.
 */
export function GitignoreHighlight({ value, ariaHidden = true }: GitignoreHighlightProps) {
  const lines = useMemo(() => value.split('\n'), [value]);
  return (
    <div className="gitignore-highlight" aria-hidden={ariaHidden || undefined}>
      {lines.map((line, i) => {
        const segments = highlightLine(line);
        return (
          <div className="gitignore-highlight-line" key={i}>
            {segments.length === 0 ? (
              <span className="gi-plain"> </span>
            ) : (
              segments.map((seg, j) => (
                <span key={j} className={seg.cls}>
                  {seg.text}
                </span>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}

GitignoreHighlight.displayName = 'GitignoreHighlight';
