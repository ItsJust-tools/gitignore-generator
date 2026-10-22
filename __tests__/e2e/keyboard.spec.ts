import { test, expect } from '@playwright/test';
import { closeSidebar, generate, gotoTool, isMobileProject, selectTemplate } from './utils';

/**
 * Keyboard shortcut dispatch: shell-level shortcuts (undo/redo/save/sidebar)
 * live in @itsjust/core, tool-level shortcuts (copy/download/focus search/
 * generate) live in the tool client. Both are exercised here so a regression
 * in either layer fails CI.
 */
test.describe('keyboard shortcuts', () => {
  test('Ctrl+Z undoes and Ctrl+Y redoes a selection change', async ({ page }) => {
    await gotoTool(page);
    await selectTemplate(page, 'Node.js');
    await selectTemplate(page, 'macOS');
    await expect(page.locator('.template-card.selected')).toHaveCount(2);

    await page.keyboard.press('Control+z');
    await expect(page.locator('.template-card.selected')).toHaveCount(1);

    await page.keyboard.press('Control+y');
    await expect(page.locator('.template-card.selected')).toHaveCount(2);
  });

  test('Ctrl+Shift+Z redoes as well', async ({ page }) => {
    await gotoTool(page);
    await selectTemplate(page, 'Node.js');
    await page.keyboard.press('Control+z');
    await expect(page.locator('.template-card.selected')).toHaveCount(0);

    await page.keyboard.press('Control+Shift+z');
    await expect(page.locator('.template-card.selected')).toHaveCount(1);
  });

  test('undo and redo toolbar buttons mirror keyboard state', async ({ page }, testInfo) => {
    await gotoTool(page);
    await selectTemplate(page, 'Node.js');
    // The mobile sidebar sheet covers the toolbar, so dismiss it before clicking.
    if (isMobileProject(testInfo.project.name)) await closeSidebar(page);

    const undoButton = page.getByRole('button', { name: /Undo \(Ctrl\+Z\)/i });
    const redoButton = page.getByRole('button', { name: /Redo \(Ctrl\+Y\)/i });
    await expect(redoButton).toBeDisabled();

    await expect(undoButton).toBeEnabled();
    await undoButton.click();
    await expect(redoButton).toBeEnabled();
    await redoButton.click();
    await expect(page.locator('.template-card.selected')).toHaveCount(1);
  });

  test('Ctrl+S saves immediately instead of waiting for the debounce', async ({ page }) => {
    await gotoTool(page);
    await selectTemplate(page, 'Node.js');

    await page.keyboard.press('Control+s');

    // Auto-save debounce is 2000ms; a short window proves Ctrl+S triggered the save.
    await expect
      .poll(
        async () =>
          page.evaluate(() =>
            Object.keys(window.localStorage).some(
              (key) => key.includes('itsjust:history:') && key.endsWith(':gitignore-generator')
            )
          ),
        { timeout: 1500, intervals: [50, 100, 200] }
      )
      .toBe(true);

    await expect(page.locator('.status-slot-state')).toContainText(/Saved|just now/);
  });

  test('Ctrl+B toggles the sidebar', async ({ page }, testInfo) => {
    test.skip(isMobileProject(testInfo.project.name), 'Desktop sidebar shortcut');
    await page.goto('/');
    const sidebar = page.locator('.tool-shell-sidebar');
    await expect(sidebar).toHaveClass(/open/);

    await page.keyboard.press('Control+b');
    await expect(sidebar).toHaveClass(/collapsed/);

    await page.keyboard.press('Control+b');
    await expect(sidebar).toHaveClass(/open/);
  });

  test('Ctrl+Shift+F focuses the template search', async ({ page }) => {
    await gotoTool(page);
    await page.keyboard.press('Control+Shift+f');
    await expect(page.getByRole('searchbox', { name: /Search templates/i })).toBeFocused();
  });

  test('Ctrl+Enter generates from the current selection', async ({ page }) => {
    await gotoTool(page);
    await selectTemplate(page, 'Node.js');
    await page.locator('.gitignore-textarea').focus();
    await page.keyboard.press('Control+Enter');
    await expect(page.locator('.gitignore-output')).toHaveValue(/node_modules\//);
  });

  test('Ctrl+Shift+C copies the generated content', async ({ page, browserName }, testInfo) => {
    test.skip(browserName !== 'chromium', 'Clipboard permissions are Chromium-only here');
    test.skip(isMobileProject(testInfo.project.name), 'Keyboard shortcuts are desktop-only');
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await gotoTool(page);
    await selectTemplate(page, 'Node.js');
    await generate(page);

    await page.keyboard.press('Control+Shift+c');
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()), { timeout: 5000 })
      .toContain('node_modules/');
  });

  test('Ctrl+Shift+D downloads the generated .gitignore', async ({
    page,
    browserName,
  }, testInfo) => {
    test.skip(isMobileProject(testInfo.project.name), 'Keyboard shortcuts are desktop-only');
    test.skip(browserName !== 'chromium', 'Download assertions are Chromium-only here');
    await gotoTool(page);
    await selectTemplate(page, 'Node.js');
    await generate(page);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.keyboard.press('Control+Shift+d'),
    ]);
    // Chromium rewrites a leading-dot download name (".gitignore") because
    // dotfiles are hidden on some filesystems, so assert the intent.
    expect(download.suggestedFilename()).toMatch(/gitignore/i);
    const path = await download.path();
    expect(path).toBeTruthy();
  });

  test('Ctrl+Shift+? opens the shortcuts overlay and Escape closes it', async ({
    page,
  }, testInfo) => {
    test.skip(isMobileProject(testInfo.project.name), 'Keyboard shortcuts are desktop-only');
    await gotoTool(page);
    await page.keyboard.press('Control+Shift+?');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/Undo/);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});
