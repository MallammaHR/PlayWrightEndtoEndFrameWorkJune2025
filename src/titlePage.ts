import { chromium, Browser, Page } from '@playwright/test';

(async () => {
  const browser: Browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
  });

  const page: Page = await browser.newPage();

  await page.goto('https://naveenautomationlabs.com/opencart/');

//   const title = await page.title();
//   console.log('Page title:', title);

  await browser.close();
})();
