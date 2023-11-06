import { generate } from 'astring';
import { walk } from 'estree-walker';

import type { BaseNode, ExportNamedDeclaration, Identifier, VariableDeclaration } from 'estree';
import type { Ast } from 'svelte/types/compiler/interfaces';
import type { SveltosisComponent } from '../types';

function handleExportNamedDeclaration(json: SveltosisComponent, node: ExportNamedDeclaration) {
  const declarations = (node.declaration as VariableDeclaration)?.declarations;

  if (declarations?.length) {
    const declaration = declarations[0];
    const property = (declaration.id as Identifier).name;

    const isFunction =
      declaration.init?.type === 'FunctionExpression' ||
      declaration.init?.type === 'ArrowFunctionExpression';

    const exportObject = {
      [property]: {
        code: generate(node),
        isFunction,
      },
    };

    json.exports = { ...json.exports, ...exportObject };
  }
}

export function parseModule(ast: Ast, json: SveltosisComponent) {
  walk(ast.module as BaseNode, {
    enter(node) {
      switch (node.type) {
        case 'ExportNamedDeclaration':
          handleExportNamedDeclaration(json, node as ExportNamedDeclaration);
          break;
      }
    },
  });
}
