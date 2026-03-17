import { expect, test, type Page } from '@playwright/test';

const openTestRunner = async (page: Page) => {
  await page.goto('/#/');
  await page.getByRole('link', { name: 'Take Quiz' }).click();

  const buildQuizButton = page.getByRole('button', { name: 'Build quiz' });
  await expect(buildQuizButton).toBeEnabled({ timeout: 30000 });
  await expect(page.getByText(/questions available in total/i)).not.toContainText(/^0 questions/i, {
    timeout: 30000,
  });

  await buildQuizButton.click();
  await expect(page).toHaveURL(/#\/test\//);
  await expect(page.getByRole('heading', { name: 'Test Runner' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Answer choices' })).toBeVisible();
};

test('opening the question navigator does not shrink the quiz content on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await openTestRunner(page);

  const questionCard = page
    .getByText(/select the best answer|select every answer that applies/i)
    .locator('xpath=..');
  const progressBar = page.getByText('Progress').locator('xpath=ancestor::div[2]');
  const expandNavigatorButton = page.getByRole('button', { name: 'Expand question navigator' });
  const main = page.locator('main');

  const questionCardBefore = await questionCard.boundingBox();
  const progressBarBox = await progressBar.boundingBox();
  const expandNavigatorButtonBox = await expandNavigatorButton.boundingBox();
  const mainBoxBefore = await main.boundingBox();
  expect(questionCardBefore).not.toBeNull();
  expect(progressBarBox).not.toBeNull();
  expect(expandNavigatorButtonBox).not.toBeNull();
  expect(mainBoxBefore).not.toBeNull();
  expect(expandNavigatorButtonBox!.x).toBeGreaterThan(progressBarBox!.x + progressBarBox!.width);
  expect(Math.abs(expandNavigatorButtonBox!.y - progressBarBox!.y)).toBeLessThanOrEqual(40);
  expect(
    Math.abs(
      (questionCardBefore!.x + questionCardBefore!.width / 2) -
      (mainBoxBefore!.x + mainBoxBefore!.width / 2),
    ),
  ).toBeLessThanOrEqual(40);

  await expandNavigatorButton.click();

  const questionCardAfter = await questionCard.boundingBox();
  const navigator = page
    .getByRole('button', { name: 'Collapse question navigator' })
    .locator('xpath=ancestor::aside[1]');

  expect(questionCardAfter).not.toBeNull();
  await expect(navigator).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  const mainBox = await main.boundingBox();
  const navigatorBox = await navigator.boundingBox();

  expect(mainBox).not.toBeNull();
  expect(navigatorBox).not.toBeNull();

  expect(Math.abs(questionCardAfter!.width - questionCardBefore!.width)).toBeLessThanOrEqual(8);
  expect(Math.abs(questionCardAfter!.x - questionCardBefore!.x)).toBeLessThanOrEqual(8);
  expect(navigatorBox!.x + navigatorBox!.width).toBeLessThanOrEqual(mainBox!.x + mainBox!.width + 8);
  expect(navigatorBox!.x).toBeGreaterThanOrEqual(questionCardAfter!.x + questionCardAfter!.width + 8);
});
