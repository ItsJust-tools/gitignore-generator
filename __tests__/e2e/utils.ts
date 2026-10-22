import { expect, type Page } from '@playwright/test';

/**
 * Shared helpers for the .gitignore Generator E2E suite.
 *
 * The sidebar is the single entry point for template selection, so tests must
 * make sure it is open before interacting with template cards. On mobile the
 * sidebar starts collapsed and its contents are `inert`, which makes clicks
 * silently fail instead of producing a useful error.
 */
export async function openSidebar(page: Page) {
  const sidebar = page.locator('.tool-shell-sidebar');
  await expect(sidebar).toBeVisible();

  const collapsed = await sidebar.evaluate((el) => el.classList.contains('collapsed'));
  if (collapsed) {
    await page.locator('[data-sidebar-toggle]').click();
    await expect(sidebar).toHaveClass(/open/);
  }

  return sidebar;
}

/** Navigate to the tool and normalize the sidebar state. */
export async function gotoTool(page: Page) {
  await page.goto('/');
  await openSidebar(page);
}

export function isMobileProject(projectName: string) {
  return projectName.includes('Mobile');
}

/**
 * Close the sidebar if it is open. On mobile the sidebar is a bottom sheet that
 * covers most of the viewport, so the backdrop must be clicked near the top
 * edge or the click lands on the sheet itself.
 */
export async function closeSidebar(page: Page) {
  const sidebar = page.locator('.tool-shell-sidebar');
  const collapsed = await sidebar.evaluate((el) => el.classList.contains('collapsed'));
  if (collapsed) return;

  // On mobile the backdrop covers the toolbar, so the toggle is unreachable;
  // the backdrop is the only close affordance.
  const backdrop = page.locator('.sidebar-backdrop');
  if (await backdrop.isVisible().catch(() => false)) {
    await backdrop.click({ position: { x: 5, y: 5 } });
    await expect(sidebar).toHaveClass(/collapsed/);
    return;
  }

  await page.locator('[data-sidebar-toggle]').click();
  await expect(sidebar).toHaveClass(/collapsed/);
}

/**
 * Toast notifications are the only user-visible error channel. Next.js also
 * renders a `role="alert"` route announcer, so scope assertions to `.toast`.
 */
export function toast(page: Page, type: 'success' | 'error' = 'error') {
  return page.locator(`.toast.toast-${type}`);
}

/**
 * Select a template by its visible label.
 * Scrolling is delegated to Playwright inside the sidebar scroll container.
 */
export async function selectTemplate(page: Page, label: string) {
  const card = page.locator('.template-card').filter({ hasText: label }).first();
  await expect(card).toBeVisible();
  await card.click();
  await expect(card).toHaveClass(/selected/);
}

export async function generate(page: Page) {
  const generateButton = page.getByRole('button', { name: /Generate .gitignore/i });
  await expect(generateButton).toBeEnabled();
  await generateButton.click();
  const output = page.locator('.gitignore-output');
  await expect(output).toBeVisible();
  return output;
}

/** Wait until the auto-save pipeline has persisted state for this tool. */
export async function waitForPersistedState(page: Page, timeout = 15000) {
  await page.waitForFunction(
    () =>
      Object.keys(window.localStorage).some(
        (key) => key.includes('itsjust:history:') && key.endsWith(':gitignore-generator')
      ),
    undefined,
    { timeout }
  );
}

/** Read the persisted tool state (last history entry) from localStorage. */
export async function readPersistedState<T>(page: Page): Promise<T | null> {
  return page.evaluate(() => {
    const key = Object.keys(window.localStorage).find(
      (k) => k.includes('itsjust:history:') && k.endsWith(':gitignore-generator')
    );
    if (!key) return null;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { history?: unknown[] };
    const history = parsed.history ?? [];
    return (history[history.length - 1] ?? null) as T | null;
  });
}

/**
 * Dispatch a real file drop on the window. Building a DataTransfer in-page is
 * the only way to exercise the drag-and-drop import handlers with file content.
 */
export async function dropFile(page: Page, file: { name: string; content: string; type?: string }) {
  await page.evaluate(
    ({ name, content, type }) => {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(new File([content], name, { type: type ?? 'application/json' }));
      for (const eventName of ['dragenter', 'dragover', 'drop'] as const) {
        window.dispatchEvent(
          new DragEvent(eventName, { dataTransfer, bubbles: true, cancelable: true })
        );
      }
    },
    { name: file.name, content: file.content, type: file.type }
  );
}

/** A complete, valid GitignoreState payload as produced by the JSON export. */
export function validStatePayload(overrides: Record<string, unknown> = {}) {
  return {
    selectedTemplates: ['node'],
    customRules: '# keep me\n*.local',
    outputContent: '# Node.js\nnode_modules/\n\n# Custom rules\n*.local\n',
    visibilityFilter: 'all',
    searchQuery: '',
    copied: false,
    ...overrides,
  };
}
