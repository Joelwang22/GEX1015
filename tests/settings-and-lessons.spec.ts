import { expect, test } from '@playwright/test';

test('settings does not expose a public reset database action', async ({ page }) => {
  await page.goto('/#/settings');

  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save preferences' })).toBeVisible();
  await expect(page.getByText(/Reset database/i)).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Reset all data/i })).toHaveCount(0);
});

test('check slides use a more immersive format than a generic knowledge-check card', async ({ page }) => {
  await page.goto('/#/lessons/3');

  const decisionPoint = page.getByText('Decision Point');
  for (let index = 0; index < 12; index += 1) {
    if (await decisionPoint.isVisible()) {
      break;
    }
    await page.getByRole('button', { name: /Next/i }).click();
  }

  await expect(decisionPoint).toBeVisible();
  await expect(page.getByRole('heading', { name: 'True or false' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'True' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'False' })).toBeVisible();
  await expect(page.getByText('Knowledge Check')).toHaveCount(0);
});
