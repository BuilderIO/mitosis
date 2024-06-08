import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { PackageName } from './src/testConfig';

export const targets: { packageName: PackageName; port: number }[] = (
  [
    // { packageName: 'e2e-alpine' },
    { packageName: 'e2e-angular' },
    { packageName: 'e2e-qwik' },
    { packageName: 'e2e-react' },
    { packageName: 'e2e-solid' },
    { packageName: 'e2e-svelte' },
    { packageName: 'e2e-vue3' },
  ] as const
).map(({ packageName }, i) => {
  const port = 1234 + i;

  return {
    port,
    packageName,
  };
});

const getDirName = () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return __dirname;
  } catch (error) {
    return '.';
  }
};

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const testConfig: PlaywrightTestConfig = {
  testDir: getDirName() + '/tests',

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
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'playwright-results.json' }],
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 3 * 1000,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',
    screenshot: 'on',

    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: `http://localhost`,
  },

  /* Configure projects for major browsers */
  projects: targets.map(({ packageName, port }) => ({
    name: packageName,
    use: {
      ...devices['Desktop Chrome'],
      baseURL: `http://localhost:${port}`,
      /**
       * This provides the package name to the test as a variable to check which exact server the test is running.
       */
      packageName,
    },
  })),

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  webServer: targets.map(({ packageName, port }) => ({
    command: `yarn workspace @builder.io/${packageName} run serve --port=${port}`,
    port: port,
    reuseExistingServer: false,
  })),
};

export default testConfig;
