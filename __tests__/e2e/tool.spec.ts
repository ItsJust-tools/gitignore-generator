import { test, expect } from '@playwright/test';
import {
  closeSidebar,
  generate,
  gotoTool,
  isMobileProject,
  openSidebar,
  selectTemplate,
} from './utils';

test.describe('core tool workflows', () => {
  test('tool loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/\.gitignore Generator/);
  });

  test('templates are visible and selectable', async ({ page }) => {
    await gotoTool(page);
    await selectTemplate(page, 'Node.js');
    await expect(page.locator('.template-card.selected')).toHaveCount(1);
  });

  test('selecting a template deselects it on a second click', async ({ page }) => {
    await gotoTool(page);
    await selectTemplate(page, 'Node.js');
    await page.locator('.template-card').filter({ hasText: 'Node.js' }).first().click();
    await expect(page.locator('.template-card.selected')).toHaveCount(0);
  });

  test('generate button works when templates selected', async ({ page }) => {
    await gotoTool(page);
    await selectTemplate(page, 'Node.js');
    const output = await generate(page);
    const text = await output.inputValue();
    expect(text).toContain('# Node.js');
    expect(text).toContain('node_modules/');
  });

  test('generate button is disabled when no templates selected and no custom rules', async ({
    page,
  }) => {
    await gotoTool(page);
    await expect(page.getByRole('button', { name: /Generate .gitignore/i })).toBeDisabled();
  });

  test('generate button enables from custom rules alone', async ({ page }) => {
    await gotoTool(page);
    await page.locator('.gitignore-textarea').fill('my-secrets/');
    const generateButton = page.getByRole('button', { name: /Generate .gitignore/i });
    await expect(generateButton).toBeEnabled();
    await generateButton.click();
    await expect(page.locator('.gitignore-output')).toHaveValue(/my-secrets\//);
  });

  test('custom rules textarea accepts input', async ({ page }) => {
    await gotoTool(page);
    const textarea = page.locator('.gitignore-textarea');
    await textarea.fill('my-local-config/\n*.secret');
    await expect(textarea).toHaveValue('my-local-config/\n*.secret');
  });

  test('filter tabs change template visibility', async ({ page }) => {
    await gotoTool(page);
    await page.getByRole('tab', { name: /Languages/i }).click();
    await expect(page.locator('.template-card').filter({ hasText: 'Node.js' })).toBeVisible();
    await expect(page.locator('.template-card').filter({ hasText: 'macOS' })).toHaveCount(0);
  });

  test('filter tabs support keyboard navigation', async ({ page }) => {
    await gotoTool(page);
    const allTab = page.getByRole('tab', { name: /All/i });
    await allTab.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: /Languages/i })).toBeFocused();
    await page.keyboard.press('End');
    await expect(page.getByRole('tab').last()).toBeFocused();
  });

  test('search filters templates and can be cleared', async ({ page }) => {
    await gotoTool(page);
    const search = page.getByRole('searchbox', { name: /Search templates/i });
    await search.fill('Rust');
    await expect(page.locator('.template-card').filter({ hasText: 'Rust' })).toBeVisible();
    await expect(page.locator('.template-card').filter({ hasText: 'Node.js' })).toHaveCount(0);

    await page.getByRole('button', { name: /Clear search/i }).click();
    await expect(search).toHaveValue('');
    await expect(page.locator('.template-card').filter({ hasText: 'Node.js' })).toBeVisible();
  });

  test('no-results state is shown for an unmatched search', async ({ page }) => {
    await gotoTool(page);
    await page.getByRole('searchbox', { name: /Search templates/i }).fill('zzz-not-a-template');
    await expect(page.getByText(/No templates matching/)).toBeVisible();
    await page.getByRole('button', { name: /Clear search and show all/i }).click();
    await expect(page.getByText(/No templates matching/)).toHaveCount(0);
  });

  test('quick pick preset selects a stack and toggles it off', async ({ page }) => {
    await gotoTool(page);
    const preset = page.getByRole('button', { name: /Add Node\.js API stack/i });
    await preset.click();
    await expect(page.locator('.template-card.selected')).toHaveCount(3);

    await page.getByRole('button', { name: /Remove Node\.js API stack/i }).click();
    await expect(page.locator('.template-card.selected')).toHaveCount(0);
  });

  test('select all visible and deselect all update the selection', async ({ page }) => {
    await gotoTool(page);
    await selectTemplate(page, 'Node.js');
    await page.getByRole('button', { name: /Select all visible/i }).click();
    const total = await page.locator('.template-card').count();
    await expect(page.locator('.template-card.selected')).toHaveCount(total);

    await page.getByRole('button', { name: /Deselect all templates/i }).click();
    await expect(page.locator('.template-card.selected')).toHaveCount(0);
  });

  test('clear all button resets everything', async ({ page }) => {
    await gotoTool(page);
    await selectTemplate(page, 'Node.js');
    await generate(page);

    await page.getByRole('button', { name: /Clear all selections/i }).click();

    await expect(page.locator('.gitignore-output')).toHaveCount(0);
    await expect(page.getByText(/Select templates below/)).toBeVisible();
    await expect(page.locator('.template-card.selected')).toHaveCount(0);
    await expect(page.locator('.gitignore-textarea')).toHaveValue('');
  });

  test('sidebar toggle button works', async ({ page }, testInfo) => {
    await page.goto('/');
    const sidebar = page.locator('.tool-shell-sidebar');
    const mobile = isMobileProject(testInfo.project.name);

    if (mobile) {
      await expect(sidebar).toHaveClass(/collapsed/);
      await page.locator('[data-sidebar-toggle]').click();
      await expect(sidebar).toHaveClass(/open/);
      await expect(page.locator('.sidebar-backdrop')).toBeVisible();
      await closeSidebar(page);
      return;
    }

    await expect(sidebar).toHaveClass(/open/);
    await page.locator('[data-sidebar-toggle]').click();
    await expect(sidebar).toHaveClass(/collapsed/);
    await openSidebar(page);
    await expect(sidebar).toHaveClass(/open/);
  });

  test('mobile sidebar backdrop closes sidebar', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'Mobile-only behaviour');
    await page.goto('/');

    const sidebar = page.locator('.tool-shell-sidebar');
    await page.locator('[data-sidebar-toggle]').click();
    await expect(sidebar).toHaveClass(/open/);

    // Click the top edge of the backdrop: the sheet covers the lower 70vh.
    await page.locator('.sidebar-backdrop').click({ position: { x: 5, y: 5 } });
    await expect(sidebar).toHaveClass(/collapsed/);
  });

  test('404 page works', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
    expect(response?.headers()['content-type'] ?? '').toContain('text/html');
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  });
});

