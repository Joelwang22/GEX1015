import path from 'node:path';
import readline from 'node:readline/promises';
import process from 'node:process';
import { chromium } from '@playwright/test';

const args = new Set(process.argv.slice(2));
const isAutoMode = args.has('--auto');
const shouldCloseWhenDone = args.has('--close');
const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173';
const appUrl = `${baseUrl}/#/`;
const slowMo = Number(process.env.PLAYWRIGHT_SLOWMO ?? (isAutoMode ? 0 : 250));
const userDataDir = path.resolve('.playwright-debug-profile');

const mouseState = {
  x: 80,
  y: 80,
};

const wait = async (page, ms = 250) => {
  if (ms > 0) {
    await page.waitForTimeout(ms);
  }
};

const installVisualCursor = async (page) => {
  await page.evaluate(() => {
    const existing = document.getElementById('__pw_debug_cursor');
    if (existing) {
      return;
    }

    const cursor = document.createElement('div');
    cursor.id = '__pw_debug_cursor';
    cursor.style.position = 'fixed';
    cursor.style.left = '0';
    cursor.style.top = '0';
    cursor.style.width = '18px';
    cursor.style.height = '18px';
    cursor.style.borderRadius = '999px';
    cursor.style.background = 'rgba(244, 63, 94, 0.95)';
    cursor.style.border = '2px solid white';
    cursor.style.boxShadow = '0 0 0 3px rgba(244, 63, 94, 0.25)';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '2147483647';
    cursor.style.transform = 'translate(-50%, -50%)';
    cursor.style.transition = 'left 60ms linear, top 60ms linear';
    document.body.appendChild(cursor);

    window.__pwDebugCursorMove = (x, y) => {
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
    };
  });
};

const syncVisualCursor = async (page) => {
  await installVisualCursor(page);
  await page.evaluate(
    ({ x, y }) => window.__pwDebugCursorMove?.(x, y),
    mouseState,
  );
};

const moveMouse = async (page, targetX, targetY, steps = 12) => {
  const startX = mouseState.x;
  const startY = mouseState.y;

  for (let i = 1; i <= steps; i += 1) {
    const progress = i / steps;
    const nextX = Math.round(startX + (targetX - startX) * progress);
    const nextY = Math.round(startY + (targetY - startY) * progress);
    await page.mouse.move(nextX, nextY);
    mouseState.x = nextX;
    mouseState.y = nextY;
    await syncVisualCursor(page);
    await wait(page, isAutoMode ? 0 : 20);
  }
};

const clickLocator = async (page, locator) => {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Target element is not visible for mouse movement.');
  }

  const targetX = Math.round(box.x + box.width / 2);
  const targetY = Math.round(box.y + box.height / 2);
  await moveMouse(page, targetX, targetY);
  await page.mouse.down();
  await wait(page, isAutoMode ? 0 : 80);
  await page.mouse.up();
  await wait(page, isAutoMode ? 0 : 200);
};

const chooseFirstAnswerWithKeyboard = async (page) => {
  await wait(page, isAutoMode ? 0 : 300);
  await page.keyboard.press('1');
  await wait(page, isAutoMode ? 0 : 350);
  await page.keyboard.press('Enter');
  await page.getByText(/answer recorded|correct answer recorded/i).waitFor({ timeout: 10000 });
  await wait(page, isAutoMode ? 0 : 350);
  await page.keyboard.press('n');
};

const steps = [
  {
    label: 'Open the app home page',
    run: async (page) => {
      await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
      await installVisualCursor(page);
      await syncVisualCursor(page);
      await page.getByRole('heading', { name: 'GEX1015', exact: true }).waitFor();
    },
  },
  {
    label: 'Move the mouse to Lessons and open the lessons page',
    run: async (page) => {
      const lessonsLink = page.getByRole('link', { name: 'Lessons' });
      await clickLocator(page, lessonsLink);
      await page.getByRole('heading', { name: /Guided Lessons/i }).waitFor();
    },
  },
  {
    label: 'Move the mouse to Take Quiz and open quiz creation',
    run: async (page) => {
      const takeQuizLink = page.getByRole('link', { name: 'Take Quiz' });
      await clickLocator(page, takeQuizLink);
      await page.getByRole('heading', { name: 'Create Quiz' }).waitFor();
    },
  },
  {
    label: 'Move the mouse to Build quiz and start a test',
    run: async (page) => {
      const buildQuizButton = page.getByRole('button', { name: 'Build quiz' });
      await buildQuizButton.waitFor({ state: 'visible' });
      await clickLocator(page, buildQuizButton);
      await page.getByRole('heading', { name: 'Test Runner' }).waitFor();
    },
  },
  {
    label: 'Use the keyboard to answer question 1 and move to question 2',
    run: async (page) => {
      await page.getByRole('group', { name: 'Answer choices' }).waitFor();
      await chooseFirstAnswerWithKeyboard(page);
      await page.getByText(/Question 2 of \d+/).waitFor({ timeout: 10000 });
    },
  },
];

const printIntro = () => {
  console.log(`Playwright debug harness`);
  console.log(`App URL: ${appUrl}`);
  console.log(`Mode: ${isAutoMode ? 'auto' : 'interactive'}`);
  console.log('');
  console.log('Controls:');
  console.log('  Enter = run the next step');
  console.log('  p = open Playwright inspector pause');
  console.log('  q = quit and close the browser');
  console.log('');
};

const promptForNextAction = async (rl, stepLabel) => {
  if (isAutoMode) {
    return 'next';
  }

  const response = await rl.question(`Next step: ${stepLabel} [Enter/p/q] `);
  const normalized = response.trim().toLowerCase();
  return normalized || 'next';
};

const waitUntilQuit = async (rl) => {
  if (isAutoMode) {
    return;
  }

  while (true) {
    const response = await rl.question('Flow complete. Press Enter to keep the browser open, or q to quit. ');
    if (response.trim().toLowerCase() === 'q') {
      return;
    }
  }
};

const main = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: 'chromium',
    headless: false,
    slowMo,
    viewport: { width: 1440, height: 960 },
  });

  try {
    const page = context.pages()[0] ?? (await context.newPage());

    printIntro();

    for (const step of steps) {
      while (true) {
        const action = await promptForNextAction(rl, step.label);

        if (action === 'q') {
          return;
        }

        if (action === 'p') {
          console.log('Opening Playwright inspector. Resume from the inspector to continue.');
          await page.pause();
          continue;
        }

        break;
      }

      console.log(`Running: ${step.label}`);
      await step.run(page);
      console.log(`Done: ${step.label}`);
      console.log('');
    }

    if (shouldCloseWhenDone) {
      return;
    }

    await waitUntilQuit(rl);
  } finally {
    rl.close();
    await context.close();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
