import { generate } from 'astring';
import { walk } from 'svelte/compiler';

import type { BaseNode, ExportNamedDeclaration, Identifier, VariableDeclaration } from 'estree';
import type { Ast } from 'svelte/types/compiler/interfaces';
import type { SveltosisComponent } from '../types';

function handleExportNamedDeclaration(json: SveltosisComponent, node: ExportNamedDeclaration) {
  const declarations = (node.declaration as VariableDeclaration)?.declarations;

  // FIXME(milahu): loop declarations
  //for (const declaration of node.declarations) {}
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

function handleVariableDeclaration(_json: SveltosisComponent, _node: VariableDeclaration) {
  throw new Error('not implemented: VariableDeclaration in svelte <script context="module">');
  // TODO(milahu): implement, similar to handleExportNamedDeclaration.
  // VariableDeclaration in <script context="module">
  // has the meaning of a static variable.
  // https://svelte.dev/docs#component-format-script-context-module
  //for (const declaration of node.declarations) {}
}

export function parseModule(ast: Ast, json: SveltosisComponent) {
  walk(ast.module as BaseNode, {
    enter(node) {
      switch (node.type) {
        case 'ExportNamedDeclaration':
          handleExportNamedDeclaration(json, node as ExportNamedDeclaration);
          break;
        case 'VariableDeclaration':
          handleVariableDeclaration(json, node as VariableDeclaration);
          break;
      }
    },
  });
}
