#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { cwd } = require('process');
const p = require('@clack/prompts');
const spawn = require('cross-spawn');

const USER_DIR = cwd();
const SCRIPT_DIR = __dirname;

let projectName = '';

const main = async () => {
  p.intro(`Welcome to Mitosis! Let's get started.`);

  projectName = await p.text({
    message: 'What is your Mitosis project name?',
    defaultValue: 'my-project',
    placeholder: 'my-project',
    validate: (_input) => {
      const input = _input || 'my-project';
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
    options: [{ value: 'react' }, { value: 'svelte' }, { value: 'qwik' }],
    required: true,
  });

  if (!Array.isArray(targets) || targets.length === 0) {
    p.outro(`No targets selected. Exiting...`);
    process.exit(0);
  }

  p.note('Generating your template...');

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
      const isTargetSpecificFolder =
        src.endsWith('/library/packages') || src.endsWith('/test-apps');
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

      if (fs.lstatSync(srcPath).isDirectory()) {
        copy(srcPath, destPath);
      } else {
        const fileContents = fs.readFileSync(srcPath, 'utf8');
        // update all files to have correct package names
        const updatedFileContents = fileContents.replace(/@template/g, '@' + projectName);
        fs.writeFileSync(destPath, updatedFileContents);
      }
    });
  };

  copy(templateFolder, outputFolder);

  p.note('Template generated!');
  // ask about installing dependencies
  const install = await p.confirm({
    message: 'Install dependencies?',
  });

  if (install) {
    p.note(`Installing dependencies...this may take a while!`);
    const installProcess = spawn.sync('npm', ['install'], {
      cwd: outputFolder,
      stdio: 'inherit',
    });
  }

  p.outro(`
  You're all set!
  
  Next: 
  - cd \`${projectName}/\`
  - open the README.md for further instructions on how to run your project
  `);
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
