import { MitosisConfig } from '@builder.io/mitosis';

import { cosmiconfig, CosmiconfigResult } from 'cosmiconfig';
import { basename, extname, resolve } from 'path';

function getFilenameWithoutExtension(filePath: string): string {
  const fileName = basename(filePath);
  const fileExtension = extname(fileName);
  return fileName.replace(fileExtension, '');
}

/**
 * @param relPath { string } the relative path from pwd to config-file
 */
export async function getMitosisConfig(relPath?: string): Promise<MitosisConfig | null> {
  const moduleName = relPath ? getFilenameWithoutExtension(relPath) : 'mitosis.config';

  const explorerSync = cosmiconfig(moduleName, {
    searchPlaces: [
      'package.json',
      `${moduleName}.json`,
      `${moduleName}.yaml`,
      `${moduleName}.yml`,
      `${moduleName}.js`,
      `${moduleName}.ts`,
      `${moduleName}.mjs`,
      `${moduleName}.cjs`,
      `.config/${moduleName}.json`,
      `.config/${moduleName}.yaml`,
      `.config/${moduleName}.yml`,
      `.config/${moduleName}.js`,
      `.config/${moduleName}.ts`,
      `.config/${moduleName}.mjs`,
      `.config/${moduleName}.cjs`,
    ],
  });

  let configResult: CosmiconfigResult;

  if (relPath) {
    const path = resolve(process.cwd(), relPath);
    configResult = await explorerSync.load(path);
  } else {
    configResult = await explorerSync.search();
  }

  if (configResult && !configResult.isEmpty) {
    return configResult.config;
  }

  return null;
}
