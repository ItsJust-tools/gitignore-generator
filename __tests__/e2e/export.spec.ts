import { test, expect } from '@playwright/test';
import { generate, gotoTool, isMobileProject, selectTemplate } from './utils';
import { readFile } from 'node:fs/promises';

async function openExportMenu(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /^Export$/i }).click();
  const listbox = page.getByRole('listbox');
  await expect(listbox).toBeVisible();
  return listbox;
}

async function exportAs(page: import('@playwright/test').Page, format: string) {
  await openExportMenu(page);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('option', { name: new RegExp(format, 'i') }).click(),
  ]);
  return download;
}

test.describe('export payload verification', () => {
  test('export dropdown lists every supported format', async ({ page }, testInfo) => {
    test.skip(isMobileProject(testInfo.project.name), 'Dropdown is desktop-only in this suite');
    await gotoTool(page);
    await selectTemplate(page, 'Node.js');
    await generate(page);

    await openExportMenu(page);
    const options = page.getByRole('option');
    await expect(options).toHaveCount(6);
    for (const label of ['JSON Data', 'Text File', 'PNG Image', 'PDF Document']) {
      await expect(page.getByRole('option', { name: new RegExp(label, 'i') })).toBeVisible();
    }
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
  });

  test('JSON export contains every generated entry and custom rule', async ({ page }, testInfo) => {
    test.skip(isMobileProject(testInfo.project.name), 'Dropdown is desktop-only in this suite');
    await gotoTool(page);
    await selectTemplate(page, 'Node.js');
    await page.locator('.gitignore-textarea').fill('*.local\nsecrets/');
    const output = await generate(page);
    const generated = await output.inputValue();

    const download = await exportAs(page, 'JSON');
    expect(download.suggestedFilename()).toMatch(/\.json$/);

    const path = await download.path();
    expect(path).toBeTruthy();
    const payload = JSON.parse(await readFile(path!, 'utf8')) as {
      generated: string;
      source: string;
      entries: string[];
      customRules: string[];
    };

    expect(Date.parse(payload.generated)).not.toBeNaN();
    expect(payload.source).toBe('gitignore-generator.itsjust.tools');
    // Entries come from the generated content, not the surrounding UI chrome.
    expect(payload.entries).toContain('node_modules/');
    expect(payload.entries).toContain('package-lock.json');
    expect(payload.entries).not.toContain('Generated .gitignore');
    expect(payload.customRules).toEqual(['*.local', 'secrets/']);

    // Every exported entry must exist in the generated text.
    for (const entry of payload.entries) {
      expect(generated).toContain(entry);
    }
  });

  test('TXT export matches the generated content byte-for-byte', async ({ page }, testInfo) => {
    test.skip(isMobileProject(testInfo.project.name), 'Dropdown is desktop-only in this suite');
    await gotoTool(page);
    await selectTemplate(page, 'Python');
    const output = await generate(page);
    const generated = await output.inputValue();

    const download = await exportAs(page, 'Text File');
    const path = await download.path();
    expect(path).toBeTruthy();
    expect(await readFile(path!, 'utf8')).toBe(generated);
  });

  test('PNG export produces a real image blob', async ({ page }, testInfo) => {
    test.skip(isMobileProject(testInfo.project.name), 'Image capture is desktop-only here');
    await gotoTool(page);
    await selectTemplate(page, 'Node.js');
    await generate(page);

    const download = await exportAs(page, 'PNG');
    expect(download.suggestedFilename()).toMatch(/\.(png|jpg|webp)$/);
    const path = await download.path();
    const buffer = await readFile(path!);
    expect(buffer.byteLength).toBeGreaterThan(1000);
    // PNG magic number.
    expect(buffer.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  });

  test('share button encodes the current state into the URL', async ({ page }, testInfo) => {
    test.skip(isMobileProject(testInfo.project.name), 'Share relies on desktop clipboard here');
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await gotoTool(page);
    await selectTemplate(page, 'Node.js');
    await page.getByRole('button', { name: /^Share$/i }).click();

    await expect
      .poll(() => page.evaluate(() => window.location.search), { timeout: 5000 })
      .toContain('state=');
    expect(page.url()).toContain('tool=gitignore-generator');
  });

  test('shared URL restores state on a fresh load', async ({ page }, testInfo) => {
    test.skip(isMobileProject(testInfo.project.name), 'Share relies on desktop clipboard here');
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await gotoTool(page);
    await selectTemplate(page, 'Node.js');
    await page.getByRole('button', { name: /^Share$/i }).click();
    await expect.poll(() => page.evaluate(() => window.location.search)).toContain('state=');
    const sharedUrl = page.url();

    await page.evaluate(() => window.localStorage.clear());
    await page.goto(sharedUrl);

    await expect(page.locator('.template-card').filter({ hasText: 'Node.js' }).first()).toHaveClass(
      /selected/,
      { timeout: 10000 }
    );
  });
});
