import type { ExportOptions, ExportResult } from '@itsjust/core';

export const exporter = {
  format: 'txt' as const,
  async export(el: HTMLElement, options: ExportOptions): Promise<ExportResult> {
    // Read content from a data attribute or the element text
    const content = el.getAttribute('data-content') || el.textContent || '';
    if (!content) {
      return {
        success: false,
        error: 'No .gitignore content to export',
        format: 'txt',
        filename: options.filename || '.gitignore.txt',
        data: null,
      };
    }

    const blob = new Blob([content], { type: 'text/plain' });
    return {
      success: true,
      format: 'txt',
      filename: options.filename || '.gitignore.txt',
      data: blob,
    };
  },
};

export default exporter;
