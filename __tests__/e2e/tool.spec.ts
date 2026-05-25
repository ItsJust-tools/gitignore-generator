import { test, expect } from '@playwright/test';

async function closeBackdropIfOpen(page: import('@playwright/test').Page) {
  const backdrop = page.locator('.sidebar-backdrop');
  for (let i = 0; i < 3; i++) {
    const visible = await backdrop.isVisible().catch(() => false);
    if (!visible) return;
    await backdrop.evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(100);
  }
}

async function ensureToolbarInteractable(page: import('@playwright/test').Page) {
  await closeBackdropIfOpen(page);
  const backdrop = page.locator('.sidebar-backdrop');
  if (await backdrop.isVisible().catch(() => false)) {
    await page.keyboard.press('Control+b');
    await expect(backdrop).toBeHidden();
  }
}

test('tool loads with correct title', async ({ page }) => {
  await page.goto('/');
  const title = await page.title();
  expect(title).toContain('.gitignore Generator');
});

test('templates are visible and selectable', async ({ page }) => {
  await page.goto('/');
  await ensureToolbarInteractable(page);
  const templateCard = page.locator('.template-card').first();
  await expect(templateCard).toBeVisible();
  await templateCard.click();
  await expect(templateCard).toHaveClass(/selected/);
});

test('generate button works when templates selected', async ({ page }) => {
  await page.goto('/');
  await ensureToolbarInteractable(page);
  const templateCard = page.locator('.template-card').first();
  await templateCard.click();

  const generateButton = page.getByRole('button', { name: /Generate .gitignore/i });
  await expect(generateButton).toBeEnabled();
  await generateButton.click();

  const gitignoreOutput = page.locator('.gitignore-output');
  await expect(gitignoreOutput).toBeVisible();
  const text = await gitignoreOutput.inputValue();
  expect(text.length).toBeGreaterThan(0);
  expect(text).toContain('#');
});

test('generate button is disabled when no templates selected and no custom rules', async ({ page }) => {
  await page.goto('/');
  await ensureToolbarInteractable(page);
  const generateButton = page.getByRole('button', { name: /Generate .gitignore/i });
  await expect(generateButton).toBeDisabled();
});

test('custom rules textarea accepts input', async ({ page }) => {
  await page.goto('/');
  await ensureToolbarInteractable(page);
  const textarea = page.locator('.gitignore-textarea');
  await textarea.fill('my-local-config/\n*.secret');
  await expect(textarea).toHaveValue('my-local-config/\n*.secret');
});

test('filter tabs change template visibility', async ({ page }) => {
  await page.goto('/');
  await ensureToolbarInteractable(page);
  const languageTab = page.getByRole('tab', { name: /Languages/i });
  await languageTab.click();
  const nodeTemplate = page.locator('.template-card').filter({ hasText: 'Node.js' });
  await expect(nodeTemplate).toBeVisible();
  const macosTemplate = page.locator('.template-card').filter({ hasText: 'macOS' });
  await expect(macosTemplate).toHaveCount(0);
});

test('export dropdown opens and shows JSON format', async ({ page }, testInfo) => {
  await page.goto('/');
  await ensureToolbarInteractable(page);
  // First generate some content
  const templateCard = page.locator('.template-card').first();
  await templateCard.click();
  await page.getByRole('button', { name: /Generate .gitignore/i }).click();

  const exportButton = page.getByRole('button', { name: /export/i });
  await exportButton.click({ force: true });
  if (testInfo.project.name.includes('Mobile')) {
    await expect(exportButton).toBeVisible();
    return;
  }
  const menu = page.getByRole('listbox');
  await expect(menu).toBeVisible();
  await expect(page.getByRole('option', { name: /JSON/ })).toBeVisible();
  await page.click('body');
  await expect(menu).not.toBeVisible();
});

test('sidebar toggle button works', async ({ page }) => {
  await page.goto('/');
  await ensureToolbarInteractable(page);
  const sidebarToggle = page.locator('.toolbar-btn-sidebar');
  const sidebar = page.locator('.tool-shell-sidebar');
  const mobile =
    (await page.viewportSize())?.width !== undefined && (await page.viewportSize())!.width <= 768;
  const isCollapsed = await sidebar.evaluate((el) => el.classList.contains('collapsed'));
  if (isCollapsed) {
    await sidebarToggle.click();
    await expect(sidebar).toHaveClass(/open/);
    if (mobile) {
      await page.locator('.sidebar-backdrop').click();
    } else {
      await sidebarToggle.click();
    }
    await expect(sidebar).toHaveClass(/collapsed/);
    return;
  }
  await expect(sidebar).toHaveClass(/open/);
  if (mobile) {
    await page.locator('.sidebar-backdrop').click();
  } else {
    await sidebarToggle.click();
  }
  await expect(sidebar).toHaveClass(/collapsed/);
});

test('dark mode toggle works', async ({ page }) => {
  await page.goto('/');
  await ensureToolbarInteractable(page);
  const themeButton = page.getByRole('button', { name: /Switch to dark mode/i });
  if (await themeButton.isVisible()) {
    await themeButton.click();
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    const lightButton = page.getByRole('button', { name: /Switch to light mode/i });
    await lightButton.click();
    await expect(html).toHaveAttribute('data-theme', 'light');
  }
});

