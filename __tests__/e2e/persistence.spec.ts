import { test, expect } from '@playwright/test';
import { generate, gotoTool, selectTemplate, waitForPersistedState } from './utils';

test.describe('state persistence across reload', () => {
  test('selected templates and custom rules survive a reload', async ({ page }) => {
    await gotoTool(page);
    await selectTemplate(page, 'Node.js');
    await selectTemplate(page, 'macOS');
    await page.locator('.gitignore-textarea').fill('*.local\nsecrets/');
    await generate(page);

    await waitForPersistedState(page);
    await page.reload();
    await gotoTool(page);

    await expect(page.locator('.template-card').filter({ hasText: 'Node.js' }).first()).toHaveClass(
      /selected/
    );
    await expect(page.locator('.template-card').filter({ hasText: 'macOS' }).first()).toHaveClass(
      /selected/
    );
    await expect(page.locator('.gitignore-textarea')).toHaveValue('*.local\nsecrets/');
  });

  test('generated output is restored without regenerating', async ({ page }) => {
    await gotoTool(page);
    await selectTemplate(page, 'Python');
    const output = await generate(page);
    const expected = await output.inputValue();
    expect(expected).toContain('# Python');

    await waitForPersistedState(page);
    await page.reload();

    await expect(page.locator('.gitignore-output')).toHaveValue(expected);
  });

  test('undo history survives a reload', async ({ page }) => {
    await gotoTool(page);
    await selectTemplate(page, 'Node.js');
    await page.locator('.gitignore-textarea').fill('first-rule/');
    await waitForPersistedState(page);

    await page.reload();
    await gotoTool(page);

    // Undo should step back through the persisted history.
    await page.keyboard.press('Control+z');
    await expect(page.locator('.gitignore-textarea')).toHaveValue('');
  });

  test('filter and search state persist across reload', async ({ page }) => {
    await gotoTool(page);
    await page.getByRole('tab', { name: /Languages/i }).click();
    await page.getByRole('searchbox', { name: /Search templates/i }).fill('Rust');
    await waitForPersistedState(page);

    await page.reload();
    await gotoTool(page);

    await expect(page.getByRole('tab', { name: /Languages/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(page.getByRole('searchbox', { name: /Search templates/i })).toHaveValue('Rust');
  });
});
