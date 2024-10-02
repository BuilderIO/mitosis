import { BaseTranspilerOptions } from '@/types/transpiler';

export interface ToHtmlOptions extends BaseTranspilerOptions {
  format?: 'class' | 'script';
  prefix?: string;
}

export type HtmlMetadata = {};
