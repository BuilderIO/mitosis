import { GluegunCommand } from 'gluegun';
import { build } from '../build/build';
import { getMitosisConfig } from '../helpers/get-mitosis-config';
import {getTargets} from "../helpers/get-targets"

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
