import fs from 'fs';
import { resolve } from 'path';
import { MitosisConfig } from '@builder.io/mitosis';

/**
 * @param relPath { string } the relative path from pwd to config-file
 */
export function getMitosisConfig(relPath?: string): MitosisConfig | null {
  const path = resolve(process.cwd(), relPath || 'mitosis.config.js');
  if (fs.existsSync(path)) {
    const module = require(path);
    return module?.default || module || null;
  }

  return null;
}
