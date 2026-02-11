import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 1 : undefined,

  reporter: process.env.CI
    ? [
        ['html'], 
        ['list']
      ]
    : [
        ['html'],
        ['list'],
        ['allure-playwright'],
        [
          'playwright-html-reporter',
          {
            testFolder: 'tests',
            title: 'OPEN CART HTML Report',
            project: 'Open Cart',
            release: '9.87.6',
            testEnvironment: 'PROD',
            embedAssets: true,
            embedAttachments: true,
            outputFolder: 'playwright-html-report',
            minifyAssets: true,
            startServer: false,
          }
        ],
      ],

  use: {
    trace: 'on-first-retry',
    headless: true,
    screenshot: 'on',
    video: 'on',
    baseURL: 'https://naveenautomationlabs.com/opencart/index.php',
  },

  metadata: {
    appUsername: 'pwtest@nal.com',
    appPassword: 'test123'
  },

  projects: [
    {
      name: 'Google Chrome',
      use: {
        channel: 'chrome',
        viewport: null,
        launchOptions: {
          args: ['--start-maximized'],  // ✅ Correct Chrome launch arg
          ignoreDefaultArgs: ['--window-size=1280,720']
        }
      }
    },
  ],
});