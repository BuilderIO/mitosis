import type { Options as PrettierOptions } from 'prettier';

export interface Options {
  emailMode?: boolean;
  extractCss?: boolean;
  minify?: boolean;
  includeJson?: boolean;
  skipPrettier?: boolean;
  prettierOptions?: PrettierOptions;
  wrap?: boolean;
  useBuilderSignature?: boolean;
  componentOnly?: boolean;
  openingTagOnly?: boolean;
  // Render static HTML, removing bindings and content with conditions or repeats
  static?: boolean;
  // If true, will try to convert `state.*` to just `*`
  // Not recommended, only for backwards compatability for Bloomwell's product page
  looseBindings?: boolean;
}
