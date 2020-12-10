#!/usr/bin/env node
const meow = require('meow');

const CLI_NAME = 'jsx-lite';
const COMMANDS = [
  'vue',
  'react',
  'angular',
  'svelte',
  'reactNative',
  'solid',
  'webcomponents',
  'html',
  'liquid',
  'json',
  'builder',
];

const cli = meow(
  `
  $ ${CLI_NAME} --help

    Usage
      $ ${CLI_NAME} <files> <command> [options]

    Commands
      ${COMMANDS.join(', ')}

    Options
      --output-dir, -d    Output directory (default: ".")         [string]

      <svelte>
      --state-handling    variables, proxies                      [string]

      <react>
      --style-library     emotion, styledComponents, styledJsx    [string]
      --state-library     useState, mobx, solid                   [string]

      <reactNative>
      --state-library     useState, mobx, solid                   [string]

    Examples
      $ jsx-lite example.jsx vue
      $ jsx-lite example.jsx svelte --state-handling=proxies
      $ jsx-lite source/**/*.jsx react --output-dir=packages/react

`,
  {
    flags: {
      outputDir: {
        type: 'string',
        alias: 'd',
        default: '.',
      },
      styleLibrary: {
        type: 'string',
      },
      stateLibrary: {
        type: 'string',
      },
      stateHandling: {
        type: 'string',
      },
    },
  },
);

const files = cli.input[0];
const command = cli.input[1];

if (!COMMANDS.includes(command)) {
  console.log(`Unknown command "${command}"`);
  console.log(`Usage: $ ${CLI_NAME} --help`);
  process.exit(1);
}

// TODO:
// - read files (single file + directories, glob support?)
// - parse jsx e.g. `parseJsx(file)` (@jsx-lite/core)
// - compile to specified output e.g. `componentToSvelte(json, options)` (@jsx-lite/core)
// - save files to specified output dir
