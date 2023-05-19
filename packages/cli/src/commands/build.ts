import { MitosisConfig, Target } from '@builder.io/mitosis';
import { GluegunCommand, GluegunParameters } from 'gluegun';
import { build } from '../build/build';
import { getMitosisConfig } from '../helpers/get-mitosis-config';

const getTargets = (mitosisConfig: MitosisConfig, cliOpts: GluegunParameters['options']) => {
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
  name: 'build',
  alias: 'b',
  run: async (toolbox) => {
    const { parameters } = toolbox;
    const opts = parameters.options;
    const configRelPath = opts.config ?? opts.c;
    const config = getMitosisConfig(configRelPath);
    if (!config) {
      throw new Error(`No config file found for Mitosis.`);
    }
    const targets = getTargets(config, opts);
    await build({
      ...config,
      targets,
    });
  },
};

module.exports = command;
