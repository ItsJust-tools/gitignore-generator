import type { ExportOptions, ExportResult } from '@itsjust/core';

export const exporter = {
  format: 'json' as const,
  async export(
    el: HTMLElement,
    options: ExportOptions
  ): Promise<ExportResult> {
    // Read content from a data attribute or the element text
    const content = el.getAttribute('data-content') || el.textContent || '';
    if (!content) {
      return {
        success: false,
        error: 'No .gitignore content to export',
        format: 'json',
        filename: options.filename || '.gitignore.json',
        data: null,
      };
    }

    const lines = content.split('\n');
    const entries: string[] = [];
    const custom: string[] = [];
    let currentSection: 'entries' | 'custom' = 'entries';

    for (const line of lines) {
      if (line.startsWith('# Custom rules')) {
        currentSection = 'custom';
      } else if (line.startsWith('#')) {
        continue;
      } else if (line.trim()) {
        if (currentSection === 'entries') {
          entries.push(line.trim());
        } else {
          custom.push(line.trim());
        }
      }
    }

    const json = JSON.stringify(
      {
        generated: new Date().toISOString(),
        source: 'gitignore-generator.itsjust.tools',
        entries,
        customRules: custom,
      },
      null,
      2
    );

    const blob = new Blob([json], { type: 'application/json' });
    return {
      success: true,
      format: 'json',
      filename: options.filename || '.gitignore.json',
      data: blob,
    };
  },
};

export default exporter;
