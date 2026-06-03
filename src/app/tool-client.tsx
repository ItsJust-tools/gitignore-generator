'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ToolShell, useTool, ImportExport } from '@itsjust/core';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import {
  toolConfig,
  templateBaseVersion,
  gitignoreTool,
  buildGitignore,
  ToolCanvas,
  ToolToolbar,
  ToolSidebar,
  TEMPLATES,
} from '@/tool';
import type { GitignoreTemplate, VisibilityFilter } from '@/tool/types';

export default function ToolClient() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const tool = useTool(gitignoreTool, canvasRef);
  const setToolData = tool.state.setData;
  const showToast = tool.toast;
  const [isSharing, setIsSharing] = useState(false);
  const hasLoadedSharedState = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(
    () => typeof window !== 'undefined' && window.innerWidth > 768 && toolConfig.features.sidebar
  );

  const title = toolConfig.name;
  const [isEditingBrand, setIsEditingBrand] = useState(false);
  const [editValue, setEditValue] = useState(title);

  useEffect(() => {
    document.title = title;
  }, [title]);

  const handleToggleTemplate = useCallback(
    (id: GitignoreTemplate) => {
      setToolData((prev) => {
        const exists = prev.selectedTemplates.includes(id);
        return {
          ...prev,
          selectedTemplates: exists
            ? prev.selectedTemplates.filter((t) => t !== id)
            : [...prev.selectedTemplates, id],
          outputContent: '',
          copied: false,
        };
      });
    },
    [setToolData]
  );

  const handleCustomRulesChange = useCallback(
    (rules: string) => {
      setToolData((prev) => ({
        ...prev,
        customRules: rules,
        outputContent: '',
      }));
    },
    [setToolData]
  );

  const handleFilterChange = useCallback(
    (filter: VisibilityFilter) => {
      setToolData((prev) => ({
        ...prev,
        visibilityFilter: filter,
      }));
    },
    [setToolData]
  );

  const handleSearchChange = useCallback(
    (query: string) => {
      setToolData((prev) => ({
        ...prev,
        searchQuery: query,
      }));
    },
    [setToolData]
  );

  const handleGenerate = useCallback(() => {
    setToolData((prev) => ({
      ...prev,
      outputContent: buildGitignore(prev.selectedTemplates, prev.customRules),
    }));
    showToast('.gitignore generated', 'success');
  }, [setToolData, showToast]);

  const handleClear = useCallback(() => {
    setToolData((prev) => ({
      ...prev,
      selectedTemplates: [],
      customRules: '',
      outputContent: '',
      searchQuery: '',
      visibilityFilter: 'all',
      copied: false,
    }));
  }, [setToolData]);

  const handleSelectAll = useCallback(() => {
    setToolData((prev) => {
      const currentFilter = prev.visibilityFilter;
      let filtered = TEMPLATES;
      if (currentFilter !== 'all') {
        filtered = filtered.filter((t) => t.category === currentFilter);
      }
      const allVisibleIds: GitignoreTemplate[] = filtered.map((t) => t.id);
      return {
        ...prev,
        selectedTemplates: [...new Set([...prev.selectedTemplates, ...allVisibleIds])],
      };
    });
  }, [setToolData]);

  const handleDeselectAll = useCallback(() => {
    setToolData((prev) => ({ ...prev, selectedTemplates: [], outputContent: '', copied: false }));
  }, [setToolData]);

  const handleCopy = useCallback(() => {
    const content = tool.state.data.outputContent;
    if (content && navigator.clipboard) {
      navigator.clipboard.writeText(content).then(
        () => {
          setToolData((prev) => ({ ...prev, copied: true }));
          showToast('Copied to clipboard', 'success');
          setTimeout(() => {
            setToolData((prev) => ({ ...prev, copied: false }));
          }, 2000);
        },
        () => {
          showToast('Failed to copy', 'error');
        }
      );
    }
  }, [tool.state.data.outputContent, setToolData, showToast]);

  const handleDownload = useCallback(() => {
    const content = tool.state.data.outputContent;
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.gitignore';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('.gitignore downloaded', 'success');
  }, [tool.state.data.outputContent, showToast]);

  // Load shared state from URL
  useEffect(() => {
    if (hasLoadedSharedState.current) return;
    hasLoadedSharedState.current = true;
    const params = new URLSearchParams(window.location.search);
    const encodedState = params.get('state');
    if (!encodedState) return;
    try {
      const serialized = decompressFromEncodedURIComponent(encodedState);
      if (!serialized) throw new Error('Invalid shared URL');
      const parsed: unknown = JSON.parse(serialized);
      const deserialized = gitignoreTool.deserialize(parsed);
      if (!deserialized.success) throw new Error(deserialized.error);
      setToolData(deserialized.data);
      showToast('Loaded state from shared URL', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load shared URL';
      showToast(message, 'error');
    }
  }, [setToolData, showToast]);

  const handleShare = useCallback(async () => {
    setIsSharing(true);
    try {
      const serialized = gitignoreTool.serialize(tool.state.data);
      const encodedState = compressToEncodedURIComponent(serialized);
      if (!encodedState) throw new Error('Failed to encode state for URL');
      const url = new URL(window.location.href);
      url.searchParams.set('state', encodedState);
      url.searchParams.set('tool', toolConfig.id);
      window.history.replaceState(null, '', url.toString());

      const shareUrl = url.toString();
      if (navigator.share) {
        try {
          await navigator.share({ title, url: shareUrl });
          showToast('Share URL ready', 'success');
          return;
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') return;
        }
      }
      await navigator.clipboard.writeText(shareUrl);
      showToast('Share URL copied to clipboard', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create share URL';
      showToast(message, 'error');
    } finally {
      setIsSharing(false);
    }
  }, [showToast, tool.state.data, title]);

  const toolbarActions = useMemo(
    () => ({
      ...tool.toolbarActions,
      onBrandClick: () => {
        setEditValue(title);
        setIsEditingBrand(true);
      },
      isBrandEditing: isEditingBrand,
      brandValue: isEditingBrand ? editValue : title,
      onBrandChange: (value: string) => setEditValue(value),
      onBrandCommit: () => {
        setIsEditingBrand(false);
      },
      onBrandCancel: () => {
        setEditValue(title);
        setIsEditingBrand(false);
      },
    }),
    [tool.toolbarActions, isEditingBrand, editValue, title]
  );

  const toolbarContent = (
    <>
      <ToolToolbar />
      <ImportExport
        formats={tool.supportedFormats}
        onExport={tool.handleExport}
        onImport={tool.importFromFile}
        isImporting={tool.isImporting}
        onShare={handleShare}
        isSharing={isSharing}
      />
    </>
  );

  const sidebarContent = (
    <ToolSidebar
      state={tool.state.data}
      onToggleTemplate={handleToggleTemplate}
      onCustomRulesChange={handleCustomRulesChange}
      onFilterChange={handleFilterChange}
      onSearchChange={handleSearchChange}
      onGenerate={handleGenerate}
      onClear={handleClear}
      onSelectAll={handleSelectAll}
      onDeselectAll={handleDeselectAll}
    />
  );

  const canvasContent = (
    <ToolCanvas
      state={tool.state.data}
      canvasRef={canvasRef}
      onCopy={handleCopy}
      onDownload={handleDownload}
    />
  );

  const statusBarContent = (
    <>
      <span
        className={`status-slot status-slot-state ${tool.state.isDirty ? 'status-unsaved' : 'status-saved'}`}
      >
        {tool.state.isDirty ? (
          <>
            <span className="status-saving-dot" />
            Unsaved
          </>
        ) : tool.state.lastSaved ? (
          <>Saved {tool.state.lastSaved}</>
        ) : (
          'Ready'
        )}
      </span>
      <span className="status-slot status-slot-templates">
        {tool.state.data.selectedTemplates.length} template{tool.state.data.selectedTemplates.length !== 1 ? 's' : ''}
      </span>
      <span className="status-slot status-slot-tool-version">Tool v{toolConfig.version}</span>
      <span className="status-slot status-slot-template-version">
        Template v{templateBaseVersion}
      </span>
    </>
  );

  return (
    <ToolShell
      config={toolConfig}
      actions={toolbarActions}
      sidebarOpen={sidebarOpen}
      onSidebarChange={setSidebarOpen}
      toolbar={toolbarContent}
      sidebar={sidebarContent}
      canvas={canvasContent}
      statusBar={statusBarContent}
    />
  );
}
