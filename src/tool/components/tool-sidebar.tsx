'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import type {
  CustomRulesPosition,
  GitignoreState,
  GitignoreTemplate,
  VisibilityFilter,
} from '../types';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../types';
import { GitignoreHighlight } from './gitignore-highlight';

/**
 * Pre-configured quick pick presets for common project stacks.
 * Each preset applies a set of templates with a single click.
 */
const QUICK_PICKS: { name: string; icon: string; templates: GitignoreTemplate[] }[] = [
  { name: 'Node.js API', icon: '🟢', templates: ['node', 'vscode', 'macos'] },
  { name: 'React + Vite', icon: '⚛️', templates: ['react', 'node', 'vscode', 'macos'] },
  { name: 'Next.js App', icon: '▲', templates: ['nextjs', 'node', 'vscode', 'macos'] },
  { name: 'Python + Django', icon: '🎸', templates: ['python', 'django', 'vscode'] },
  { name: 'Rust CLI', icon: '🦀', templates: ['rust', 'vscode', 'macos'] },
  { name: 'Go Microservice', icon: '🔵', templates: ['go', 'docker', 'vscode'] },
  { name: 'Flutter Mobile', icon: '💙', templates: ['flutter', 'android', 'vscode', 'macos'] },
  { name: 'FastAPI + Docker', icon: '⚡', templates: ['fastapi', 'python', 'docker', 'vscode'] },
];

interface ToolSidebarProps {
  state: GitignoreState;
  onToggleTemplate: (id: GitignoreTemplate) => void;
  onBatchRemove?: (ids: GitignoreTemplate[]) => void;
  onCustomRulesChange: (rules: string) => void;
  onCustomRulesPositionChange?: (position: CustomRulesPosition) => void;
  onFilterChange: (filter: VisibilityFilter) => void;
  onSearchChange: (query: string) => void;
  onGenerate: () => void;
  onClear: () => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
}

