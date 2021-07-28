import { GluegunCommand } from 'gluegun'
import { build } from '../build/build'
import { getMitosisConfig } from '../helpers/get-mitosis-config'

const command: GluegunCommand = {
  name: 'build',
  alias: 'b',
  run: async toolbox => {
    await build(getMitosisConfig());
  }
}

module.exports = command
