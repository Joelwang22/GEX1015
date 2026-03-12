import { expect, test } from '@playwright/test';

test('loads seeded content and starts a quiz', async ({ page }) => {
  await page.goto('/#/');

  await expect(page.getByRole('heading', { name: 'GEX1015', exact: true })).toBeVisible();
  await expect(page.getByText('Life, the Universe, and Everything')).toBeVisible();

  await page.getByRole('link', { name: 'Lessons' }).click();
  await expect(page.getByRole('heading', { name: /Guided Lessons/i })).toBeVisible();

  await page.getByRole('link', { name: 'Take Quiz' }).click();
  await expect(page.getByRole('heading', { name: 'Create Quiz' })).toBeVisible();

  const buildQuizButton = page.getByRole('button', { name: 'Build quiz' });
  await expect(buildQuizButton).toBeEnabled({ timeout: 30000 });
  await expect(page.getByText(/questions available in total/i)).not.toContainText(/^0 questions/i, {
    timeout: 30000,
  });

  await buildQuizButton.click();

  await expect(page).toHaveURL(/#\/test\//);
  await expect(page.getByRole('heading', { name: 'Test Runner' })).toBeVisible();
  await expect(page.getByText(/Question 1 of \d+/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Submit answer' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Answer choices' })).toBeVisible();
});
