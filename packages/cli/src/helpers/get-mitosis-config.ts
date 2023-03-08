import fs from 'fs';
import { resolve } from 'path';
import { MitosisConfig } from '@builder.io/mitosis';

/**
 * @param relPath { string } the relative path from pwd to config-file
 */
export function getMitosisConfig(relPath?: string): MitosisConfig | null {
  const path = resolve(process.cwd(), relPath || 'mitosis.config');
  if (fs.existsSync(path + '.js')) {
    const module = require(path + '.js');
    return module?.default || module || null;
  } else if (fs.existsSync(path + '.cjs')) {
    const module = require(path + '.cjs');
    return module?.default || module || null;
  }

  return null;
}