export function ToolSidebar({
  state,
  onToggleTemplate,
  onBatchRemove,
  onCustomRulesChange,
  onCustomRulesPositionChange,
  onFilterChange,
  onSearchChange,
  onGenerate,
  onClear,
  onSelectAll,
  onDeselectAll,
}: ToolSidebarProps) {
  const filterTabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const templateGridRef = useRef<HTMLDivElement | null>(null);
  const [activeTemplateIndex, setActiveTemplateIndex] = useState(0);

  /** Move focus between template cards with arrow keys and toggle with Enter/Space. */
  const moveTemplateFocus = useCallback((index: number) => {
    const cards = templateGridRef.current?.querySelectorAll<HTMLElement>('.template-card');
    if (!cards || cards.length === 0) return;
    const clamped = Math.max(0, Math.min(index, cards.length - 1));
    setActiveTemplateIndex(clamped);
    cards[clamped]?.focus();
  }, []);

  const handleTemplateGridKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const cards = templateGridRef.current?.querySelectorAll<HTMLElement>('.template-card');
      const count = cards?.length ?? 0;
      if (count === 0) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        moveTemplateFocus(activeTemplateIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        moveTemplateFocus(activeTemplateIndex - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        moveTemplateFocus(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        moveTemplateFocus(count - 1);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const card = cards?.[activeTemplateIndex];
        const id = card?.getAttribute('data-template-id');
        if (id) onToggleTemplate(id as GitignoreTemplate);
      }
    },
    [activeTemplateIndex, moveTemplateFocus, onToggleTemplate]
  );

  /**
   * Handle keyboard arrow navigation on the filter tab bar.
   * Left/up moves to previous tab, right/down moves to next tab.
   */
  const handleFilterTabKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
      const tabs = filterTabRefs.current;
      if (!tabs) return;
      let nextIndex: number | null = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = tabs.length - 1;
      }
      if (nextIndex !== null) {
        tabs[nextIndex]?.focus();
      }
    },
    []
  );
  const filteredTemplates = useMemo(() => {
    let list = TEMPLATES;

    if (state.visibilityFilter !== 'all') {
      list = list.filter((t) => t.category === state.visibilityFilter);
    }

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q)
      );
    }

    return list;
  }, [state.visibilityFilter, state.searchQuery]);

  const selectedCount = state.selectedTemplates.length;

  return (
    <div className="gitignore-sidebar">
      {/* Quick Pick Presets */}
      <div className="sidebar-section">
        <h3>Quick Picks</h3>
        <div className="quick-picks">
          {QUICK_PICKS.map((preset) => {
            const allSelected = preset.templates.every((t) => state.selectedTemplates.includes(t));
            return (
              <button
                key={preset.name}
                type="button"
                className={`quick-pick-btn${allSelected ? ' active' : ''}`}
                onClick={() => {
                  // Toggle: if all selected, deselect them all in one batch;
                  // otherwise add only the missing ones.
                  if (allSelected) {
                    if (onBatchRemove) {
                      onBatchRemove(preset.templates);
                    } else {
                      preset.templates.forEach((t) => onToggleTemplate(t));
                    }
                  } else {
                    for (const t of preset.templates) {
                      if (!state.selectedTemplates.includes(t)) {
                        onToggleTemplate(t);
                      }
                    }
                  }
                }}
                aria-label={`${allSelected ? 'Remove' : 'Add'} ${preset.name} stack`}
              >
                <span className="quick-pick-icon">{preset.icon}</span>
                <span className="quick-pick-name">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Search */}
      <div className="sidebar-section">
        <h3>Templates</h3>
        <div className="search-wrapper">
          <input
            type="search"
            value={state.searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="gitignore-search"
            aria-label="Search templates"
            placeholder="Search templates..."
          />
          {state.searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        {/* Selected template chips (keyboard-removable) */}
        {selectedCount > 0 && (
          <div className="selected-chips" role="group" aria-label="Selected templates">
            {state.selectedTemplates.map((id) => {
              const template = TEMPLATES.find((t) => t.id === id);
              if (!template) return null;
              return (
                <span key={id} className="selected-chip">
                  <span className="selected-chip-label">
                    {template.icon} {template.label}
                  </span>
                  <button
                    type="button"
                    className="selected-chip-remove"
                    onClick={() => onToggleTemplate(id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' || e.key === 'Delete') {
                        e.preventDefault();
                        onToggleTemplate(id);
                      }
                    }}
                    aria-label={`Remove ${template.label} template`}
                  >
                    ✕
                  </button>
                </span>
              );
            })}
          </div>
        )}
        <div className="filter-tabs" role="tablist" aria-label="Template category filter">
          {TEMPLATE_CATEGORIES.map((cat, i) => (
            <button
              key={cat.id}
              ref={(el) => {
                filterTabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              className={`filter-tab ${state.visibilityFilter === cat.id ? 'active' : ''}`}
              onClick={() => onFilterChange(cat.id as VisibilityFilter)}
              onKeyDown={(e) => handleFilterTabKeyDown(e, i)}
              aria-selected={state.visibilityFilter === cat.id}
              aria-label={`${cat.label} filter`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selection Summary */}
      {selectedCount > 0 && (
        <div className="sidebar-section selection-summary">
          <span className="selection-badge">{selectedCount} selected</span>
          {onDeselectAll && onSelectAll && (
            <div className="selection-actions">
              <button
                type="button"
                className="selection-action-btn"
                onClick={onSelectAll}
                aria-label="Select all visible templates"
              >
                Select All Visible
              </button>
              <button
                type="button"
                className="selection-action-btn"
                onClick={onDeselectAll}
                aria-label="Deselect all templates"
              >
                Deselect All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Template List */}
      <div className="sidebar-section templates-list">
        {filteredTemplates.length === 0 ? (
          <div className="gitignore-no-results">
            <p>
              {state.searchQuery
                ? `No templates matching "${state.searchQuery}"`
                : 'No templates in this category'}
            </p>
            {state.searchQuery && (
              <button
                type="button"
                className="clear-search-hint"
                onClick={() => onSearchChange('')}
                aria-label="Clear search and show all templates"
              >
                Clear search
              </button>
            )}
            {state.visibilityFilter !== 'all' && !state.searchQuery && (
              <button
                type="button"
                className="clear-search-hint"
                onClick={() => onFilterChange('all')}
                aria-label="Show all categories"
              >
                Show all categories
              </button>
            )}
          </div>
        ) : (
          <div
            className="template-grid"
            role="listbox"
            aria-label="Template results"
            aria-multiselectable="true"
            tabIndex={-1}
            ref={templateGridRef}
            onKeyDown={handleTemplateGridKeyDown}
          >
            {filteredTemplates.map((template, index) => (
              <label
                key={template.id}
                className={`template-card ${
                  state.selectedTemplates.includes(template.id) ? 'selected' : ''
                }`}
                tabIndex={-1}
                data-template-index={index}
                data-template-id={template.id}
              >
                <input
                  type="checkbox"
                  className="template-checkbox"
                  checked={state.selectedTemplates.includes(template.id)}
                  onChange={() => onToggleTemplate(template.id)}
                  tabIndex={-1}
                  aria-hidden="true"
                />
                <div className="template-icon">{template.icon}</div>
                <div
                  className="template-info"
                  role="option"
                  aria-selected={state.selectedTemplates.includes(template.id)}
                >
                  <div className="template-name">{template.label}</div>
                  <div className="template-desc">
                    {template.description}
                    <span className="visually-hidden">
                      {state.selectedTemplates.includes(template.id)
                        ? ' (selected, press Enter to deselect)'
                        : ' (press Enter to select)'}
                    </span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Custom Rules */}
      <div className="sidebar-section">
        <h3>Custom Rules</h3>
        {onCustomRulesPositionChange && (
          <div
            className="custom-rules-position"
            role="radiogroup"
            aria-label="Custom rules position"
          >
            <button
              type="button"
              role="radio"
              aria-checked={state.customRulesPosition === 'prepend'}
              className={`position-btn ${state.customRulesPosition === 'prepend' ? 'active' : ''}`}
              onClick={() => onCustomRulesPositionChange('prepend')}
              aria-label="Prepend custom rules before template sections"
            >
              ⬆ Prepend
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={state.customRulesPosition === 'append'}
              className={`position-btn ${state.customRulesPosition === 'append' ? 'active' : ''}`}
              onClick={() => onCustomRulesPositionChange('append')}
              aria-label="Append custom rules after template sections"
            >
              ⬇ Append
            </button>
          </div>
        )}
        <div className="input-group">
          <div className="gitignore-editor-wrapper">
            <GitignoreHighlight value={state.customRules} />
            <textarea
              value={state.customRules}
              onChange={(e) => onCustomRulesChange(e.target.value)}
              className="gitignore-textarea gitignore-textarea-editor"
              aria-label="Custom .gitignore rules"
              spellCheck={false}
              placeholder={
                'Add your own rules here...\ne.g.\nmy-secrets/\n*.local\n!important.config\n# Or a comment explaining a rule\nbuild-output/'
              }
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="sidebar-section sidebar-actions">
        <button
          type="button"
          className="gitignore-btn gitignore-btn-primary gitignore-btn-full"
          onClick={onGenerate}
          disabled={selectedCount === 0 && !state.customRules.trim()}
          aria-label="Generate .gitignore"
        >
          Generate .gitignore
        </button>
        {(state.outputContent || selectedCount > 0 || state.customRules.trim()) && (
          <button
            type="button"
            className="gitignore-btn gitignore-btn-outline gitignore-btn-full"
            onClick={onClear}
            aria-label="Clear all selections"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}

ToolSidebar.displayName = 'ToolSidebar';
