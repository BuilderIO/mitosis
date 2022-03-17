import { MitosisConfig } from '@builder.io/mitosis';

export function getMitosisConfig(): MitosisConfig | null {
  const module = require(process.cwd() + '/mitosis.config');
  return module?.default || module || null;
}