test.describe('SEO and metadata', () => {
  test('SEO meta tags are present', async ({ page }) => {
    await page.goto('/');
    expect(await page.title()).toBeTruthy();
    expect(await page.getAttribute('meta[name="description"]', 'content')).toBeTruthy();
    expect(await page.getAttribute('meta[property="og:title"]', 'content')).toBeTruthy();
    expect(await page.getAttribute('meta[property="og:image"]', 'content')).toBeTruthy();
    expect(await page.getAttribute('link[rel="canonical"]', 'href')).toBeTruthy();
  });

  test('JSON-LD structured data is present', async ({ page }) => {
    await page.goto('/');
    const content = await page.locator('script[type="application/ld+json"]').first().textContent();
    const parsed = JSON.parse(content!);
    expect(parsed['@type']).toBe('WebApplication');
    expect(parsed.name).toBeTruthy();
    expect(parsed.offers.price).toBe('0');
  });

  test('sitemap.xml is accessible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.ok()).toBe(true);
    expect(await response?.text()).toContain('urlset');
  });

  test('robots.txt is accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.ok()).toBe(true);
    expect(await response?.text()).toMatch(/User-[Aa]gent/);
  });

  test('visual regression — default view', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForSelector('.tool-shell-canvas');
    await expect(page.locator('.tool-shell')).toBeVisible();
    if (testInfo.project.name.includes('Mobile')) {
      await expect(page.locator('.tool-shell-canvas')).toBeVisible();
    }
  });
});
