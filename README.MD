# Monorepo

- [Monorepo](#monorepo)
  - [The goal](#the-goal)
  - [Pre-requirements](#pre-requirements)
    - [Local NPM registry](#local-npm-registry)
  - [Getting started](#getting-started)
    - [Repository initialization](#repository-initialization)
    - [Setting up package manager](#setting-up-package-manager)
    - [TypeScript](#typescript)
      - [Installation](#installation)
      - [Configuration](#configuration)
      - [Building packages](#building-packages)
      - [Checking types](#checking-types)
    - [Peer dependencies](#peer-dependencies)
    - [Static code analyser](#static-code-analyser)
      - [@typescript-eslint](#@typescript-eslint)
      - ~~[Tslint](#tslint)~~
      - [Stylelint](#stylelint)
      - [All together](#all-together)
    - [Code formatting](#code-formatting)
    - [Testing](#testing)
    - [Storybook](#storybook)
      - [Installation](#installation-1)
      - [Typescript](#typescript)
      - [@typescript-eslint](#@typescript-eslint-1)
      - ~~[Tslint](#tslint-1)~~
      - [Addons](#addons)
    - [Final build](#final-build)
    - [Committing your work](#committing-your-work)
    - [Package publishing](#package-publishing)
  - [First package](#first-package)
    - [Development](#development)
    - [Storybook](#storybook-1)
    - [Testing](#testing-1)
    - [Build](#build)
    - [Publish](#publish)
  - [Multiple packages](#multiple-packages)
    - [Development](#development-1)
      - [Declarations generation](#declarations-generation)
      - [@typescript-eslint](#@typescript-eslint-2)
      - ~~[Tslint](#tslint-2)~~
      - [Drawbacks](#drawbacks)
    - [Typescript](#typescript-1)
    - [Storybook](#storybook-2)
    - [Jest](#jest)
  - [Final words](#final-words)

Everyone is tired with creating templates for each type of NPM package with pre-configured skeletons, managing different dependencies across own packages, linking packages for local development with instant packages rebuilding which is "wasting developers time", writing proper configuration for linters, `babel`, `typescript`, etc, and adds a lot of repeatable steps for developers. The worst part appears when one of the key dependencies is getting breaking change upgrade, for instance `babel` - it produces plenty of duplicated changes in each of the package, massive amount of merge request to be reviewed and introduces high change to make a mistake (or even worse - forget about change) in one of the packages. Hopefully, it's year 2018 and JavaScript world has a solution for managing group of the packages in the one repository. This approach calls `monorepo`.

There are many of approaches how to implement monorepo - `yarn workspaces`, `buck`, `pants`, `lerna`, and others. In this article we'll cover `lerna` approach with `yarn` as package manager. Moreover, `lerna` integrates so greatly with `yarn workspaces` as it allows to use workspaces commands directly in the repository even without `lerna`.

## The goal

The goal of this article is to create monorepo starter with Babel for building packages, TypeScript for having benefits of statically typed languages in the JavaScript world, static code analyzing tools (Tslint, Stylelint), Prettier for having automatically formated code (no more tabs or spaces holly wars), Storybook for developing components, and last, but not least - Lerna for publishing. All components will be written with React and StyledComponents for CSS-in-JS styling.

Let's not waste time on long talks about what are those tools and why they are so important, and proceed to the real configuration and will see how everyone will benefit from each in the future.

For those who are impatient, [here is the link to the repository](https://github.com/serhii-havrylenko/monorepo-babel-ts-lerna-starter) which contains whole set of results form this article - configured monorepo, ready to go and use.

## Pre-requirements

Packages:

- NodeJS LTS
- [yarn v1.5+](https://yarnpkg.com/)
- [Lerna v3+](https://lernajs.io/)

### Local NPM registry

Local NPM registry will be used in whole article to avoid publishing to global registry plenty of test packages. There are plenty of ways how to set up private NPM repository. In this example [Verdaccio](https://github.com/verdaccio/verdaccio) will be used for such purpose.

Configuration is simple tnd trivial:

```bash
$ yarn global add verdaccio
$ verdaccio &

$ npm set registry http://localhost:4873/
$ npm adduser --registry http://localhost:4873
Username: test
Password: ***
Email: ***
```

Now we could test how it works:

```
yarn info @babel/cli
```

should still show package details and in console where we started `verdaccio` we should see incoming request

```
 http --> 200, req: 'GET https://registry.npmjs.org/@babel%2Fcli' (streaming)
 http --> 200, req: 'GET https://registry.npmjs.org/@babel%2Fcli', bytes: 0/85596
```

Moreover, you could open [`http://localhost:4873/`](http://localhost:4873/) for searching published packages.

## Getting started

Time to start our configuration.

### Repository initialization

<p align="center">
  <a href="https://lernajs.io/">
    <img alt="Lerna" src="https://cloud.githubusercontent.com/assets/952783/15271604/6da94f96-1a06-11e6-8b04-dc3171f79a90.png" width="150">
  </a>
</p>

```bash
$ lerna init
```

And you have initial structure of the monorepo created by Lerna.

A little bit of important theory about packages Versioning. This step is the most important one on the repository creation stage as it would impact how do we publish/tags our packages.

Lerna supports two types of packages versioning:

1.  Independent
2.  Exact

When **exact** type is chosen, Lerna will use the same version for all packages in monorepo. In case when **independent** version is selected, Lerna will release each package with independent version. More details about versioning is on [official Lerna page](https://github.com/lerna/lerna#how-it-works)

This article will consider only independent versioning for all packages as on the initial stage of packages development of some packages would have much more releases then others, and with independent versioning we would have only required packages released.

Going back to the real examples:

```
$ lerna init --independent
lerna info version 3.4.0
lerna info Updating package.json
lerna info Creating lerna.json
lerna info Creating packages directory
lerna success Initialized Lerna files
```

and new repository for packages with independent versioning is ready.

### Setting up package manager

By default lerna is using NPM, however, it's quite simple to set Yarn as package manager:

```json
{
  "packages": ["packages/*"],
  "version": "independent",
  "useWorkspaces": true,
  "npmClient": "yarn"
}
```

Moreover, with `"useWorkspaces": true` we allow `lerna` to support `yarn workspaces` and with `"packages": ["packages/*"]` we specify in which folder(s) we would have all our packages.

### TypeScript

<p align="center">
  <a href="https://www.typescriptlang.org/">
    <img alt="typescript" src="https://www.vectorlogo.zone/logos/typescriptlang/typescriptlang-card.png" width="150">
  </a>
</p>

TypeScript could be used in two ways:

- native TypeScript with `tsc`
- [@babel/preset-typescript](https://babeljs.io/docs/en/babel-preset-typescript)

Implementation from `babel` does not have all features from latest TypeScript (like `const enum`), however, in case of usage `babel` we do not miss all cool plugins and integration with all tools looks much easier.

In this article we would use only `babel` with `typescript` preset.

#### Installation

Just hit next command to install all required plugins and presets:

```bash
$ yarn add -DW @babel/cli @babel/core @babel/preset-typescript @babel/preset-env babel-core@7.0.0-bridge.0 @babel/preset-react typescript @types/node
```

`babel-core@7.0.0-bridge.0` should be noticed separately as it's needed for properly resolving `babel-core` packages for all libs which requires old version of babel and for avoiding duplicated packages installed and possible misusage of `babel` configuration. Next line have to be added to the root `package.json`:

```json
{
  "resolutions": {
    "babel-core": "^7.0.0-bridge.0"
  }
}
```

#### Configuration

<p align="center">
  <a href="https://babeljs.io/">
    <img alt="babel" src="https://raw.githubusercontent.com/babel/logo/master/babel.png" width="150">
  </a>
</p>

Configuration is quite simple and trivial - [@babel/preset-react](https://babeljs.io/docs/en/babel-preset-react) and [@babel/preset-typescript](https://babeljs.io/docs/en/babel-preset-typescript) plus simple config for [@babel/preset-env](https://babeljs.io/docs/en/babel-preset-env).

In Release candidate version, Babel team has removed support for `stage-*` and `preset-201*` packages, so it means that all actually used plugins should be set by users manually.

Apart from removing `stage-*` packages, Babel has changed approach for looking up config files - it looks for config in `cwd` till the first `package.json`. More details could be found in [official Babel documentation](https://babeljs.io/docs/en/config-files)

Let's configure `babel.config.js` with next data:

```javascript
module.exports = (api) => {
  api.cache(true);

  return {
    presets: [
      [
        '@babel/env',
        {
          targets: {
            browsers: 'Last 2 Chrome versions, Firefox ESR',
            node: '8.9',
          },
        },
      ],
      [
        '@babel/preset-react',
        {
          development: process.env.BABEL_ENV !== 'build',
        },
      ],
      '@babel/preset-typescript',
    ],
    env: {
      build: {
        ignore: [
          '**/*.test.tsx',
          '**/*.test.ts',
          '**/*.story.tsx',
          '__snapshots__',
          '__tests__',
          '__stories__',
        ],
      },
    },
    ignore: ['node_modules'],
  };
};
```

#### Building packages

Due to changes for config lookup, build command in monorepo should have path to `.babelrc` or `babel.config.js` specified, or as [--root-mode option](https://babeljs.io/docs/en/options#rootmode). It could be done directly in build commands:

1.  In root package.json:

```json
{
  "scripts": {
    "build": "lerna exec --parallel 'BABEL_ENV=build babel src --out-dir dist --source-maps --extensions .ts,.tsx --config-file ../../babel.config.js --delete-dir-on-start --no-comments'"
  }
}
```

2.  `build` command in each package. In this case each of packages could be built independently without `lerna`. In this case `build` command is a little bit different:

```json
{
  "scripts": {
    "build": "BABEL_ENV=build babel src --out-dir dist --source-maps --extensions .ts,.tsx --delete-dir-on-start --config-file ../../babel.config.js --no-comments"
  }
}
```

3. Another way how to treat parent babel config is `extends` option provided by latest babel. The easiest approach for that is setting next lines in `package.json` on package level:

```json
{
  "extends": "../../babel.config.js"
}
```

- In this case build command doesn't require passing path to babel config and will be simplified:

```json
{
  "scripts": {
    "build": "lerna exec --parallel 'BABEL_ENV=build babel src --out-dir dist --source-maps --extensions .ts,.tsx --delete-dir-on-start --no-comments'"
  }
}
```

4. Last and easiest option is just add `--root-mode=upward` option to the build command which allows to resolve babel config upward from the current root. In this case build command looks like:

```json
{
  "scripts": {
    "build": "lerna exec --parallel 'BABEL_ENV=build babel --root-mode upward src --out-dir dist --source-maps --extensions .ts,.tsx --delete-dir-on-start --no-comments'"
  }
}
```

#### Checking types

[@babel/plugin-transform-typescript](https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-typescript) does not perform type-check for it's input. However, it could be checked with native `typescript` compiler (`tsc`). It should be run with option `noEmit` for checking types only without emitting any code.

Let's create minimal required `tsconfig.json` in the root of monorepo:

```json
{
  "compilerOptions": {
    "noEmit": true,
    "strict": true,
    "jsx": "react",
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "rootDir": "./",
    "baseUrl": "./",
    "paths": {
      "*": ["node_modules", "packages"]
    }
  },
  "include": ["packages"],
  "exclude": ["node_modules"]
}
```

and put it in `prebuild` step to run type checks automatically prior each build

```json
{
  "scripts": {
    "prebuild": "tsc"
  }
}
```

### Peer dependencies

Lerna does not have ability to add peer dependency for packages. Nevertheless, it can be done with yarn workspaces - all we need is just add workspaces definition to the root `package.json`

```json
{
  "workspaces": ["packages/*"]
}
```

In our case `react`, as well as `styled-components`, are defined as peerDependencies as all our packages will have them, however we don't want to have plenty of dependencies on each package installed separately.

As we decided to set `react` and `styled-components` as peer dependency, we still should have them, and associated types definitions for typescript, installed in our `node_modules`. So let's add them as `devDependency` to the root of monorepo:

```bash
yarn add -DW react @types/react styled-components
```

### Static code analyser

Having typescript for types checking could protect us from creating plenty of mistakes and save a lot of time for writing basic unit tests related to incorrect input data. However, it won't protect us from writing over-complicated, unreadable, or even hacky code. Even more, it won't protect us from using incorrect or unsupported CSS rules, would it be CSS, SCSS or CSS-in-JS.

#### @typescript-eslint

<p align="center">
  <a href="https://github.com/typescript-eslint/typescript-eslint">
    <img alt="tslint" src="https://eslint.org/assets/img/logo.svg" width="150">
  </a>
</p>

Due to tslint deprecation plan in 2019, `@typescript-eslint` is going to be used as standard stacic code analyzer.

Let's add all required packages as devDependency in the root of our monorepo:

```bash
yarn add -DW eslint eslint-plugin-react @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-import
```

and create simple config file for it `.eslintrc.js`:

```javascript
module.exports = {
  env: {
    node: true,
    browser: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/prop-types': 'off',
    'import/no-extraneous-dependencies': ['error'],
  },
};
```

and new script in package.json for linting `*.ts` files:

```json
{
  "scripts": {
    "lint:ts": "eslint 'packages/**/*.ts{,x}'"
  }
}
```

Now static code analyzer could be run with simple yarn lint:ts command.

#### ~~Tslint~~

<p align="center">
  <a href="https://palantir.github.io/tslint/">
    <img alt="tslint" src="https://www.feram.io/images/modules/tslint.svg" width="150">
  </a>
</p>

~~The easiest solution for automating such checks is using `tslint` for static code analyzing.~~

~~Let's install it as devDependency in the root of our monorepo:~~

```bash
yarn add -DW tslint tslint-react
```

~~and create simple config file for it `tslint.json`:~~

```json
{
  "extends": ["tslint:latest", "tslint-react"],
  "rules": {
    "semicolon": "single"
  }
}
```

~~and new script in package.json for linting `*.ts` files:~~

```json
{
  "scripts": {
    "lint:ts": "tslint 'packages/**/*.ts{,x}'"
  }
}
```

~~Now static code analyzer could be run with simple `yarn lint:ts` command.~~

#### Stylelint

<p align="center">
  <a href="https://stylelint.io/">
    <img alt="stylelint" src="https://stylelint.io/_/src/components/DefaultHeadMeta/favicon.7f672624abe02127db4972965ea73002.ico" width="150">
  </a>
</p>

Let's use `stylelint` for improving our CSS styles quality and readability. It could be easily used for analyzing CSS-in-JS as well as with simple CSS or SCSS files.

Installation and configuration process as simple as with `tslint`:

```bash
yarn add -DW stylelint stylelint-processor-styled-components stylelint-config-styled-components stylelint-config-standard
```

Create simple config file for it `tslint.json`:

```json
{
  "processors": ["stylelint-processor-styled-components"],
  "extends": ["stylelint-config-standard", "stylelint-config-styled-components"]
}
```

and new script in package.json for linting `*.ts` files:

```json
{
  "scripts": {
    "lint:css": "stylelint 'packages/**/*.ts{,x}'"
  }
}
```

Now static code analyzer could be run with simple `yarn lint:css` command.

#### All together

For now we have `lint:ts` for checking typescript code quality and `lint:css` for CSS, however, they are still separated commands and it would be uncomfortable to run them separately all the time. Let's group them in one unified `lint` command and run it with `npm-run-al`:

```bash
yarn add -DW npm-run-all
```

and new script in the root `package.json`:

```json
{
  "scripts": {
    "lint": "run-p -c lint:*",
    "lint:ts": "tslint 'packages/**/*.ts{,x}'",
    "lint:css": "stylelint 'packages/**/*.ts{,x}'"
  }
}
```

**Note:** `run-p -c` allows to run all `lint:*` commands even if one of them failed. It's useful in case of separated static code analyzer steps, as after one run we have output from `tslint` and `stylelint`, instead of only first failed.

### Code formatting

<p align="center">
  <a href="https://palantir.github.io/tslint/">
    <img alt="prettier" src="https://raw.githubusercontent.com/prettier/prettier-logo/master/images/prettier-banner-light.png" width="150">
  </a>
</p>

For now we have `typescript` for static types checking, `eslint` and `stylelint` for static code analyzing. Still, we could write unreadable or not well formatted code. We could avoid all issues relate to code formatting with `prettier`. It will automatically format our code according to predefined standards. Moreover, it will fix some issues reported by `eslint`.

As usual, installation and configuration is very simple:

```bash
yarn add -DW prettier eslint-plugin-prettier eslint-config-prettier
```

Next is needed is `.prettierrc`:

```json
{
  "printWidth": 80,
  "tabWidth": 2,
  "singleQuote": true,
  "trailingComma": "all",
  "arrowParens": "always"
}
```

and integration with `eslint`, as both of the tools have common rules (like tabWidth, trailingComma, etc). Next lines should be changed in the `.eslintrc.js` to make it work with prettier:

```javascript
module.exports = {
  // existing eslint configuration
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  // existing eslint configuration
};
```

Important note is `quotemark` rule. Because of `jsx` usage we have to override default recommended rules which requires to have single quotemark everywhere.

Last but not least, let's add script to the root `package.json` for automatic code formatting based on defined above rules:

```json
{
  "scripts": {
    "fix": "yarn lint:ts --fix"
  }
}
```

### Testing

<p align="center">
  <a href="https://jestjs.io/">
    <img alt="jest" src="https://camo.githubusercontent.com/f6414ee20933d5fb8b06dc32ed38c8aa175da559/687474703a2f2f64702e68616e6c6f6e2e696f2f3331337933753244307033382f6a6573742e706e67" width="150">
  </a>
</p>

For now we have TypeScript for checking types, `tslint` and `stylelint` for static code quality analyzing. Last, but not least part is testing. Let's use `jest` as test runner and test assertion tool. It has the best support for `react`, including snapshot testing, extensive mocking library, build-in coverage reporting and ability to run tests in different processes. `ts-jest` should be used for running `typescript` code. Installation is also quite simple:

```bash
yarn add -DW jest ts-jest @types/jest
```

`jest` could be configured in two ways:

- `yarn jest --init` and answer for all questions
- manually create config file with minimum required configuration

Here is basic setup from `jest.config.js` in the root of the monorepo

```javascript
module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'clover'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  globals: {
    'ts-jest': {
      extends: './babel.config.js',
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  notify: true,
  notifyMode: 'always',
  roots: ['<rootDir>packages'],
  testMatch: ['**/__tests__/*.+(ts|tsx|js)', '**/*.test.+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
```

Notes:

- `ts-jest` could use babel config or pure typescript compiler. In our case we have babel configured, so it could be used with just 1 line in config:

```
  globals: {
    'ts-jest': {
      extends: './babel.config.js',
    },
  },
```

- `coverageThreshold` is protecting us from writing not enough tests and having poor test coverage.

As soon as we have basic config, it's time to install `enzyme` (and all related libraries) which is extending support for `react`:

```bash
yarn add -DW enzyme enzyme-adapter-react-16 @types/enzyme @types/enzyme-adapter-react-16
```

Add `setupTestFrameworkScriptFile: '<rootDir>jest/setupTests.ts'` into `jest.config.js` file and proper setup for `enzyme` into `jest/setupTests.ts`:

```typescript
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });
```

Now `jest` is able to render `react` components, however, it will serialize snapshots as pure objects and we want to have it serialized as HTML markup. We could achieve it with proper serializer:

```bash
yarn add -DW  enzyme-to-json@next
```

and `snapshotSerializers: ['enzyme-to-json/serializer']` in `jest.config.js.`

We are almost there, we are able to run tests and create proper snapshots. Nevertheless, we still have issues with `styled-components` - on each change in styles, `styled-components` is creating different class name. Based on it we'll have plenty of false negative tests fails just because of class name is changed. Let's fix it with proper tool

```bash
yarn add -DW jest-styled-components
```

`import 'jest-styled-components'` should be added to the `jest/setupTests.ts`.

Just to sum up, `jest.config.js`:

```javascript
module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'clover'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  globals: {
    'ts-jest': {
      extends: './babel.config.js',
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  notify: true,
  notifyMode: 'always',
  roots: ['<rootDir>packages'],
  testMatch: ['**/__tests__/*.+(ts|tsx|js)', '**/*.test.+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  setupTestFrameworkScriptFile: '<rootDir>jest/setupTests.ts',
  snapshotSerializers: ['enzyme-to-json/serializer'],
};
```

That's it, `jest` is configured and could be run. Let's add `test` to the root `package.json` scripts:

```json
{
  "scripts": {
    "test": "jest"
  }
}
```

### Storybook

<p align="center">
  <a href="https://storybook.js.org/">
    <img alt="storybook" src="https://camo.githubusercontent.com/34ab12e06afbf839047bf3c19ed3e76082921f85/68747470733a2f2f64337676366c703535716a6171632e636c6f756466726f6e742e6e65742f6974656d732f33783051313531343431317a336c314f326131512f73746f7279626f6f6b732d6f6c642e706e673f582d436c6f75644170702d56697369746f722d49643d643430373439383635383733643762356162333263383038353231353066373426763d6530643332303332" width="150">
  </a>
</p>

We already able to write code in monorepo with `typescript`, analyze it with `tslint` and `stylelint`, test it with `jest`. However, we still cannot see how our components will look like and we cannot even debug it properly.

There are plenty of ways how to present react component. Let's go with most famous one - `storybook`. It allows to present separate components and/or group of them as well as testing it in real browsers, and having documentation close to it.

#### Installation

Latest stable version of `storybook@3.4.10` works with `webpack@3`, `babel@^6` and `typescript@^2.7`. As we have latest `@babel@^7` and `typescript@^3` it's better to use `next` version of storybook which has the same set of dependencies as our monorepo, even if it's bleeding edge version.

If you do it for the first time, you should have `@storybook@cli` installed globally on your machine and init:

```bash
yarn global add @storybook/cli@next
getstorybook
```

It will automatically detect project type (react), installs all required packages and create basic configuration folder.

#### Typescript

Still, as we use typescript, we have to install typings for those packages, loader for wepback and needed peerDependencies:

```bash
yarn add -DW @types/storybook__react @types/storybook__addon-actions @types/storybook__addon-links react-dom webpack awesome-typescript-loader
```

Storybook inits application as it is javascript based, as we have typescript everywhere, we have to change path resolution for stories in `storybook/config.js` file:

```typescript
const req = require.context('../packages', true, /.story.tsx?$/);
```

Last but not least part is `webpack.config.js` inside `storybook` folder, just create it with next content:

```javascript
module.exports = (baseConfig, env, config) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('awesome-typescript-loader'),
  });
  config.resolve.extensions.push('.ts', '.tsx');
  return config;
};
```

and associated configuration part in `tsconfig.json` for `awesome-typescript-loader`:

```json
{
  "awesomeTypescriptLoaderOptions": {
    "useBabel": true,
    "babelCore": "@babel/core"
  }
}
```

Configuration part is ready, we could start storybook with `yarn storybook` command.

#### @typescript-eslint

As soon as we add `storybook` to our devDependencies and run `yarn lint:ts` we will get an error from `eslint`:

```bash
{path_to_repository}/monorepo/packages/input/src/Input.story.tsx
  1:1  error  '@storybook/addon-knobs' should be listed in the project's dependencies. Run 'npm i -S @storybook/addon-knobs' to add it  import/no-extraneous-dependencies
  2:1  error  '@storybook/react' should be listed in the project's dependencies. Run 'npm i -S @storybook/react' to add it              import/no-extraneous-dependencies
```

This means that we need to configure `import/no-extraneous-dependencies` to be able to work with development dependecies which are provided in `package.json` in root of monorepository.

Let's add override to `.eslintrc.js`:

```javascript
// .eslintrc.js
modeule.exports = {
  // existing eslint configuration
  overrides: [
    {
      files: ['*.{test,spec,story}.ts{,x}'],
      rules: {
        'import/no-extraneous-dependencies': ['error', { packageDir: './' }],
      },
    },
  ],
};
```

This allow linter to check `story`, `test` and `spec` files with extended list of development dependencies, which is provided by package.json in root of monorepository.

#### ~~Tslint~~

~~As soon as we add `storybook` to our devDependencies and run `yarn lint:ts` we will get an error from `tslint`:~~

```
ERROR: Module '@storybook/react' is not listed as dependency in package.json
```

~~The reason is obvious, we use package which is installed as devDependency in our source code (in the story file). Unfortunately there is no options like override for specific path or files. It could be done by splitting `lint-ts` command into two separated for production code (which will be shipped as packages) and for test code (storybook, tests, etc).~~

~~Let's create config for `tslint` for production phase, called `tslint.prod.json`:~~

```json
{
  "extends": ["./tslint.json"],
  "rules": {
    "no-implicit-dependencies": true
  }
}
```

~~Another config for the test phase called `tslint.test.json`:~~

```json
{
  "extends": ["./tslint.json"],
  "rules": {
    "no-implicit-dependencies": [false, "dev"]
  }
}
```

~~`"no-implicit-dependencies": false` into `tslint.json` to disable this rule by default. This one is need to fix issues with IDEs as by default they use `tslint.json` for all files, whether it test or production code.~~

~~Last, but not least, scripts in the root `package.json` have to be adjusted:~~

```json
{
  "scripts": {
    "fix": "run-p -c lint:ts-* --fix",
    "lint:ts": "run-p -c lint:ts-*",
    "lint:ts-prod": "tslint --config tslint.prod.json 'packages/**/*.ts{,x}' --exclude '**/*.{test,story}.ts{,x}'",
    "lint:ts-test": "tslint --config tslint.test.json 'packages/**/*.{test,story}.ts{,x}'"
  }
}
```

#### Addons

Storybook allows to pass any props to the react component without rebuilding stories, just through UI interface. To do it, we have to add one more addons - [`@storybook/addon-knobs`](https://github.com/storybooks/storybook/tree/master/addons/knobs)

```bash
yarn add -DW @storybook/addon-knobs@next @types/storybook__addon-knobs moment
```

**NOTE**: moment has to be installed because of wrong peerDependencies management on `storybook` and `react-datetime` level.

Next step is to add `import '@storybook/addon-knobs/register';` to the `storybook/addons.js` and modify `storybook/config.js` to have global decorator for each story:

```javascript
import { configure, addDecorator } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';

const req = require.context('../packages', true, /.story.tsx?$/);
function loadStories() {
  addDecorator(withKnobs);
  req.keys().forEach((filename) => req(filename));
}

configure(loadStories, module);
```

Now `knobs` could be used in the stories.

### Final build

As we already have build command as well as code formatting and static code analyzing tools in place, it's time to use them all together in the build process:

```json
{
  "scripts": {
    "prebuild": "run-p tsc lint test",
    "build": "lerna exec --parallel 'BABEL_ENV=build babel src --root-mode upward --out-dir dist --source-maps --extensions .ts,.tsx --delete-dir-on-start --no-comments'",
    "lint:css": "stylelint 'packages/**/*.ts{,x}'",
    "lint:ts": "run-p -c lint:ts-*",
    "lint:ts-prod": "tslint --config tslint.prod.json 'packages/**/*.ts{,x}' --exclude '**/*.{test,story}.ts{,x}'",
    "lint:ts-test": "tslint --config tslint.test.json 'packages/**/*.{test,story}.ts{,x}'",
    "lint": "run-p -c lint:*",
    "test": "jest",
    "tsc": "tsc"
  }
}
```

As soon as we run `yarn build` command, `yarn` automatically will run `tsc` for type checks, `tslint` for code quality analyzing and `test` on each of packages in the monorepo.

If they succeed, `build` will proceed and prepare all packages for publishing.

### Committing your work

Let's use conventional commit for committing our work for having consistent commit messages across the monorepo and as a benefit, proper version creation per package basing on [conventional-commit](https://github.com/lerna/lerna/tree/master/commands/version#--conventional-commits) approach.

Let's install required packages:

```bash
yarn add -DW commitizen cz-lerna-changelog@^2.0.0
```

[cz-lerna-changelog](https://github.com/atlassian/cz-lerna-changelog) should be installed with version `^2.0.0` as it supports latest `lerna`

Configuration is quite simple, just add next line to the root `package.json` file:

```json
{
  "config": {
    "commitizen": {
      "path": "./node_modules/cz-lerna-changelog"
    }
  }
}
```

and simple alias for commit command:

```json
{
  "scripts": {
    "commit": "git-cz"
  }
}
```

Now it's time to test it, just change something in one of the packages, stage changes with git and run `yarn commit`:

```bash
? Select the type of change that you're committing:
❯ feat:     ✨  A new feature (note: this will indicate a release)
  fix:      🛠  A bug fix (note: this will indicate a release)
  docs:     Documentation only changes
  style:    Changes that do not affect the meaning of the code
            (white-space, formatting, missing semi-colons, etc)
  refactor: A code change that neither fixes a bug nor adds a feature
  perf:     A code change that improves performance
```

### Package publishing

As described earlier, `lerna` is used for publishing packages. It could be configured quite easily with next lines in the `lerna.json`:

```json
{
  "command": {
    "publish": {
      "conventionalCommits": true,
      "registry": "http://localhost:4873",
      "access": "public",
      "npmClient": "yarn",
      "allowBranch": ["master", "feature/*"]
    }
  }
}
```

The config is self descriptive, however, the most important parts are:

- `registry` - specifies where do we want to publish our packages
- `conventionalCommits` - allows us to use conventional commits for determining new versions

All other options could be found on the official `lerna` documentation.

Now we could add simple alias to the our scripts for having `release` command there:

```json
{
  "scripts": {
    "prerelease": "yarn build",
    "release": "lerna publish"
  }
}
```

That's it. The key part is configured and ready to be used. Time to test it with real packages.

## First package

Let's init first simple package which will be just Input with optional label for it:

```
$ mkdir packages/input && cd packages/input
$ yarn init
yarn init v1.7.0
question name (input): @taxi/input
question version (1.0.0): 0.0.0
question description: Input component
question entry point (index.js): /dist/index.ts
question repository url:
question author: chef
question license (MIT):
question private: true
success Saved package.json
Done in 85.84s.
```

and add `react` and `styled-components` as peerDependencies:

```bash
yarn workspace @taxi/input add -P react styled-components
```

### Development

Let's create simple input with optional label:

```typescript
import * as React from 'react';
import styled from 'styled-components';

export interface LabelProps {
  labelWidth?: number;
}

export interface InputWithLabelProps extends LabelProps {
  id?: string;
  label?: string;
}

export interface InputWithoutLabelProps extends LabelProps {
  id: string;
  label: string;
}

export type InputLabelProps = InputWithLabelProps | InputWithoutLabelProps;

export interface InputProps {
  name?: string;
  type?: string;
}

const Wrapper = styled.div`
  display: flex;
  margin: 10px;
`;

const Label = styled<LabelProps, 'label'>('label')`
  margin-right: 10px;
  font-weight: bold;
  width: ${({ labelWidth = 100 }) => labelWidth}px;
`;

const NativeInput = styled.input`
  width: 100%;
`;

export const Input: React.SFC<InputProps & InputLabelProps> = ({
  label,
  id,
  labelWidth,
  ...rest
}) => (
  <Wrapper>
    {label && (
      <Label labelWidth={labelWidth} htmlFor={id}>
        {label}:
      </Label>
    )}
    <NativeInput id={id} {...rest} />
  </Wrapper>
);

Input.defaultProps = {
  type: 'text',
};
```

### Storybook

`storybook` is configured, so it's time to create first story and test first package as well as `storybook` and `typescript` integration. Just create `Input.story.tsx` inside `input` package.

```typescript
import { text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import * as React from 'react';

import { Input } from './Input';

storiesOf('Input', module)
  .add('default', () => <Input />)
  .add('with label', () => (
    <Input id="test" label={text('Label', 'Username')} />
  ))
  .add('with label and type', () => (
    <Input
      id="test"
      label={text('Label', 'Username')}
      type={text('Type', 'text')}
    />
  ));
```

and run `yarn storybook`. When the build process is finished, storybook will be accessible under http://localhost:6006

### Testing

`jest` is configured and ready to be used. Let's create simple snapshot tests for our package:

```typescript
import { mount } from 'enzyme';
import * as React from 'react';

import { Input } from './Input';

describe('Input', () => {
  test('should match snapshot and styles for default props', () => {
    expect(mount(<Input />)).toMatchSnapshot();
  });

  test('should match snapshot with label', () => {
    expect(mount(<Input id="test" label="Name" />)).toMatchSnapshot();
  });
});
```

All tests could be run with simple command:

```bash
yarn test
```

Now we have a chance to check how our integration of `jest` and `jest-styled-components` works. Just open created snapshot and check that classnames are replaced with `c0`, `c1`, etc:

```
exports[`Input should match snapshot and styles for default props 1`] = `
.c0 {
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  margin: 10px;
}

.c1 {
  width: 100%;
}
```

### Build

It's time to build our package. Simply run

```bash
yarn build
```

and we should have `packages/input/dist` folder with all compiled files. The most important one is `packages/input/dist/Input.js` which has:

```javascript
const Input = ({ label, id, labelWidth, ...rest }) =>
  React.createElement(
    Wrapper,
    null,
    label &&
      React.createElement(
        Label,
        {
          labelWidth: labelWidth,
          htmlFor: id,
        },
        label,
        ':',
      ),
    React.createElement(
      NativeInput,
      _extends(
        {
          id: id,
        },
        rest,
      ),
    ),
  );
```

### Publish

It's time to publish our first package, just hit `yarn release` and answer `Yes` for publishing question. The result should be like:

```bash
$ lerna publish
lerna notice cli v3.4.0
lerna info versioning independent
lerna info Verifying npm credentials
lerna info Looking for changed packages since initial commit.

Changes:
 - @taxi/input: 0.0.0 => 0.1.0

? Are you sure you want to publish these packages? Yes
lerna info git Pushing tags...
lerna info publish Publishing packages to npm...
lerna WARN EREGISTRY Registry "http://localhost:4873" does not support `npm access ls-packages`, skipping permission checks...
lerna WARN ENOLICENSE Packages @taxi/input, @taxi/login-form are missing a license
lerna notice
lerna notice 📦  @taxi/input@0.1.0
lerna notice === Tarball Contents ===
lerna notice 640B  package.json
lerna notice 358B  CHANGELOG.md
lerna notice 389B  dist/index.js
lerna notice 176B  dist/index.js.map
lerna notice 1.8kB dist/Input.js
lerna notice 1.9kB dist/Input.js.map
lerna notice === Tarball Details ===
lerna notice name:          @taxi/input
lerna notice version:       0.1.0
lerna notice filename:      taxi-input-0.1.0.tgz
lerna notice package size:  2.3 kB
lerna notice unpacked size: 5.3 kB
lerna notice shasum:        8685cb61ee263c3af0b73d1daa2295f35eaa04d8
lerna notice integrity:     sha512-y5o/D+DevV5oS[...]P2S2XqeRi89jA==
lerna notice total files:   6
lerna info published @taxi/input 0.1.0
Successfully published:
 - @taxi/input@0.1.0
lerna success published 1 package
```

`Lerna` says that package was published successfully. Now we could check it with `yarn info` or through web interface for our local npm registry (`http://localhost:4873`):

```bash
$ yarn info @taxi/input
yarn info v1.10.1
{ name: '@taxi/input',
  versions:
   [ '0.1.0' ],
  'dist-tags':
   { latest: '0.1.0' },
  version: '0.1.0',
  description: 'Input component',
  ...
  }
Done in 1.33s.
```

Moreover, `lerna` should create proper tags in our repository associated with released packages and versions:

```bash
$ git tag
@taxi/input@0.1.0
```

Last, but not least, let's check that proper `Changelog` was created for our package:

```bash
$ cat packages/input/CHANGELOG.md
# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.1.0"></a>
# 0.1.0 (2018-10-14)


### Features

* **Input:** add default labelWidth ([8302608](https://github.com/serhii-havrylenko/monorepo-babel-ts-lerna-starter/commit/8302608))
```

Now we have first package successfully released, what's left? Second package which is dependant on our `@taxi/input` package is left. Integration with `lerna` would stay the same, simple as it is, however, it would requires some magic for making `storybook`, `jest` and `tslint` works with dependent packages and proper modules resolutions without rebuilding them all the time. Plus, as a bonus we'll generate types declarations for our packages and include them as a part of final build.

More details will be in the next article.

## Multiple packages

As everyone knows, the main goal of the monorepo is to have multiple packages inside one repository for easily solving dependencies between them and simple release process.

Let's create second package which is dependant on our `@taxi/input` and check how our tools works with it.

### Development

Just create second package in the same way as the first one. In our example it would be `@taxi/login-form` with next content:

```typescript
import { Input } from '@taxi/input';
import * as React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 10px;
`;

const ButtonsWrapper = styled.div`
  text-align: right;
`;

export interface LoginFormProps {
  onClick?: () => void;
}

export const LoginForm: React.SFC<LoginFormProps> = ({ onClick }) => (
  <Wrapper>
    <Input id="name" label="Name" />
    <Input id="password" label="Password" />

    <ButtonsWrapper>
      <button onClick={onClick}>Log in</button>
    </ButtonsWrapper>
  </Wrapper>
);
```

Now we could add `@taxi/input` to the list of dependencies. This could be achieved easily with next command:

```bash
yarn lerna add @taxi/input --scope=@taxi/login-form
```

As soon as we have it, it's time to run `tsc` and check what `typescript` thinks about our code:

```bash
$ yarn tsc
yarn run v1.10.1
$ tsc
packages/login-form/src/LoginForm.tsx:1:23 - error TS2307: Cannot find module '@taxi/input'.

1 import { Input } from '@taxi/input';
                        ~~~~~~~~~~~~~
error Command failed with exit code 1.
```

It happens because in the `package.json` file for `@taxi/input` package we have `"main": "dist/index.js"` which is pointing to the build version of the package and we have not run `build` command. So, let's build our packages and check `tsc` again:

```bash
$ yarn tsc
yarn run v1.10.1
$ tsc
packages/login-form/src/LoginForm.tsx:1:23 - error TS7016: Could not find a declaration file for module '@taxi/input'. 'monorepo-babel-ts/packages/input/dist/index.js' implicitly has an 'any' type.
  Try `npm install @types/taxi__input` if it exists or add a new declaration (.d.ts) file containing `declare module '@taxi/input';`

1 import { Input } from '@taxi/input';
                        ~~~~~~~~~~~~~
error Command failed with exit code 1.
```

Now `typescript` could find our package, however it doesn't know anything about typings for that module. It happens because we built our package with `babel` and it cannot create declaration files.

#### Declarations generation

Let's configure `tsc` to generate types declarations for our modules. As a first step, we have to move `login-form` package to the different folder (we would need to have only compilable with `tsc` packages in the `packages` directory).

We would need:

`tsconfig.build.json` in the root of monorepo with:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "emitDeclarationOnly": true,
    "declaration": true
  },
  "include": [],
  "exclude": ["**/*.story.*", "**/*.test.*", "dist"]
}
```

Where we specify that we need to emit declarations only and exclude test, stories and dist folder.

Next we would need `tsconfig.build.json` inside the each of our packages with:

```json
{
  "extends": "../../tsconfig.build.json",
  "compilerOptions": {
    "declarationDir": "./dist",
    "rootDir": "./src",
    "baseUrl": "./"
  },
  "include": ["./src"]
}
```

Here we would specify from where we would like to take files for generating declarations and where we would like to put them.

Now we would need script inside the root of monorepo for generating declarations:

```json
{
  "scripts": {
    "build:declarations": "lerna exec --parallel 'tsc --project ./tsconfig.build.json'",
    "postbuild": "yarn build:declarations"
  }
}
```

Time to test it:

```bash
$ yarn build:declarations
yarn run v1.10.1
$ lerna exec --parallel 'tsc --project ./tsconfig.build.json'
lerna notice cli v3.4.0
lerna info versioning independent
lerna info Executing command in 1 package: "tsc --project ./tsconfig.build.json"
lerna success exec Executed command in 1 package: "tsc --project ./tsconfig.build.json"
```

As the result we should have `*.d.ts` files generated in the dist folder:

```bash
$ find packages/input/dist/ -name '*.d.ts'
packages/input/dist/Input.d.ts
packages/input/dist/index.d.ts
```

Now we could check that `@taxi/login-form` works as well, just return it back to the `packages` directory and check that `tsc` works now.

```bash
$ yarn tsc
yarn run v1.10.1
$ tsc
Done in 4.22s.
```

#### @typescript-eslint

As soon as we generate declarations and run `eslitn` we would have errors like:

```bash
{path_to_repository}/monorepo/packages/input/dist/Input.d.ts
   3:3   error  Delete `··`                                                                     prettier/prettier
   6:3   error  Delete `··`                                                                     prettier/prettier
   7:1   error  Delete `··`                                                                     prettier/prettier
  10:3   error  Delete `··`                                                                     prettier/prettier
  11:1   error  Delete `··`                                                                     prettier/prettier
  13:38  error  Replace `·InputWithLabelProps` with `⏎··|·InputWithLabelProps⏎·`                prettier/prettier
  15:1   error  Delete `··`                                                                     prettier/prettier
  16:3   error  Delete `··`                                                                     prettier/prettier
  18:53  error  Replace `InputProps·&·InputLabelProps` with `⏎··InputProps·&·InputLabelProps⏎`  prettier/prettier
```

It happens because `eslitn` tries to validate `*d.ts` files as well.

Let's add `.eslintignore` configuration with list of files and directories which should be never linted:

```
dist/
*.d.ts
```

Now if we run `yarn lint:ts` we won't have any errors related to `.d.ts` files.

#### ~~Tslint~~

~~As soon as we generate declarations and run `tslint` we would have errors like:~~

```
ERROR: packages/input/dist/Input.d.ts[13, 38]: Replace `·InputWithLabelProps` with `⏎··|·InputWithLabelProps⏎·`
ERROR: packages/input/dist/Input.d.ts[15, 3]: Delete `··`
ERROR: packages/input/dist/Input.d.ts[16, 1]: Delete `··`
```

~~It happens because `tslint` tries to validate `*d.ts` files as well. Let's add the to the ignore. With latest version of `tslint` we could do it in configuration file, so:~~

~~1. `tslint.prod.json`~~

```json
{
  "linterOptions": {
    "exclude": ["**/*.d.ts", "**/*.{test,story}.ts{,x}"]
  }
}
```

~~2. `tslint.test.json`~~

```json
{
  "linterOptions": {
    "exclude": ["**/*.d.ts"]
  }
}
```

~~Now if we run `yarn lint:ts` we won't have any errors related to `.d.ts` files.~~

#### Drawbacks

We are able to generate declarations for all packages, run `storybook` and `tests`, however, as soon as we change `@taxi/input` we would not see any changes in the `storybook` for `@taxi/login-form` because we still would use previously built version. To see these changes we would need to rebuild packages one more time. The same applies to the `jest` runs.

This approach looks not so cool if each change in one of the packages would require constant rebuild. Lucky we have better option how to fix this issues. More details in the next paragraphs.

### Typescript

Firstly, let's remove all `dist` folders inside our packages to have clean code only. On this stage `tsc` should still fail. Now we could extend `tsconfig.json` with:

```json
{
  "compilerOptions": {
    "paths": {
      "@taxi/*": ["packages/*/src"],
      "*": ["node_modules", "packages"]
    }
  }
}
```

`"@taxi/*": ["packages/*/src"]` tells to `tsc` where to search for `@taxi/` packages. In our case we would like to search them in `packages/*/src` folders as there we have our source code.

Now we could run `tsc` and it would finish successfully without any errors like we had earlier.

### Storybook

As `storybook` is using `webpack` with `awesome-typescript-loader` and `babel` integration, as soon as we start storybook we would get next errors:

```bash
ERROR in ./packages/login-form/src/LoginForm.tsx
Module not found: Error: Can't resolve '@taxi/input' in 'monorepo-babel-ts/packages/login-form/src'
@ ./packages/login-form/src/LoginForm.tsx 8:13-35
```

It happens even when `tsc` could find those modules. The reason of this is simple: `tsc` checks files, `babel` transforms them and tries to execute, and it doesn't know anything about `@taxi/input` as `main` still points to the `dist` folder.

However, we could override it with aliases for `webpack`. It could be done in two ways:

1. Manual one, in this case we'll have to define each package which we would like to have in `webpack.config.resolve.alias`. This approach is simple, but it introduces potential issues in the future when someone could forget about aliases or introduces wrong one.
2. Automated one with next info in the `storybook/webpack.config.js`

```javascript
const path = require('path');
const { lstatSync, readdirSync } = require('fs');

const basePath = path.resolve(__dirname, '../', 'packages');
const packages = readdirSync(basePath).filter((name) =>
  lstatSync(path.join(basePath, name)).isDirectory(),
);

module.exports = (baseConfig, env, config) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('awesome-typescript-loader'),
  });
  config.resolve.extensions.push('.ts', '.tsx');
  Object.assign(config.resolve.alias, {
    ...packages.reduce(
      (acc, name) => ({
        ...acc,
        [`@taxi/${name}`]: path.join(basePath, name, 'src'),
      }),
      {},
    ),
  });

  return config;
};
```

This code is rather simple and self explanatory. The most important part is in reducer for building aliases:

```javascript
packages.reduce(
  (acc, name) => ({
    ...acc,
    [`@taxi/${name}`]: path.join(basePath, name, 'src'),
  }),
  {},
);
```

With this reducer we would have automatically generated list of our packages from `packages` directory.

Now we could start storybook and check that it works, moreover, if we change `@taxi/input` and check stories for `@taxi/login-form` they would have changes immediately without even building packages.

### Jest

We have `tsc` and `storybook` working, however, if we run `jest` it would fail with:

```bash
 FAIL  packages/login-form/src/LoginForm.test.tsx
  ● Test suite failed to run

    Cannot find module '@taxi/input' from 'LoginForm.test.tsx'
```

It happens because `jest` doesn't tolerate `tsconfig.json`, `webpack` aliases or even `babel-webpack-aliases`. However, this problem could be solved with simple line in `jest.config.js`:

```javascript
{
  moduleNameMapper: {
    '@taxi/(.+)$': '<rootDir>packages/$1/src',
  },
}
```

`'@taxi/(.+)$': '<rootDir>packages/$1/src` will tell jest where to find source code for `@taxi/` packages and again it points to the `src` instead of `dist`.

Now we could run `yarn test` and it will work as expected without even building packages.

## Final words

The goal of the article was to configure monorepo with `lerna`, `typescript`, `babel`, `tslint`, `stylelint`, `jest` and `semantic-release` and it was achieved. We do have monorepo with all those tools in place and it's ready for real usage. Packages could be created, developed, tested, presented and published easily with one commands in the root of monorepo.

For those who doesn't want to use `babel`, but pure `typescript`, changes would be extremely simple - just drop `babel.config.js`, change `awesome-typescript-loader` for using `tsconfig.json` instead of `babel`, `ts-jest` to use it as well and `build` command from `babel` to `tsc` (just replace `emitDeclarationOnly` to `false` in `tsconfig.build.json`) and that's it, `typescript` could be used without `babel`.
