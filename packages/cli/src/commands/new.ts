import { GluegunCommand } from 'gluegun';

const command: GluegunCommand = {
  name: 'new',
  alias: 'n',
  description: 'mitosis new [options]',
  async run(toolbox) {
    const sys = toolbox.system;
    const pkg = toolbox.packageManager;
    const print = toolbox.print;

    async function exec(cmd: any, opts?: any) {
      try {
        const result = await sys.exec(cmd, opts);
        result.stdout && print.info(result.stdout);
      } catch (e: any) {
        print.error(`Command failed with exit code ${e.exitCode}: ${e.command}`);
        e.stdout && print.error(e.stdout);
        e.stderr && print.error(e.stderr);
        process.exit(1);
      }
    }

    // npm init
    const spinner = print.spin({});

    spinner.start('Creating new project');

    await exec('npm init -y');

    spinner.succeed('Wrote package.json');

    spinner.start('Installing packages');

    await pkg.add(['@builder.io/mitosis', '@builder.io/mitosis-cli', 'typescript'], {
      dev: true,
      force: 'npm',
    });

    spinner.succeed('Installed packages');

    toolbox.template.generate({
      template: 'tsconfig.json.ejs',
      target: 'tsconfig.json',
    });

    spinner.succeed('Wrote tsconfig.json');

    toolbox.template.generate({
      template: 'mitosis.config.js.ejs',
      target: 'mitosis.config.js',
    });

    spinner.succeed('Wrote mitosis.config.js ');

    toolbox.template.generate({
      template: 'component.lite.tsx.ejs',
      target: 'src/component.lite.tsx',
    });

    spinner.succeed('Wrote src/component.lite.tsx');

    spinner.stopAndPersist({ text: 'Done!' });

    return;
  },
};

export default command;
