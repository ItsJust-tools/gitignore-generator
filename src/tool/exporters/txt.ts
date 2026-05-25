import type { ExportOptions, ExportResult } from '@itsjust/core';

export const exporter = {
  format: 'txt' as const,
  async export(
    _el: HTMLElement,
    options: ExportOptions
  ): Promise<ExportResult> {
    const content = options.data as unknown as string;
    if (!content) {
      return {
        success: false,
        error: 'No .gitignore content to export',
        format: 'txt',
        filename: options.filename || '.gitignore',
        data: null,
      };
    }

    const blob = new Blob([content], { type: 'text/plain' });
    return {
      success: true,
      format: 'txt',
      filename: options.filename || '.gitignore',
      data: blob,
    };
  },
};

export default exporter;
