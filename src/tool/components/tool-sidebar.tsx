'use client';

import type { GitignoreState, GitignoreTemplate, VisibilityFilter } from '../types';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../types';
import { useCallback, useMemo, useRef } from 'react';

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
  onCustomRulesChange: (rules: string) => void;
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
  onCustomRulesChange,
  onFilterChange,
  onSearchChange,
  onGenerate,
  onClear,
  onSelectAll,
  onDeselectAll,
}: ToolSidebarProps) {
  const filterTabRefs = useRef<(HTMLButtonElement | null)[]>([]);

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
                  // Toggle: if all selected, deselect them; otherwise add all
                  for (const t of preset.templates) {
                    if (allSelected) {
                      // If already selected, deselect all of this preset's templates
                      onToggleTemplate(t);
                    } else if (!state.selectedTemplates.includes(t)) {
                      onToggleTemplate(t);
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
          <div className="template-grid">
            {filteredTemplates.map((template) => (
              <label
                key={template.id}
                className={`template-card ${
                  state.selectedTemplates.includes(template.id) ? 'selected' : ''
                }`}
              >
                <input
                  type="checkbox"
                  className="template-checkbox"
                  checked={state.selectedTemplates.includes(template.id)}
                  onChange={() => onToggleTemplate(template.id)}
                  aria-label={`Toggle ${template.label} template`}
                />
                <div className="template-icon">{template.icon}</div>
                <div className="template-info">
                  <div className="template-name">{template.label}</div>
                  <div className="template-desc">{template.description}</div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Custom Rules */}
      <div className="sidebar-section">
        <h3>Custom Rules</h3>
        <div className="input-group">
          <textarea
            value={state.customRules}
            onChange={(e) => onCustomRulesChange(e.target.value)}
            className="gitignore-textarea"
            aria-label="Custom .gitignore rules"
            placeholder={
              'Add your own rules here...\ne.g.\nmy-secrets/\n*.local\n!important.config\n# Or a comment explaining a rule\nbuild-output/'
            }
            rows={4}
          />
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
