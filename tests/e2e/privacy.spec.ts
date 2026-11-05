import { test, expect } from '@playwright/test';

// Run against a production server configured with temporary test credentials:
// PLAYWRIGHT_AUTH_REQUIRED=1 PLAYWRIGHT_TEST_ACCESS_CODE=... PLAYWRIGHT_BASE_URL=... npm run test:e2e -- privacy
test.describe('production privacy boundary', () => {
  test.skip(
    process.env.PLAYWRIGHT_AUTH_REQUIRED !== '1',
    'Needs an independently started production server with access credentials.',
  );

  test('unauthenticated HTML, RSC, private media and static JS disclose no private configuration', async ({
    request,
    page,
  }) => {
    const marker = '这里没有预设的爱情故事';
    const shell = await request.get('/');
    expect(await shell.text()).not.toContain(marker);
    await page.goto('/');
    await expect(page.getByLabel('宇宙通行口令')).toBeVisible();
    await page.screenshot({ path: 'test-results/universe-access-gate.png', fullPage: true });
    await expect(page.getByRole('button', { name: '记忆星球', exact: true })).toHaveCount(0);
    const rsc = await request.get('/?_rsc=privacy-test', { headers: { RSC: '1' } });
    expect(await rsc.text()).not.toContain(marker);
    const media = await request.get('/api/media/not-a-real-private-photo.jpg');
    expect(media.status()).toBe(401);
    for (const src of await page
      .locator('script[src]')
      .evaluateAll((scripts) => scripts.map((script) => (script as HTMLScriptElement).src))) {
      const response = await request.get(src);
      expect(await response.text()).not.toContain(marker);
    }
    const crossOrigin = await request.post('/api/session', {
      headers: { Origin: 'https://untrusted.example' },
      data: { code: process.env.PLAYWRIGHT_TEST_ACCESS_CODE || '' },
    });
    expect(crossOrigin.status()).toBe(403);
  });

  test('server verifies access code, signs an HttpOnly cookie and logout revokes the session', async ({
    page,
    context,
  }) => {
    test.skip(!process.env.PLAYWRIGHT_TEST_ACCESS_CODE, 'Temporary server test code required.');
    await page.goto('/');
    await page.getByLabel('宇宙通行口令').fill('incorrect-test-code');
    await page.getByRole('button', { name: '进入我们的宇宙', exact: true }).click();
    await expect(page.locator('#access-error')).toBeVisible();
    await page.getByLabel('宇宙通行口令').fill(process.env.PLAYWRIGHT_TEST_ACCESS_CODE!);
    await page.getByRole('button', { name: '进入我们的宇宙', exact: true }).click();
    await expect(page.getByRole('button', { name: '记忆星球', exact: true })).toBeVisible();
    const cookies = await context.cookies();
    const session = cookies.find((cookie) => cookie.httpOnly && cookie.name.includes('universe'));
    expect(session).toBeDefined();
    expect(session?.secure).toBe(true);
    expect(session?.sameSite).toBe('Strict');
    await page.evaluate(async () => {
      await fetch('/api/session', { method: 'DELETE' });
    });
    await page.reload();
    await expect(page.getByLabel('宇宙通行口令')).toBeVisible();
  });
});
