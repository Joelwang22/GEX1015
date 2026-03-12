import { expect, test } from '@playwright/test';

test('lesson navigation stays pinned while slide content scrolls internally', async ({ page }) => {
  await page.goto('/#/lessons/1');

  await expect(page.getByText(/Slide 1 of/i)).toBeVisible();

  await page.getByRole('button', { name: /Next/i }).click();
  await expect(page.getByText(/Slide 2 of/i)).toBeVisible();

  const viewport = page.getByTestId('lesson-slide-viewport');
  const nav = page.getByTestId('lesson-nav');

  const beforeScroll = await nav.boundingBox();
  expect(beforeScroll).not.toBeNull();

  await viewport.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });

  const afterScroll = await nav.boundingBox();
  expect(afterScroll).not.toBeNull();

  expect(Math.round(afterScroll!.y)).toBe(Math.round(beforeScroll!.y));
  await expect(page.getByRole('button', { name: /Next/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Prev/i })).toBeVisible();
});
