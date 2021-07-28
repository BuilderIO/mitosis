import { JSXLiteImport } from '../types/jsx-lite-component';

export function traceReferenceToModulePath(
  imports: JSXLiteImport[],
  name: string,
): string | null {
  let response: string | null = null;
  for (const importInfo of imports) {
    if (name in importInfo.imports) {
      return `${importInfo.path}:${importInfo.imports[name]}`;
    }
  }

  return response;
}
