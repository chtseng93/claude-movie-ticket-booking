import { test, expect } from '@playwright/test';

/**
 * E2E-6：409 衝突測試
 * 模擬同一座位被搶先購買，驗證 UI 顯示錯誤訊息並重置座位選擇。
 */
test('E2E-6: 409 conflict — seat taken shows error and resets selection', async ({ page }) => {

  // 導航至首頁
  await page.goto('/');
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(1_500);

  // 點擊 GET TICKETS 進入日期頁
  await page.getByText('GET TICKETS').first().click();
  await expect(page).toHaveURL(/\/movies\/\d+\/dates/, { timeout: 10_000 });
  await page.waitForTimeout(1_000);

  // 選第一個場次
  await page.locator('button').filter({ hasText: /Available/ }).first().click();
  await page.waitForTimeout(700);
  await page.getByText('Continue to Seats').click();

  // 座位頁載入
  await expect(page).toHaveURL(/\/showtimes\/\d+\/seats/, { timeout: 10_000 });
  await page.waitForTimeout(2_000);

  // 選一個座位（第 7 個可用座位）
  const target = page.locator('button.seat-available').nth(6);
  await target.click();
  await page.waitForTimeout(1_000);

  // 確認座位已選取（sidebar 顯示 Selected Seats 不為 None）
  await expect(page.locator('button.seat-selected')).toHaveCount(1);
  await page.waitForTimeout(800);

  // 設定 API 攔截：POST /api/bookings → 409
  await page.route('**/api/bookings', route =>
    route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Conflict: seat already booked by another user' }),
    })
  );

  // 填 email
  await page.fill('input[type="email"]', 'conflict@cinemist.com');
  await page.waitForTimeout(600);

  // 送出 → 觸發 409
  await page.getByText('Complete Payment').click();

  // 錯誤訊息出現
  await expect(
    page.getByText('One or more selected seats were just taken')
  ).toBeVisible({ timeout: 10_000 });

  // 停留 3 秒讓影片看清楚錯誤
  await page.waitForTimeout(3_000);

  // 驗證座位已自動重置（無已選取座位）
  await expect(page.locator('button.seat-selected')).toHaveCount(0);
  await page.waitForTimeout(1_500);
});
