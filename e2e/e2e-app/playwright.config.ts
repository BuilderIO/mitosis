import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

export const targets = [
  { packageName: 'e2e-angular', port: 7506 },
  { packageName: 'e2e-qwik', port: 7507 },
  { packageName: 'e2e-react', port: 7502 },
  { packageName: 'e2e-solid', port: 7501 },
  { packageName: 'e2e-svelte', port: 7504 },
  { packageName: 'e2e-vue2', port: 7505 },
  { packageName: 'e2e-vue3', port: 7503 },
];

/**
 * See https://playwright.dev/docs/test-configuration.
 */

const testConfig: PlaywrightTestConfig = {
  testDir: __dirname + '/tests',

  /* Maximum time one test can run for. */
  timeout: 20 * 1000,
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
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'results.json' }]],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 3 * 1000,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: `http://localhost`,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  webServer: targets.map((t) => ({
    command: `yarn workspace @builder.io/${t.packageName} run serve --port ${t.port}`,
    port: t.port,
    reuseExistingServer: false,
  })),
};

export default testConfig;
