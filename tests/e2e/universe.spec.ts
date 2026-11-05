import { test, expect, type Page } from '@playwright/test';

async function arrive(page: Page) {
  await page.goto('/');
  await page.waitForFunction(() => localStorage.getItem('her-universe-visited') === 'yes');
  const skip = page.getByRole('button', { name: /跳过/ });
  if (await skip.count()) await skip.first().click();
  await expect(page.getByRole('button', { name: '记忆星球', exact: true })).toBeVisible();
}
async function openPlanet(page: Page, name: string) {
  await page.getByRole('button', { name, exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}
async function closePlanet(page: Page) {
  await page.getByRole('button', { name: '返回宇宙', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}
async function loadPreviewImages(page: Page) {
  await page.locator('.memory-preview').scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll<HTMLImageElement>('.preview-image img'))
      .filter((image) => image.getClientRects().length)
      .every((image) => image.complete && image.naturalWidth > 0),
  );
  await page.evaluate(() => window.scrollTo(0, 0));
}

test('first-visit intro traps keyboard focus, can be skipped, and sound begins only after a click', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('dialog', { name: '宇宙开场', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '进入我的宇宙', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: '跳过开场', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '进入我的宇宙', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('.intro')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '开启环境音', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await page.getByRole('button', { name: '开启环境音', exact: true }).click();
  await expect(page.getByRole('button', { name: '关闭环境音', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: '关闭环境音', exact: true }).click();
  await expect(page.getByRole('button', { name: '开启环境音', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await page.reload();
  await page.waitForFunction(() =>
    document.querySelector('.galaxy-caption')?.textContent?.includes('WELCOME BACK'),
  );
  await expect(page.locator('.intro')).toHaveCount(0);
});

test('desktop universe renders, keyboard dialog traps focus and escape returns to its planet', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await arrive(page);
  await loadPreviewImages(page);
  await page.screenshot({ path: 'test-results/universe-desktop.png', fullPage: true });
  await openPlanet(page, '记忆星球');
  await expect(page.getByRole('heading', { name: '记忆博物馆', exact: true })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '返回宇宙', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('dialog').locator(':focus')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '记忆星球', exact: true })).toBeFocused();
  expect(errors).toEqual([]);
});

test('memory filters, flips, story navigation, zoom and favorites survive a reload', async ({
  page,
}) => {
  await arrive(page);
  await openPlanet(page, '记忆星球');
  await page.getByRole('button', { name: '一起远行', exact: true }).click();
  await expect(page.locator('.memory-polaroid')).toHaveCount(1);
  await page.getByRole('button', { name: '全部', exact: true }).click();
  await page.getByRole('button', { name: '翻转把月光留在这里', exact: true }).click();
  await expect(page.locator('.memory-polaroid').first()).toHaveClass(/is-flipped/);
  await page.getByRole('button', { name: '收藏把月光留在这里', exact: true }).click();
  await page.getByRole('button', { name: '只看收藏', exact: true }).click();
  await expect(page.locator('.memory-polaroid')).toHaveCount(1);
  await page.getByRole('button', { name: '查看把月光留在这里的故事', exact: true }).click();
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: '把月光留在这里', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: '放大照片', exact: true }).click();
  await expect(page.locator('.memory-detail-art')).toHaveClass(/is-zoomed/);
  await page.reload();
  const skip = page.getByRole('button', { name: /跳过/ });
  if (await skip.count()) await skip.first().click();
  await openPlanet(page, '记忆星球');
  await page.getByRole('button', { name: '只看收藏', exact: true }).click();
  await expect(page.locator('.memory-polaroid')).toHaveCount(1);
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: '把月光留在这里', exact: true }),
  ).toBeVisible();
});

test('missing memory image shows a readable fallback', async ({ page }) => {
  await page.route('**/art/moonlight.svg', (route) => route.abort());
  await arrive(page);
  await openPlanet(page, '记忆星球');
  await expect(page.getByText('这段回忆，等你放进来', { exact: true }).first()).toBeVisible();
});

