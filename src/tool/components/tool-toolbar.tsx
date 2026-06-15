'use client';

import Link from 'next/link';
import toolConfig from '@/tool/tool.config';

/**
 * Toolbar for the .gitignore Generator.
 *
 * Provides a Help link and a keyboard shortcuts reference dropdown.
 */
export function ToolToolbar() {
  return (
    <div className="gitignore-toolbar">
      <Link href="/help" className="toolbar-btn toolbar-help-link" aria-label="Open help page">
        Help
      </Link>
      <div className="toolbar-btn toolbar-shortcuts-trigger">
        <span>Shortcuts</span>
        <div className="toolbar-shortcuts-dropdown" role="menu" aria-label="Keyboard shortcuts">
          <div className="shortcut-section-header">{toolConfig.name}</div>
          {toolConfig.shortcuts.map((group) =>
            group.shortcuts.map((sc, i) => (
              <div key={`${group.title}-${i}`} className="shortcut-row" role="menuitem">
                <span className="shortcut-label">{sc.label}</span>
                <span className="shortcut-keys">
                  {sc.keys.split('+').map((key, ki) => (
                    <span key={ki}>
                      {ki > 0 && <span className="shortcut-key-sep">+</span>}
                      <kbd className="shortcut-kbd-badge">{key}</kbd>
                    </span>
                  ))}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

ToolToolbar.displayName = 'ToolToolbar';
