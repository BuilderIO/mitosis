# Local Development

Welcome ⚡️!! If you've found a bug, or have an idea to add a feature we'd love to hear from you. It may save time to first ping the group on [Mitosis' Discord channel](https://discord.com/channels/842438759945601056/935218469799071835) to talk through any ideas or any issues that may be a bug.

## Project Structure

Mitosis is structured as a mono-repo. The packages live under `packages/`:

- `core` (`@builder.io/mitosis`): contains the Mitosis engine
- `cli` (`@builder.io/mitosis-cli`): contains the Mitosis CLI, and _depends_ on `core`
- `fiddle`: contains the code for the interactive Mitosis fiddle, which is hosted at mitosis.builder.io
- `eslint-plugin` (package TBD): contains the Mitosis eslint rules to enforce valid Mitosis component syntax. Yet to be released.

## Installation

First, you should run `yarn` in the root of the project to install all the dependencies.

For all packages, the below steps to develop locally are the same:

```bash
# run local development server
yarn start

# run tests
yarn test
```

## Submitting Issues And Writing Tests

We need your help! If you found a bug, it's best to [create an issue](https://github.com/BuilderIO/mitosis/issues/new) and follow the template we've created for you. Afterwards, create a [Pull Request](https://docs.github.com/en/github/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) that replicates the issue using a test.

## Developing for Core & Testing

In `core`, we use jest snapshots for testing. If you are solving a problem that is reproducible by a fiddle in [mitosis.builder.io](https://mitosis.builder.io), we highly recommend the following flow:

- copy your component from the fiddle into a file in `packages/core/src/__tests__/data`. See [packages/core/src/**tests**/data/basic.raw.tsx](packages/core/src/__tests__/data/basic.raw.tsx) as an example.
- Create a test that shows how compiling this component to a certain target causes the bug. See [context.test.ts](packages/core/src/__tests__/context.test.ts) as an example of using `builder-render-block.raw.tsx`
- run `jest` in watch mode: `yarn test --watch`
- run the development server: `yarn start`
- keep iterating until your test passes!

PS: don't worry about failing imports in the raw test TSX files. These are not an issue, since the files are standalone and don't actually belong to a cohesive project.