test('a wish can be added, completed, retained after reload and deleted', async ({ page }) => {
  await arrive(page);
  await openPlanet(page, '梦境星球');
  await page.getByRole('button', { name: '种下愿望', exact: true }).click();
  await page.getByLabel('新的愿望').fill('浏览器验收：一起看极光');
  await page.getByRole('button', { name: '种下这一颗', exact: true }).click();
  await page.getByRole('button', { name: '完成愿望：浏览器验收：一起看极光', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '标记未完成：浏览器验收：一起看极光', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await openPlanet(page, '梦境星球');
  await expect(
    page.getByRole('button', { name: '标记未完成：浏览器验收：一起看极光', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: '删除愿望：浏览器验收：一起看极光', exact: true }).click();
  await expect(page.getByRole('button', { name: /浏览器验收：一起看极光/ })).toHaveCount(0);
});

test('letters open, hidden note works, future drafts persist and remain date locked', async ({
  page,
}) => {
  await arrive(page);
  await openPlanet(page, '情书星球');
  await page.getByRole('button', { name: '打开信件：写给宇宙中心的你', exact: true }).click();
  await expect(page.getByRole('heading', { name: '写给宇宙中心的你', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '看看月亮背后的留言', exact: true }).click();
  await expect(page.getByText(/示例隐藏留言/)).toBeVisible();
  await page.getByRole('button', { name: '回到信箱', exact: true }).click();
  await page.getByRole('button', { name: '写一封信，给未来的她', exact: true }).click();
  await page.getByLabel('信的名字').fill('浏览器验收：未来来信');
  await page.getByLabel('想在哪一天打开').fill('2099-12-31');
  await page.getByLabel('慢慢写，我在听').fill('这是一份仅用于浏览器功能测试的本机草稿。');
  await page.getByRole('button', { name: '保存未来的信', exact: true }).click();
  await page
    .getByRole('button', { name: '查看解锁日期：浏览器验收：未来来信', exact: true })
    .click();
  await expect(page.locator('.story-inline-notice')).toContainText('2099-12-31');
  await page.reload();
  await openPlanet(page, '情书星球');
  await expect(
    page.getByRole('button', { name: '查看解锁日期：浏览器验收：未来来信', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.letter-paper')).toHaveCount(0);
});

test('mobile touch exploration has no horizontal overflow in every planet and reduced motion is respected', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForFunction(() => localStorage.getItem('her-universe-visited') === 'yes');
  await expect(page.locator('.intro')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await loadPreviewImages(page);
  await page.screenshot({ path: 'test-results/universe-mobile.png', fullPage: true });
  for (const name of ['记忆星球', '时间星球', '游戏星球', '情书星球', '梦境星球', '秘密星球']) {
    await page.getByRole('button', { name, exact: true }).tap();
    await expect(page.getByRole('dialog')).toBeVisible();
    if (name === '情书星球') {
      await page.getByRole('button', { name: '打开信件：写给宇宙中心的你', exact: true }).tap();
      await expect(page.locator('.letter-caret')).toHaveCount(0);
      await expect(page.locator('.letter-body p[aria-hidden="true"]')).toContainText(
        '这里没有预设的爱情故事',
      );
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    expect(
      await page.getByRole('dialog').evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
    ).toBe(true);
    await closePlanet(page);
  }
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
    true,
  );
  await context.close();
});

test('tablet portrait and phone landscape keep all navigation and modal content within the viewport', async ({
  page,
}) => {
  await arrive(page);
  for (const viewport of [
    { width: 768, height: 1024 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    for (const name of ['记忆星球', '时间星球', '游戏星球', '情书星球', '梦境星球', '秘密星球']) {
      await openPlanet(page, name);
      const dialog = page.getByRole('dialog');
      expect(
        await dialog.evaluate((node) => node.getBoundingClientRect().width <= window.innerWidth),
      ).toBe(true);
      expect(await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
      await expect(page.getByRole('button', { name: '返回宇宙', exact: true })).toBeVisible();
      await closePlanet(page);
    }
  }
});

test('all three games complete with real state changes and each can restart', async ({ page }) => {
  await arrive(page);
  await openPlanet(page, '游戏星球');
  await page.getByRole('button', { name: /我们的默契测试/ }).click();
  await page.getByRole('button', { name: '开始默契测试', exact: true }).click();
  for (const [index, option] of [1, 0, 2].entries()) {
    await expect(page.getByRole('button', { name: '确认答案', exact: true })).toBeDisabled();
    await page.locator('.quiz-option').nth(option).click();
    await page.getByRole('button', { name: '确认答案', exact: true }).click();
    await expect(page.locator('.quiz-explanation')).toBeVisible();
    await page
      .getByRole('button', { name: index === 2 ? '打开结果' : '下一道题', exact: true })
      .click();
  }
  await expect(page.locator('.quiz-result-score')).toHaveText('3 / 3');
  await expect(page.getByText(/满分彩蛋/)).toBeVisible();
  await page.getByRole('button', { name: '再玩一次', exact: true }).click();
  await expect(page.getByRole('button', { name: '开始默契测试', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '返回游戏星球', exact: true }).click();

  await page.getByRole('button', { name: /寻找遗失的星星/ }).click();
  await page.getByRole('button', { name: '进入夜色', exact: true }).click();
  await page.getByRole('button', { name: '给我一点提示', exact: true }).click();
  await expect(page.locator('.star-hint')).toBeVisible();
  for (let i = 1; i <= 7; i++)
    await page.getByRole('button', { name: `寻找第 ${i} 颗星星`, exact: true }).click();
  await expect(page.getByText('散落的光，终于有了彼此。', { exact: true })).toBeVisible();
  await expect(page.locator('.search-constellation')).toBeVisible();
  await page.getByRole('button', { name: '再找一次', exact: true }).click();
  await expect(page.getByRole('button', { name: '进入夜色', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '返回游戏星球', exact: true }).click();

  await page.getByRole('button', { name: /我们的命运星图/ }).click();
  await page.getByRole('button', { name: '让故事开始', exact: true }).click();
  for (let i = 0; i < 3; i++) {
    await expect(
      page.getByRole('button', { name: i === 2 ? '展开命运星图' : '继续旅程', exact: true }),
    ).toBeDisabled();
    await page.locator('.fate-option').nth(i).click();
    await page
      .getByRole('button', { name: i === 2 ? '展开命运星图' : '继续旅程', exact: true })
      .click();
  }
  await expect(page.locator('.fate-result blockquote')).toContainText('我依然会选择遇见你');
  await page.getByRole('button', { name: '探索另一种可能', exact: true }).click();
  await expect(page.getByRole('button', { name: '让故事开始', exact: true })).toBeVisible();
  await closePlanet(page);
  await openPlanet(page, '记忆星球');
  await page.getByRole('button', { name: '查看把月光留在这里的故事', exact: true }).click();
  await closePlanet(page);
  for (const name of ['时间星球', '情书星球', '梦境星球']) {
    await openPlanet(page, name);
    await closePlanet(page);
  }
  await openPlanet(page, '秘密星球');
  await expect(page.getByRole('button', { name: '让星光为你相连', exact: true })).toBeDisabled();
  for (let i = 0; i < 5; i++)
    await page
      .getByRole('dialog')
      .getByRole('button', { name: '向守候的星星问好', exact: true })
      .click();
  await page.getByRole('button', { name: '让星光为你相连', exact: true }).click();
  await expect(page.getByRole('img', { name: '相连的命运星图', exact: true })).toBeVisible();
  await expect(page.locator('.final-confession')).toContainText('我依然会选择遇见你');
});
