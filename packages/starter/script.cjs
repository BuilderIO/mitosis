#!/usr/bin/env node

const clack = require('@clack/prompts');

const main = async () => {
  clack.intro(`Welcome to Mitosis! Let's get started.`);

  const targets = await clack.multiselect({
    message: 'Select your desired outputs',
    options: [
      { value: 'react' },
      { value: 'qwik' },
      // { value: 'vue' },
      // { value: 'svelte' },
      // { value: 'solid' },
    ],
    required: true,
  });

  if (!Array.isArray(targets) || targets.length === 0) {
    clack.outro(`No targets selected. Exiting...`);
    process.exit(0);
  }

  // for each target, generate some code
  for (const target of targets) {
    clack.outro(`Generating ${target} code...`);
  }

  // install?

  clack.outro(`You're all set!`);
};

main();
