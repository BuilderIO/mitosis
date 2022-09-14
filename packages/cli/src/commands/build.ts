import { GluegunCommand, GluegunParameters } from 'gluegun';
import { MitosisConfig, Target } from '@builder.io/mitosis';
import { build } from '../build/build';
import { getMitosisConfig } from '../helpers/get-mitosis-config';

const getTargets = (mitosisConfig: MitosisConfig, cliOpts: GluegunParameters['options']) => {
  const targetsFromCli: Target[] = (cliOpts.targets || '').split(',');
  const targetsIgnoredMap: Record<Target, true> = (cliOpts.targetsIgnored || '')
    .split(',')
    .reduce((accu, t) => {
      accu[t] = true;
      return accu;
    }, {});

  const targets = Array.from(new Set([...mitosisConfig.targets, ...targetsFromCli])).filter(
    (t) => t && !targetsIgnoredMap[t],
  );
  return targets;
};

const command: GluegunCommand = {
  name: 'build',
  alias: 'b',
  run: async (toolbox) => {
    const { parameters } = toolbox;
    const opts = parameters.options;
    const configRelPath = opts.config ?? opts.c;
    const config = getMitosisConfig(configRelPath);
    const targets = getTargets(config, opts);
    await build({
      ...config,
      targets,
    });
  },
};

module.exports = command;
