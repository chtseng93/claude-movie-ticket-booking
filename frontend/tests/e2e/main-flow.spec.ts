import { test, expect } from '@playwright/test';
import * as fs from 'fs';

/**
 * E2E-2 ~ E2E-5：完整購票流程
 * 首頁電影列表（底部推薦）→ 選日期/場次 → 選座 → 結帳 → Ticket + 下載 PNG
 */
test('E2E-2~5: full booking flow — movie list → date → seat → ticket + PNG', async ({ page, context }) => {

  // ── E2E-2: 首頁 ─────────────────────────────────────────────────────────
  await page.goto('/');
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 15_000 });

  // 停留讓 WebGL 動畫啟動
  await page.waitForTimeout(3_000);

  // 緩慢滾動到 Hero 底部展示設計
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'smooth' }));
  await page.waitForTimeout(1_200);
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'smooth' }));
  await page.waitForTimeout(1_200);

  // 繼續滾到「The Crew」與電影細節
  await page.evaluate(() => window.scrollTo({ top: 1400, behavior: 'smooth' }));
  await page.waitForTimeout(1_500);

  // 滾到「RECOMMENDED FOR YOU」電影列表
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight - 1000, behavior: 'smooth' }));
  await page.waitForTimeout(2_000);

  // 確認底部推薦列表有至少 1 張卡
  const cards = page
    .locator('section')
    .filter({ hasText: 'RECOMMENDED FOR YOU' })
    .locator('.group.cursor-pointer');
  await expect(cards.first()).toBeVisible({ timeout: 10_000 });

  // 點選推薦列表第二張卡（第一張可能是當前 Hero 以外）
  await cards.nth(1).click();

  // ── E2E-3: 日期選擇頁 ───────────────────────────────────────────────────
  await expect(page).toHaveURL(/\/movies\/\d+\/dates/, { timeout: 10_000 });
  await page.waitForTimeout(2_000);

  // 展示電影海報與標題區
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1_000);

  // 依序點擊所有日期 Tab，展示切換動畫
  const dateTabs = page.locator('button.w-24.h-32');
  const tabCount = await dateTabs.count();
  for (let i = 0; i < Math.min(tabCount, 4); i++) {
    await dateTabs.nth(i).click();
    await page.waitForTimeout(700);
  }
  // 回到第一個 tab
  await dateTabs.first().click();
  await page.waitForTimeout(1_000);

  // 滾到 Sessions 區域
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'smooth' }));
  await page.waitForTimeout(800);

  // 點選第一個場次
  const sessionBtn = page.locator('button').filter({ hasText: /Available/ }).first();
  await sessionBtn.click();
  await page.waitForTimeout(1_500);

  // Footer 出現後點 Continue to Seats
  await page.getByText('Continue to Seats').click();

  // ── E2E-4: 座位選擇 + 結帳 ─────────────────────────────────────────────
  await expect(page).toHaveURL(/\/showtimes\/\d+\/seats/, { timeout: 10_000 });
  await page.waitForTimeout(2_000);

  // 展示座位圖頂部 (Screen + 座位區)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1_000);

  // 點選兩個可用座位
  const availableSeats = page.locator('button.seat-available');
  await availableSeats.nth(0).click();
  await page.waitForTimeout(600);
  await availableSeats.nth(1).click();
  await page.waitForTimeout(600);

  // 滾到右側 Summary / Email 輸入區
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }));
  await page.waitForTimeout(800);

  // 填寫 email
  await page.fill('input[type="email"]', 'demo@cinemist.com');
  await page.waitForTimeout(800);

  // 點擊付款
  await page.getByText('Complete Payment').click();

  // ── E2E-5: Ticket 頁 + PNG ──────────────────────────────────────────────
  await expect(page).toHaveURL(/\/tickets\/.+/, { timeout: 20_000 });
  await page.waitForTimeout(2_000);

  // 從頂部展示票券
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1_000);

  // 緩慢往下展示 QR + 明細
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }));
  await page.waitForTimeout(1_200);
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'smooth' }));
  await page.waitForTimeout(1_200);

  // 確認訂單號碼顯示
  const bookingNumber = page.url().split('/').pop()!;
  await expect(page.getByText(bookingNumber)).toBeVisible();

  // 確認假 QR Code 可見
  await expect(page.locator('svg')).toBeVisible();

  // 點擊 SAVE TICKET — 等待下載事件（html2canvas 需要幾秒）
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 60_000 }),
    page.getByText('SAVE TICKET').click(),
  ]);

  // 驗證按鈕變色（等待「SAVED!」文字與青色背景出現）
  await expect(page.getByText('SAVED!')).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(2_500);

  // 驗證 PNG 魔術位元組
  const filePath = await download.path();
  expect(filePath).toBeTruthy();
  const buf = fs.readFileSync(filePath!);
  expect(buf[0]).toBe(0x89);
  expect(buf[1]).toBe(0x50); // P
  expect(buf[2]).toBe(0x4e); // N
  expect(buf[3]).toBe(0x47); // G

  // 在頁面顯示下載的 PNG 檔
  const fileUrl = `file:///${filePath!.replace(/\\/g, '/')}`;
  await page.goto(fileUrl);
  await page.waitForTimeout(4_000);
});
