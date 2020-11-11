import { JSXLiteComponent } from '../types/jsx-lite-component';
import { JSXLiteNode } from '../types/jsx-lite-node';

export type ToBuilderOptions = {
  prettier?: boolean;
};

export const blockToBuilder = (json: JSXLiteNode, options: ToBuilderOptions = {}) => {
  return null;
};

export const componentToBuilder = (
  componentJson: JSXLiteComponent,
  options: ToBuilderOptions = {},
) => {
  // Make a copy we can safely mutate, similar to babel's toolchain
  return null;
};
