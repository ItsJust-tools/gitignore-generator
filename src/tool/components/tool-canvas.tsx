'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GitignoreState } from '../types';

interface ToolCanvasProps {
  state: GitignoreState;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
  onCopy?: () => void;
  onDownload?: () => void;
}

/**
 * Main canvas component for the .gitignore Generator.
 * Shows the generated .gitignore output with line numbers
 * and copy/download actions, or an empty state prompting template selection.
 */
export function ToolCanvas({ state, canvasRef, onCopy, onDownload }: ToolCanvasProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localCopied, setLocalCopied] = useState(false);
  const lineCount = state.outputContent ? state.outputContent.split('\n').length : 0;

  /**
   * Fallback copy handler used only when no external onCopy is provided.
   * The parent ToolClient manages the real copy logic, toast notifications,
   * and 'copied' state. This prevents double-clipboard writes when the parent
   * also writes to the clipboard.
   *
   * When used as a standalone fallback (no parent onCopy), provides local
   * visual feedback via a brief "Copied!" state.
   */
  const handleCopy = useCallback(() => {
    if (state.outputContent && navigator.clipboard) {
      navigator.clipboard.writeText(state.outputContent).then(
        () => {
          setLocalCopied(true);
          setTimeout(() => setLocalCopied(false), 2000);
        },
        () => {
          // Clipboard write failed — silently ignore
        }
      );
    }
  }, [state.outputContent]);

  // Determine whether the "copied" visual state is active
  const isCopied = state.copied || localCopied;

  // Auto-select content when it changes
  useEffect(() => {
    if (state.outputContent && textareaRef.current) {
      textareaRef.current.select();
    }
  }, [state.outputContent]);

  return (
    <div
      ref={canvasRef}
      className="gitignore-canvas"
      role="application"
      aria-label=".gitignore Generator"
    >
      {state.outputContent ? (
        <div className="gitignore-result">
          <div className="gitignore-header">
            <h2 className="gitignore-title">Generated .gitignore</h2>
            <div className="gitignore-stats">
              <span className="stat-badge">{lineCount} lines</span>
              <span className="stat-badge">
                {state.selectedTemplates.length} template
                {state.selectedTemplates.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="gitignore-output-wrapper">
            <div className="gitignore-line-numbers" aria-hidden="true">
              {Array.from({ length: lineCount }, (_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              readOnly
              value={state.outputContent}
              className="gitignore-output"
              aria-label="Generated .gitignore content"
              spellCheck={false}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
          </div>
          <div className="gitignore-actions">
            <button
              type="button"
              className={`gitignore-btn gitignore-btn-primary${isCopied ? ' copied' : ''}`}
              onClick={onCopy || handleCopy}
              aria-label={isCopied ? 'Copied to clipboard' : 'Copy .gitignore to clipboard'}
            >
              {isCopied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button
              type="button"
              className="gitignore-btn gitignore-btn-secondary"
              onClick={onDownload}
              aria-label="Download .gitignore file"
            >
              Download
            </button>
          </div>
        </div>
      ) : (
        <div className="gitignore-empty">
          <div className="gitignore-empty-icon">📄</div>
          <p className="gitignore-empty-text">
            Select templates below to generate a .gitignore file
          </p>
          <p className="gitignore-empty-hint">
            Combine multiple templates by checking the ones you need
          </p>
        </div>
      )}
    </div>
  );
}

ToolCanvas.displayName = 'ToolCanvas';
