import * as esbuild from 'esbuild'
import { readFile } from 'fs-extra'
import { Target } from '../../types/mitosis-config'

export const transpile = async ({
  path,
  content,
  target,
  format
}: {
  path: string
  content?: string | null
  target?: Target
  format?: 'esm' | 'cjs'
}) => {
  try {
    const output = await esbuild.transform(
      content ?? (await readFile(path, 'utf8')),
      {
        format:
          format ||
          (target === 'reactNative' || target === 'solid' ? 'esm' : 'cjs'),
        loader: 'tsx',
        target: 'es6'
      }
    )

    if (output.warnings.length) {
      console.warn(`Warnings found in file: ${path}`, output.warnings)
    }

    let contents = output.code

    if (target === 'reactNative') {
      // esbuild does not add the reactNative import, so we need to add it
      if (!contents.match(/from\s+['"]react['"]/)) {
        contents = `import * as React from 'react';\n${output.code}`
      }
    }

    // Remove .lite extensions from imports without having to load a slow parser like babel
    // E.g. convert `import { foo } from './block.lite';` -> `import { foo } from './block';`
    contents = contents.replace(/\.lite(['"][;\)])/g, '$1')

    return contents
  } catch (e) {
    console.error(`Error found in file: ${path}`)
    throw e
  }
}
