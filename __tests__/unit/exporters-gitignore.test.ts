import { describe, it, expect } from 'vitest';
import jsonExporter from '@/tool/exporters/json';
import txtExporter from '@/tool/exporters/txt';
import type { ExportOptions } from '@itsjust/core';

describe('Gitignore JSON exporter', () => {
  const makeOptions = (overrides: Partial<ExportOptions> = {}): ExportOptions => ({
    format: 'json',
    filename: '.gitignore.json',
    ...overrides,
  });

  it('exports content from data-content attribute', async () => {
    const el = document.createElement('div');
    el.setAttribute('data-content', 'node_modules/\nbuild/');
    el.textContent = 'ignored-fallback';

    const result = await jsonExporter.export(el, makeOptions());
    expect(result.success).toBe(true);
    if (result.success && result.data) {
      const text = await result.data.text();
      const parsed = JSON.parse(text);
      expect(parsed.entries).toContain('node_modules/');
      expect(parsed.entries).toContain('build/');
      expect(parsed.source).toContain('gitignore-generator');
    }
  });

  it('falls back to textContent when no data-content attribute', async () => {
    const el = document.createElement('div');
    el.textContent = 'node_modules/\n.pytest_cache/\n\n# Custom rules\nmy-secret/';

    const result = await jsonExporter.export(el, makeOptions());
    expect(result.success).toBe(true);
    if (result.success && result.data) {
      const text = await result.data.text();
      const parsed = JSON.parse(text);
      expect(parsed.entries).toContain('node_modules/');
      expect(parsed.entries).toContain('.pytest_cache/');
      expect(parsed.customRules).toContain('my-secret/');
    }
  });

  it('returns error when content is empty', async () => {
    const el = document.createElement('div');
    const result = await jsonExporter.export(el, makeOptions());
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('No .gitignore content to export');
    }
  });

  it('includes generated timestamp and source metadata', async () => {
    const el = document.createElement('div');
    el.setAttribute('data-content', 'node_modules/');

    const result = await jsonExporter.export(el, makeOptions());
    expect(result.success).toBe(true);
    if (result.success && result.data) {
      const text = await result.data.text();
      const parsed = JSON.parse(text);
      expect(parsed).toHaveProperty('generated');
      expect(parsed.source).toBe('gitignore-generator.itsjust.tools');
    }
  });

  it('separates custom rules from template entries', async () => {
    const el = document.createElement('div');
    el.textContent = [
      '# Node.js',
      'node_modules/',
      'build/',
      '# Custom rules',
      'my-local.file',
      'secrets/',
    ].join('\n');

    const result = await jsonExporter.export(el, makeOptions());
    expect(result.success).toBe(true);
    if (result.success && result.data) {
      const text = await result.data.text();
      const parsed = JSON.parse(text);
      expect(parsed.entries).toEqual(['node_modules/', 'build/']);
      expect(parsed.customRules).toEqual(['my-local.file', 'secrets/']);
    }
  });

  it('uses correct filename and format in result', async () => {
    const el = document.createElement('div');
    el.setAttribute('data-content', 'node_modules/');

    const result = await jsonExporter.export(el, makeOptions({ filename: 'custom.json' }));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.filename).toBe('custom.json');
      expect(result.format).toBe('json');
      expect(result.data).toBeInstanceOf(Blob);
    }
  });

  it('uses default filename when none provided', async () => {
    const el = document.createElement('div');
    el.setAttribute('data-content', 'node_modules/');

    const result = await jsonExporter.export(el, makeOptions({ filename: undefined }));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.filename).toBe('.gitignore.json');
    }
  });
});

describe('Gitignore TXT exporter', () => {
  const makeOptions = (overrides: Partial<ExportOptions> = {}): ExportOptions => ({
    format: 'txt',
    filename: '.gitignore.txt',
    ...overrides,
  });

  it('exports content from data-content attribute', async () => {
    const el = document.createElement('div');
    el.setAttribute('data-content', 'node_modules/\nbuild/');

    const result = await txtExporter.export(el, makeOptions());
    expect(result.success).toBe(true);
    if (result.success && result.data) {
      const text = await result.data.text();
      expect(text).toBe('node_modules/\nbuild/');
    }
  });

  it('falls back to textContent when no data-content', async () => {
    const el = document.createElement('div');
    el.textContent = 'node_modules/\n__pycache__/';

    const result = await txtExporter.export(el, makeOptions());
    expect(result.success).toBe(true);
    if (result.success && result.data) {
      const text = await result.data.text();
      expect(text).toContain('node_modules/');
      expect(text).toContain('__pycache__/');
    }
  });

  it('returns error when content is empty', async () => {
    const el = document.createElement('div');
    const result = await txtExporter.export(el, makeOptions());
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('No .gitignore content to export');
    }
  });

  it('preserves exact content including whitespace', async () => {
    const content = ['', '# Node.js', 'node_modules/', '', '# Python', '__pycache__/', ''].join(
      '\n'
    );
    const el = document.createElement('div');
    el.setAttribute('data-content', content);

    const result = await txtExporter.export(el, makeOptions());
    expect(result.success).toBe(true);
    if (result.success && result.data) {
      const text = await result.data.text();
      expect(text).toBe(content);
    }
  });

  it('uses correct filename and format in result', async () => {
    const el = document.createElement('div');
    el.setAttribute('data-content', 'node_modules/');

    const result = await txtExporter.export(el, makeOptions({ filename: 'custom.txt' }));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.filename).toBe('custom.txt');
      expect(result.format).toBe('txt');
      expect(result.data).toBeInstanceOf(Blob);
    }
  });

  it('uses default filename when none provided', async () => {
    const el = document.createElement('div');
    el.setAttribute('data-content', 'node_modules/');

    const result = await txtExporter.export(el, makeOptions({ filename: undefined }));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.filename).toBe('.gitignore.txt');
    }
  });
});
