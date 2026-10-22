import { test, expect } from '@playwright/test';
import { dropFile, gotoTool, toast, validStatePayload } from './utils';

test.describe('drag-and-drop import', () => {
  test('valid state file dropped on the page is imported', async ({ page }) => {
    await gotoTool(page);
    await expect(page.locator('.gitignore-output')).toHaveCount(0);

    await dropFile(page, {
      name: 'state.json',
      content: JSON.stringify(validStatePayload()),
      type: 'application/json',
    });

    await expect(page.locator('.gitignore-textarea')).toHaveValue('# keep me\n*.local');
    await expect(page.locator('.template-card').filter({ hasText: 'Node.js' }).first()).toHaveClass(
      /selected/
    );
  });

  test('drop overlay appears while dragging and disappears after drop', async ({ page }) => {
    await gotoTool(page);
    await page.evaluate(() => {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(new File(['{}'], 'x.json', { type: 'application/json' }));
      window.dispatchEvent(
        new DragEvent('dragenter', { dataTransfer, bubbles: true, cancelable: true })
      );
    });
    await expect(page.locator('.drop-overlay')).toBeVisible();

    await dropFile(page, {
      name: 'state.json',
      content: JSON.stringify(validStatePayload()),
      type: 'application/json',
    });
    await expect(page.locator('.drop-overlay')).toHaveCount(0);
  });

  test('corrupt JSON file reports an error instead of silently failing', async ({ page }) => {
    await gotoTool(page);
    await dropFile(page, {
      name: 'corrupt.json',
      content: '{"selectedTemplates": [',
      type: 'application/json',
    });

    const alert = toast(page);
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/JSON|parse|Invalid|Unexpected/i);
    // Existing state must be untouched by a failed import.
    await expect(page.locator('.gitignore-output')).toHaveCount(0);
  });

  test('structurally invalid state file is rejected with a format error', async ({ page }) => {
    await gotoTool(page);
    await dropFile(page, {
      name: 'wrong-shape.json',
      content: JSON.stringify({ hello: 'world' }),
      type: 'application/json',
    });

    const alert = toast(page);
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/Invalid data format|GitignoreState/i);
  });

  test('unsupported file type is ignored and preserves current state', async ({ page }) => {
    await gotoTool(page);
    await page.locator('.template-card').filter({ hasText: 'Node.js' }).first().click();

    await dropFile(page, { name: 'notes.md', content: '# hello', type: 'text/markdown' });

    await expect(toast(page)).toHaveCount(0);
    await expect(page.locator('.template-card').filter({ hasText: 'Node.js' }).first()).toHaveClass(
      /selected/
    );
  });

  test('oversized file reports the size limit', async ({ page }) => {
    await gotoTool(page);
    const huge = JSON.stringify({ ...validStatePayload(), padding: 'x'.repeat(5 * 1024 * 1024) });
    await dropFile(page, { name: 'huge.json', content: huge, type: 'application/json' });

    const alert = toast(page);
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/too large/i);
  });
});
