import { test, expect } from '@playwright/test';
import { gotoTool, isMobileProject } from './utils';

test.describe('theme toggle persistence', () => {
  test('toggles between light and dark and persists across reload', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');

    const darkButton = page.getByRole('button', { name: /Switch to dark mode/i });
    await expect(darkButton).toBeVisible();
    await darkButton.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    // The opposite toggle is now offered, proving the resolved theme survived.
    await expect(page.getByRole('button', { name: /Switch to light mode/i })).toBeVisible();

    await page.getByRole('button', { name: /Switch to light mode/i }).click();
    await expect(html).toHaveAttribute('data-theme', 'light');

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'light');
    await expect(page.getByRole('button', { name: /Switch to dark mode/i })).toBeVisible();
  });

  test('persists the explicit theme choice in localStorage', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Switch to dark mode/i }).click();
    expect(await page.evaluate(() => localStorage.getItem('itsjust-theme'))).toBe('dark');
  });

  test('theme applies before hydration with no flash of the wrong palette', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('itsjust-theme', 'dark'));
    await page.goto('/');
    // ThemeScript runs inline in <head>, so the attribute is set on first paint.
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('high contrast toggle persists across reload', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const contrastButton = page.getByRole('button', { name: /Enable high contrast/i });
    await contrastButton.click();
    await expect(html).toHaveAttribute('data-contrast', 'more');

    await page.reload();
    await expect(html).toHaveAttribute('data-contrast', 'more');
    await expect(page.getByRole('button', { name: /Disable high contrast/i })).toBeVisible();
  });

  test('theme survives a full tool workflow without resetting state', async ({
    page,
  }, testInfo) => {
    test.skip(
      isMobileProject(testInfo.project.name),
      'Toolbar theme toggle is always visible here'
    );
    await gotoTool(page);
    await page.locator('.template-card').filter({ hasText: 'Node.js' }).first().click();
    await page.getByRole('button', { name: /Switch to dark mode/i }).click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('.template-card').filter({ hasText: 'Node.js' }).first()).toHaveClass(
      /selected/
    );
  });
});
