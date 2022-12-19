import { GluegunCommand } from 'gluegun';
import { getMitosisConfig } from '../helpers/get-mitosis-config';
import { build, clean } from '../build/build';
import chokidar from 'chokidar';
import { dev } from '../build/dev';
import { getTargets } from '../helpers/get-targets';
import { Target } from '@builder.io/mitosis';

const command: GluegunCommand = {
  name: 'dev',
  alias: 'd',
  run: async (toolbox) => {
    const { parameters } = toolbox;
    const opts = parameters.options;
    const configRelPath = opts.config ?? opts.c;
    const config = getMitosisConfig(configRelPath);
    if (!config) {
      throw new Error(`No config file found for Mitosis.`);
    }
    const targets = getTargets(config, opts);

    let files: string[] = [];
    if (typeof config.files === 'string') {
      files.push(config.files);
    } else {
      files.push(...config.files);
    }

    console.log('mitosis dev server started. running build command...');

    await build({
      ...config,
      targets,
    });

    const watcher = chokidar.watch(files, {}).on('change', async (path) => {
      const start = new Date();
      console.log(`detected change in ${path}, rebuilding...`);
      try {
        const data = await dev({ config: { ...config, targets }, paths: [path] });
        const end = new Date();
        const time = (end.getTime() - start.getTime()) / 1000;
        log({ data, time });
      } catch (e) {
        console.log('error rebuilding');
      }
    });

    const overrideWatcher = chokidar
      .watch(config.overridesDir || 'overrides', {})
      .on('change', async () => {
        console.log(`detected change in override folder. Rerunning build command...`);

        await clean({ ...config, targets });

        await build({
          ...config,
          targets,
        });
      });

    process.on('beforeExit', () => {
      watcher.close();
      overrideWatcher.close();
    });
  },
};

export const log = ({
  data,
  time,
}: {
  data: { target: Target; components: number; files: number }[];
  time: number;
}) => {
  const components = data.map((a) => a.components).reduce((a, b) => a + b, 0);
  const files = data.map((a) => a.files).reduce((a, b) => a + b, 0);
  const targets = data.map((a) => a.target).length;

  console.log(
    `Generated ${files} files and ${components} components in ${targets} languages in ${time}s`,
  );
};

module.exports = command;
