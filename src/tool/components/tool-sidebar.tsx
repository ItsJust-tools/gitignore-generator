'use client';

import type { GitignoreState, GitignoreTemplate, VisibilityFilter } from '../types';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../types';
import { useMemo } from 'react';

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
        </div>
        <div className="filter-tabs" role="tablist" aria-label="Template category filter">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              className={`filter-tab ${state.visibilityFilter === cat.id ? 'active' : ''}`}
              onClick={() => onFilterChange(cat.id as VisibilityFilter)}
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
          <p className="gitignore-no-results">
            {state.searchQuery
              ? `No templates matching "${state.searchQuery}"`
              : 'No templates in this category'}
          </p>
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
            placeholder="Add your own rules here...&#10;e.g.&#10;my-secrets/&#10;*.local&#10;!important.config"
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
        {state.outputContent && (
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