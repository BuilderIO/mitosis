import * as path from 'path';

/**
 * Restrict rule to only files that have a '.lite' ext, multiple exts is fine
 * (like file.lite.jsx).
 *
 * @example
 * ```typescript
 * isMitosisPath('file.jsx')
 * // false
 *
 * isMitosisPath('file.lite.jsx')
 * // true
 * ```
 */
export default function isMitosisPath(filename: string) {
  filename = path.basename(filename);

  const tokens = filename.split('.');
  const exts = tokens.splice(1);

  return exts.includes('lite');
}