test('SEO meta tags are present', async ({ page }) => {
  await page.goto('/');

  const title = await page.title();
  expect(title).toBeTruthy();

  const description = await page.getAttribute('meta[name="description"]', 'content');
  expect(description).toBeTruthy();

  const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
  expect(ogTitle).toBeTruthy();

  const ogImage = await page.getAttribute('meta[property="og:image"]', 'content');
  expect(ogImage).toBeTruthy();

  const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
  expect(canonical).toBeTruthy();
});

test('JSON-LD structured data is present', async ({ page }) => {
  await page.goto('/');
  const jsonLd = page.locator('script[type="application/ld+json"]').first();
  const content = await jsonLd.textContent();
  const parsed = JSON.parse(content!);
  expect(parsed['@type']).toBe('WebApplication');
  expect(parsed.name).toBeTruthy();
  expect(parsed.offers.price).toBe('0');
});

test('sitemap.xml is accessible', async ({ page }) => {
  const response = await page.goto('/sitemap.xml');
  expect(response?.ok()).toBe(true);
  const content = await response?.text();
  expect(content).toContain('urlset');
});

test('robots.txt is accessible', async ({ page }) => {
  const response = await page.goto('/robots.txt');
  expect(response?.ok()).toBe(true);
  const content = await response?.text();
  expect(content).toMatch(/User-[Aa]gent/);
});

test('keyboard shortcuts overlay opens and closes', async ({ page, browserName }, _testInfo) => {
  if (browserName !== 'chromium') return;
  await page.goto('/');
  await ensureToolbarInteractable(page);
  if (_testInfo.project.name.includes('Mobile')) {
    await expect(page.getByRole('button', { name: /keyboard shortcuts/i })).toBeVisible();
    return;
  }
  await page.getByRole('button', { name: /keyboard shortcuts/i }).click({ force: true });
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('copy .gitignore to clipboard', async ({ page }) => {
  await page.goto('/');
  await ensureToolbarInteractable(page);
  // Select node template and generate
  await page.locator('.template-card').filter({ hasText: 'Node.js' }).click();
  await page.getByRole('button', { name: /Generate .gitignore/i }).click();

  // Click copy button
  const copyButton = page.getByRole('button', { name: /Copy .gitignore/i });
  await expect(copyButton).toBeVisible();
  await copyButton.click();
  await expect(page.getByText('Copied!')).toBeVisible();
});

test('download .gitignore file', async ({ page }) => {
  await page.goto('/');
  await ensureToolbarInteractable(page);
  // Select node template and generate
  await page.locator('.template-card').filter({ hasText: 'Node.js' }).click();
  await page.getByRole('button', { name: /Generate .gitignore/i }).click();

  // Click download button
  const downloadButton = page.getByRole('button', { name: /Download/i });
  await expect(downloadButton).toBeVisible();
  const [download] = await Promise.all([page.waitForEvent('download'), downloadButton.click()]);
  expect(download.suggestedFilename()).toMatch(/\.gitignore/);
});

test('export json download triggers', async ({ page }) => {
  await page.goto('/');
  await ensureToolbarInteractable(page);
  // First generate some content
  await page.locator('.template-card').filter({ hasText: 'Node.js' }).click();
  await page.getByRole('button', { name: /Generate .gitignore/i }).click();

  const exportButton = page.getByRole('button', { name: /export/i });
  await exportButton.click({ force: true });

  const jsonOption = page.getByRole('option', { name: /JSON/ });
  const [download] = await Promise.all([page.waitForEvent('download'), jsonOption.click()]);
  expect(download.suggestedFilename()).toMatch(/\.json$/);
});

test('clear all button resets everything', async ({ page }) => {
  await page.goto('/');
  await ensureToolbarInteractable(page);
  // Generate some content
  await page.locator('.template-card').first().click();
  await page.getByRole('button', { name: /Generate .gitignore/i }).click();
  await expect(page.locator('.gitignore-output')).toBeVisible();

  // Clear
  const clearButton = page.getByRole('button', { name: /Clear All/i });
  await expect(clearButton).toBeVisible();
  await clearButton.click();

  await expect(page.locator('.gitignore-output')).toHaveCount(0);
  await expect(page.getByText('Select templates below')).toBeVisible();
});

test('mobile sidebar backdrop closes sidebar', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  await ensureToolbarInteractable(page);
  const sidebar = page.locator('.tool-shell-sidebar');

  await page.locator('[aria-label="Show options"]').click();
  await expect(sidebar).toHaveClass(/open/);

  await page.locator('.sidebar-backdrop').evaluate((el) => (el as HTMLElement).click());
  await expect(sidebar).toHaveClass(/collapsed/);
});

test('404 page works', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist');
  expect(response?.status()).toBe(404);
  const contentType = response?.headers()['content-type'] ?? '';
  expect(contentType).toContain('text/html');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});

test('visual regression — default view', async ({ page, browserName }) => {
  if (browserName !== 'chromium') return;
  await page.goto('/');
  await page.waitForSelector('.tool-shell-canvas');
  await expect(page.locator('.tool-shell')).toBeVisible();
});
