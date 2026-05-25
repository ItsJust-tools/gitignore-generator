import type { ExportOptions, ExportResult } from '@itsjust/core';

export const exporter = {
  format: 'json' as const,
  async export(
    _el: HTMLElement,
    options: ExportOptions
  ): Promise<ExportResult> {
    const content = options.data as unknown as string;
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
    const templates: Record<string, string[]> = {
      entries: [],
      custom: [],
    };
    let currentSection = 'entries';

    for (const line of lines) {
      if (line.startsWith('# Custom rules')) {
        currentSection = 'custom';
      } else if (line.startsWith('#')) {
        continue;
      } else if (line.trim()) {
        templates[currentSection].push(line.trim());
      }
    }

    const json = JSON.stringify(
      {
        generated: new Date().toISOString(),
        source: 'gitignore-generator.itsjust.tools',
        entries: templates.entries,
        customRules: templates.custom,
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
