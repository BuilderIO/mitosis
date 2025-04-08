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

export const buildCommand = async ({
  configRelPath,
  testConfig,
  options,
}: {
  configRelPath: string;
  options: any;
  testConfig?: boolean;
}): Promise<any> => {
  const config = await getMitosisConfig(configRelPath);
  if (!config) {
    throw new Error(`No config file found for Mitosis.`);
  } else if (testConfig) {
    return config;
  }
  const targets = getTargets(config, options);
  await build({
    ...config,
    targets,
  });
};

const command: GluegunCommand = {
  name: 'build',
  alias: 'b',
  run: async (toolbox) => {
    const { parameters } = toolbox;
    const options = parameters.options;
    const configRelPath = options.config ?? options.c;
    await buildCommand({ configRelPath, options });
  },
};

module.exports = command;
