import fs from 'fs';
import { MitosisConfig } from '@builder.io/mitosis';

export function getMitosisConfig(): MitosisConfig | null {
  const path = process.cwd() + '/mitosis.config';

  if (fs.existsSync(path)) {
    const module = require(path);
    return module?.default || module || null;
  }

  return null;
}
