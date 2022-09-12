import { GluegunCommand } from 'gluegun';
import { build } from '../build/build';
import { getMitosisConfig } from '../helpers/get-mitosis-config';

const command: GluegunCommand = {
  name: 'build',
  alias: 'b',
  run: async (toolbox) => {
    const { parameters } = toolbox;
    const opts = parameters.options;
    const configRelPath = opts.config ?? opts.c;
    await build(getMitosisConfig(configRelPath));
  },
};

module.exports = command;
