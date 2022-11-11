import { Ast } from 'svelte/types/compiler/interfaces';

export const parseCss = (ast: Ast, json: SveltosisComponent) => {
  json.style = ast.css?.content.styles;
};
