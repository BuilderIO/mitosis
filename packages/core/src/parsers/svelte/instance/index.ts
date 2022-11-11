import { walk } from 'svelte/compiler';
import { generate } from 'astring';

import { parseAfterUpdate, parseOnDestroy, parseOnMount } from './hooks';
import { parseFunctions } from './functions';
import { parseGetContext, parseHasContext, parseSetContext } from './context';
import { parseImports } from './imports';
import { parseProperties } from './properties';
import { parseReactive } from './reactive';
import { parseReferences } from './references';
import { parseStatementAtProgramLevel } from './statements';
import { parseMemberExpression } from './expressions';

import type { Ast } from 'svelte/types/compiler/interfaces';
import type {
  BaseNode,
  ImportDeclaration,
  ExportNamedDeclaration,
  ExpressionStatement,
  FunctionDeclaration,
  VariableDeclaration,
  LabeledStatement,
  Identifier,
  Statement,
} from 'estree';

type InstanceHandler<T = BaseNode> = (json: SveltosisComponent, node: T, parent?: BaseNode) => void;

const handleImportDeclaration: InstanceHandler<ImportDeclaration> = (json, node) => {
  parseImports(json, node as ImportDeclaration);
};

const handleExportNamedDeclaration: InstanceHandler<ExportNamedDeclaration> = (json, node) => {
  parseProperties(json, node);
};

const handleMemberExpression: InstanceHandler<ExpressionStatement> = (json, node, parent) => {
  parseMemberExpression(json, node, parent);
};

const handleExpressionStatement: InstanceHandler<ExpressionStatement> = (json, node, parent) => {
  if (node.expression.type === 'CallExpression') {
    if (node.expression.callee.type === 'MemberExpression') {
      handleMemberExpression(json, node, parent);
      return;
    }

    const callee = node.expression.callee as Identifier;

    switch (callee.name) {
      case 'setContext': {
        parseSetContext(json, node);
        break;
      }
      case 'onMount': {
        parseOnMount(json, node);
        break;
      }
      case 'onDestroy': {
        parseOnDestroy(json, node);
        break;
      }
      case 'onAfterUpdate': {
        parseAfterUpdate(json, node);
        break;
      }
    }

    // No default
  } else if (parent?.type === 'Program') {
    const onMountCode = json.hooks.onMount?.code || '';

    json.hooks.onMount = {
      code: `${onMountCode}\n${generate(node)};\n`,
    };
  }
};

const handleFunctionDeclaration: InstanceHandler<FunctionDeclaration> = (json, node) => {
  parseFunctions(json, node);
};

const handleVariableDeclaration: InstanceHandler<VariableDeclaration> = (json, node) => {
  const init = node.declarations[0]?.init;

  if (init?.type === 'CallExpression' && (init?.callee as Identifier)?.name === 'getContext') {
    parseGetContext(json, node);
  } else if (
    init?.type === 'CallExpression' &&
    (init?.callee as Identifier)?.name === 'hasContext'
  ) {
    parseHasContext(json, node);
  } else if (
    init?.type === 'CallExpression' &&
    (init?.callee as Identifier)?.name === 'createEventDispatcher'
  ) {
    // ignore
  } else {
    parseReferences(json, node);
  }
};

const handleLabeledStatement: InstanceHandler<LabeledStatement> = (json, node) => {
  if (node.label.name === '$') {
    parseReactive(json, node);
  }
};

const handleStatement: InstanceHandler<Statement> = (json, node, parent) => {
  if (parent?.type === 'Program') {
    parseStatementAtProgramLevel(json, node);
  }
};

export function parseInstance(ast: Ast, json: SveltosisComponent) {
  walk(ast.instance as BaseNode, {
    enter(node, parent) {
      switch (node.type) {
        case 'ImportDeclaration':
          handleImportDeclaration(json, node as ImportDeclaration);
          break;
        case 'ExportNamedDeclaration':
          handleExportNamedDeclaration(json, node as ExportNamedDeclaration);
          break;
        case 'ExpressionStatement':
          handleExpressionStatement(json, node as ExpressionStatement, parent);
          break;
        case 'FunctionDeclaration':
          handleFunctionDeclaration(json, node as FunctionDeclaration);
          break;
        case 'VariableDeclaration':
          parent.type === 'Program' && handleVariableDeclaration(json, node as VariableDeclaration);
          break;
        case 'LabeledStatement':
          handleLabeledStatement(json, node as LabeledStatement);
          break;
        case 'IfStatement':
        case 'SwitchStatement':
        case 'TryStatement':
        case 'DoWhileStatement':
        case 'ForStatement':
        case 'ForInStatement':
        case 'ForOfStatement':
          handleStatement(json, node as Statement, parent);
          break;
      }
    },
  });
}
