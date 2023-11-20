#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { cwd } = require('process');
const p = require('@clack/prompts');

const USER_DIR = cwd();
const SCRIPT_DIR = __dirname;

let projectName = '';

const main = async () => {
  p.intro(`Welcome to Mitosis! Let's get started.`);

  projectName = await p.text({
    message: 'What is your Mitosis project name?',
    defaultValue: 'my-project',
    placeholder: 'my-project',
    validate: (input = 'my-project') => {
      if (fs.existsSync(path.join(USER_DIR, input))) return 'Folder already exists with this name';
    },
  });

  if (typeof projectName !== 'string') {
    p.outro(`Please provide a string for your project name. Exiting...`);
    process.exit(0);
  }

  /**
   * @type {string[] | symbol}
   */
  const targets = await p.multiselect({
    message: 'Select your desired outputs',
    options: [
      { value: 'react' },
      { value: 'svelte' },
      // { value: 'qwik' },
      // { value: 'vue' },
      // { value: 'solid' },
    ],
    required: true,
  });

  if (!Array.isArray(targets) || targets.length === 0) {
    p.outro(`No targets selected. Exiting...`);
    process.exit(0);
  }

  p.note('Generating base template');

  // start by copying over base starter
  const templateFolder = path.join(SCRIPT_DIR, './template/');
  const outputFolder = path.join(USER_DIR, projectName);

  /**
   *
   * @param {string} filePath
   */
  const updateMitosisConfig = (filePath) => {
    const config = require(filePath);
    config.targets = targets;

    return `
/**
 * @type {import('@builder.io/mitosis').MitosisConfig}
 */
module.exports = ${JSON.stringify(config, null, 2)}`;
  };
  /**
   *
   * Copy `src` to `dest`.
   * @param {string} src
   * @param {string} dest
   */
  const copy = (src, dest) => {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((entry) => {
      if (entry === 'node_modules') return;
      if (entry === 'package-lock.json') return;

      // ignore folders meant for excluded targets
      const isTargetSpecificFolder = src.endsWith('/library/packages') || src.endsWith('/servers');
      if (isTargetSpecificFolder && !targets.some((target) => entry === target)) {
        return;
      }

      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);

      // update mitosis.config.cjs
      if (entry === 'mitosis.config.cjs') {
        try {
          const newConfig = updateMitosisConfig(srcPath);

          fs.writeFileSync(destPath, newConfig);
        } catch (error) {
          p.note('Error processing `mitosis.config.cjs`. Copying as-is.');
          console.error(error);
          fs.copyFileSync(srcPath, destPath);
        }
        return;
      }

      // update all package.json files to have correct package names
      if (entry === 'package.json') {
        const packageJson = require(srcPath);

        packageJson.name = packageJson.name.replace('@template', '@' + projectName);

        // loop over dependencies and update any mitosis packages
        for (const [key, value] of Object.entries(packageJson?.dependencies || {})) {
          if (key.startsWith('@template')) {
            const newKey = key.replace('@template', '@' + projectName);
            packageJson.dependencies[newKey] = packageJson.dependencies[key];

            delete packageJson.dependencies[key];
          }
        }

        fs.writeFileSync(destPath, JSON.stringify(packageJson, null, 2));
        return;
      }

      if (fs.lstatSync(srcPath).isDirectory()) {
        copy(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  };

  copy(templateFolder, outputFolder);

  // ask about installing dependencies
  // const install = await p.confirm({
  //   message: 'Install dependencies?',
  // });

  // if (install) {
  //   p.note(`Installing dependencies...`);
  // }

  p.outro(`You're all set!`);
  process.exit(0);
};

try {
  main();
} catch (error) {
  p.outro(`An error occurred. Clearing folder and exiting...`);
  console.error(error);

  if (projectName) {
    fs.rmdirSync(path.join(USER_DIR, projectName), { recursive: true });
  }
  process.exit(1);
}
