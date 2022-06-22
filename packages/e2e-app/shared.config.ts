import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

import { targetContext } from './tests/context';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export function configFor(packageName: string, port: number): PlaywrightTestConfig {
  targetContext.name = packageName;

  return {
    testDir: __dirname + '/tests',
    /* Maximum time one test can run for. */
    timeout: 30 * 1000,
    expect: {
      /**
       * Maximum time expect() should wait for the condition to be met.
       * For example in `await expect(locator).toHaveText();`
       */
      timeout: 5000,
    },
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: 'html',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
      /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
      actionTimeout: 0,
      /* Base URL to use in actions like `await page.goto('/')`. */
      // baseURL: 'http://localhost:3000',

      /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
      trace: 'on-first-retry',

      baseURL: `http://localhost:${port}`,
    },

    /* Configure projects for major browsers */
    projects: [
      {
        name: 'chromium',
        use: {
          ...devices['Desktop Chrome'],
        },
      },

      // Turn on more browser in the future, at the cost of longer CI waits.

      // {
      //   name: 'firefox',
      //   use: {
      //     ...devices['Desktop Firefox'],
      //   },
      // },

      // {
      //   name: 'webkit',
      //   use: {
      //     ...devices['Desktop Safari'],
      //   },
      // },

      /* Test against mobile viewports. */
      // {
      //   name: 'Mobile Chrome',
      //   use: {
      //     ...devices['Pixel 5'],
      //   },
      // },
      // {
      //   name: 'Mobile Safari',
      //   use: {
      //     ...devices['iPhone 12'],
      //   },
      // },

      /* Test against branded browsers. */
      // {
      //   name: 'Microsoft Edge',
      //   use: {
      //     channel: 'msedge',
      //   },
      // },
      // {
      //   name: 'Google Chrome',
      //   use: {
      //     channel: 'chrome',
      //   },
      // },
    ],

    /* Folder for test artifacts such as screenshots, videos, traces, etc. */
    // outputDir: 'test-results/',

    // This is set up for E2E testing of the compiled output; it might be useful
    // also to test against "run dev" for a faster development cycle.

    webServer: {
      command: `yarn workspace @builder.io/${packageName} run serve --port ${port}`,
      port,
      reuseExistingServer: false,
    },
  };
}
