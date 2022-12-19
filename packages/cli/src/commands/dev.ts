import { GluegunCommand, GluegunParameters } from 'gluegun';
import { getMitosisConfig } from '../helpers/get-mitosis-config';
import { build, clean } from '../build/build';
import chokidar from 'chokidar';
import { dev } from '../build/dev';
import { MitosisConfig, Target } from '@builder.io/mitosis';

export const getTargets = (mitosisConfig: MitosisConfig, cliOpts: GluegunParameters['options']) => {
  const targetsFromCli: Target[] = (cliOpts.targets || '').split(',');
  const excludeTargetsMap: Record<Target, true> = (cliOpts.excludeTargets || '')
    .split(',')
    .reduce((accu, t) => {
      accu[t] = true;
      return accu;
    }, {});

  const targets = Array.from(new Set([...mitosisConfig.targets, ...targetsFromCli])).filter(
    (t) => t && !excludeTargetsMap[t],
  );
  return targets;
};

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
    await build({
      ...config,
      targets,
    });

    const watcher = chokidar.watch(files, {}).on('change', async (path) => {
      performance.mark('start');
      console.log(`detected change in ${path}, rebuilding...`);
      try {
        await dev({ config: { ...config, targets }, paths: [path] });
        console.log(`Rebuilt in ${performance.measure('start').duration}`);
      } catch (e) {
        console.log('error rebuilding, save the file again to try again');
      }
    });

    const overrideWatcher = chokidar
      .watch(config.overridesDir || 'overrides', {})
      .on('change', async (path) => {
        console.log(`detected change in override folder: ${path}.
       Rerunning build (this might take a while)`);

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

module.exports = command;
