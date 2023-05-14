import { GluegunCommand, GluegunParameters } from 'gluegun';
import { MitosisConfig, Target } from '@builder.io/mitosis';
import merge from 'lodash/merge';
import pick from 'lodash/pick';
import { build } from '../build/build';
import { getMitosisConfig } from '../helpers/get-mitosis-config';

const ConfigKeys = ['files'];

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

const mergeConfig = (
  originConfig: MitosisConfig,
  confgiPatch: Record<string, any>,
  configKeys: string[] = ConfigKeys,
): MitosisConfig => {
  return merge(originConfig, pick(confgiPatch, configKeys));
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
      ...mergeConfig(config, opts),
      targets,
    });
  },
};

module.exports = command;
