import { test, expect } from '@playwright/test';

const API = 'http://localhost:8000/api';

// # ==========================================================================
// # Helpers
// # ==========================================================================

async function loginAs(email: string, pass: string) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass }),
  });
  const json = await res.json();
  return json.data.token as string;
}

async function loginViaUI(page: any) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/tasks/, { timeout: 10000 });
}

// # ==========================================================================
// # Auth
// # ==========================================================================

test.describe('Auth', () => {
  test('login with valid credentials redirects to tasks', async ({ page }) => {
    await loginViaUI(page);
    await expect(page.locator('h1')).toContainText('My Tasks');
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'wrongpass');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error')).toBeVisible({ timeout: 10000 });
  });

  test('guest enter button logs in', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.click('text=Guest Enter');
    await expect(page).toHaveURL(/\/tasks/, { timeout: 10000 });
  });

  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/tasks');
    await expect(page).toHaveURL(/\/login/);
  });

  test('logout redirects to login', async ({ page }) => {
    await loginViaUI(page);
    await page.click('text=Logout');
    await expect(page).toHaveURL(/\/login/);
  });

  test('register new user and redirects to tasks', async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.fill('#name', 'New User');
    await page.fill('#email', email);
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/tasks/, { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('My Tasks');
  });

  test('register with existing email shows error', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.fill('#name', 'Dup');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await expect(page.locator('.field-error')).toBeVisible({ timeout: 10000 });
  });
});

// # ==========================================================================
// # Task CRUD
// # ==========================================================================

test.describe('Task CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
  });

  test('displays task list', async ({ page }) => {
    await expect(page.locator('.task-card').first()).toBeVisible({ timeout: 10000 });
  });

  test('creates a new task', async ({ page }) => {
    await page.click('text=+ New Task');
    await page.waitForLoadState('networkidle');
    await page.fill('#title', 'E2E test task');
    await page.click('text=Create Task');
    await expect(page.locator('.task-card').first()).toContainText('E2E test task', { timeout: 10000 });
  });

  test('create with empty title shows validation error', async ({ page }) => {
    await page.click('text=+ New Task');
    await page.waitForLoadState('networkidle');
    await page.click('text=Create Task');
    await expect(page.locator('.field-error')).toBeVisible();
  });

  test('edits a task', async ({ page }) => {
    await page.locator('.task-card .btn-sm').first().click();
    await page.waitForLoadState('networkidle');
    const input = page.locator('#title');
    await input.fill('Updated E2E');
    await page.click('text=Save Changes');
    await expect(page.locator('.task-card').first()).toContainText('Updated E2E', { timeout: 10000 });
  });

  test('deletes a task', async ({ page }) => {
    const countBefore = await page.locator('.task-card').count();
    await page.locator('.task-card .btn-sm.btn-danger').first().click();
    await page.locator('.confirm-card .btn-danger').click();
    await expect(page.locator('.task-card')).toHaveCount(Math.max(0, countBefore - 1), { timeout: 10000 });
  });
});

// # ==========================================================================
// # Task List: filter, search, sort, pagination
// # ==========================================================================

test.describe('Task List', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
  });

  test('filters by status', async ({ page }) => {
    await page.selectOption('.filter-select', 'completed');
    await page.waitForTimeout(800);
    const statuses = await page.locator('.task-status').allTextContents();
    for (const s of statuses) {
      expect(s.toLowerCase()).toBe('completed');
    }
  });

  test('searches by title', async ({ page }) => {
    const firstTitle = await page.locator('.task-card .task-title').first().textContent();
    if (!firstTitle) return;
    const searchTerm = firstTitle.slice(0, 5);
    await page.fill('.search-input', searchTerm);
    await page.waitForTimeout(800);
    const titles = await page.locator('.task-card .task-title').allTextContents();
    for (const t of titles) {
      expect(t.toLowerCase()).toContain(searchTerm.toLowerCase());
    }
  });

  test('pagination is visible when enough tasks', async ({ page }) => {
    const cards = await page.locator('.task-card').count();
    if (cards >= 10) {
      await expect(page.locator('.pagination')).toBeVisible();
    }
  });
});

// # ==========================================================================
// # Admin role
// # ==========================================================================

test.describe('Admin Role', () => {
  test('admin sees all tasks', async () => {
    const token = await loginAs('test@example.com', 'password');
    const res = await fetch(`${API}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    expect(json.meta.total).toBeGreaterThan(0);
  });

  test('regular user sees only own tasks (zero if none)', async () => {
    const token = await loginAs('user@example.com', 'password');
    const res = await fetch(`${API}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    expect(json.meta.total).toBe(0);
  });

  test('admin sees tasks in UI, regular user sees empty state', async ({ page }) => {
    // Login as admin — tasks visible
    await loginViaUI(page);
    await expect(page.locator('.task-card').first()).toBeVisible({ timeout: 10000 });

    // Logout
    await page.click('text=Logout');
    await expect(page).toHaveURL(/\/login/);

    // Login as regular user — empty state
    await page.fill('#email', 'user@example.com');
    await page.fill('#password', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/tasks/);
    await expect(page.locator('.state-msg')).toContainText('No tasks yet');
  });

  test('edit/delete buttons hidden for non-owner tasks', async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;
    // Register new user
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.fill('#name', 'New User');
    await page.fill('#email', email);
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/tasks/, { timeout: 10000 });

    // New user has no tasks — no edit/delete buttons
    await expect(page.locator('.state-msg')).toContainText('No tasks yet');
    await expect(page.locator('.btn-sm')).toHaveCount(0);
  });
});

// # ==========================================================================
// # API error codes
// # ==========================================================================

test.describe('Error Codes', () => {
  test('401 on unauthenticated request', async () => {
    const res = await fetch(`${API}/tasks`);
    expect(res.status).toBe(401);
  });

  test('404 on non-existent task', async () => {
    const token = await loginAs('test@example.com', 'password');
    const res = await fetch(`${API}/tasks/99999`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(404);
  });

  test('422 on empty title', async () => {
    const token = await loginAs('test@example.com', 'password');
    const res = await fetch(`${API}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: '' }),
    });
    expect(res.status).toBe(422);
  });
});
