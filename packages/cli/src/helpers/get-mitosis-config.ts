import { MitosisConfig } from 'src/types/mitosis-config'

export function getMitosisConfig(): MitosisConfig | null {
  const module = require(process.cwd() + '/mitosis.config')
  return module?.default || module || null
}
