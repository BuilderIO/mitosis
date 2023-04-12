import { MitosisConfig } from '@builder.io/mitosis';
import fs from 'fs';
import { resolve } from 'path';

/**
 * @param relPath { string } the relative path from pwd to config-file
 */
export function getMitosisConfig(relPath?: string): MitosisConfig | null {
  if (!relPath) {
    const path = resolve(process.cwd(), 'mitosis.config');

    if (fs.existsSync(path + '.js')) {
      const module = require(path + '.js');
      return module?.default || module || null;
    }

    if (fs.existsSync(path + '.cjs')) {
      const module = require(path + '.cjs');
      return module?.default || module || null;
    }

    return null;
  }

  const path = resolve(process.cwd(), relPath);

  if (fs.existsSync(path)) {
    const module = require(path);
    return module?.default || module || null;
  }

  return null;
}
