import { Ast } from 'svelte/types/compiler/interfaces';
import type { SveltosisComponent } from '../types';

export const parseCss = (ast: Ast, json: SveltosisComponent) => {
  json.style = ast.css?.content.styles;
};
