import ts from 'typescript';
import { parseTemplate } from '@angular/compiler';
import {
  Node,
  Element,
  Template,
  Text,
  BoundText,
} from '@angular/compiler/src/render3/r3_ast';
import { ASTWithSource } from '@angular/compiler/src/expression_parser/ast';
import { createJSXLiteComponent } from '../helpers/create-jsx-lite-component';
import { createJSXLiteNode } from '../helpers/create-jsx-lite-node';
import { JSXLiteNode } from '../types/jsx-lite-node';
import { omit } from 'lodash';
import { babelTransformCode } from '../helpers/babel-transform';
import { types } from '@babel/core';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { capitalize } from '../helpers/capitalize';

const getTsAST = (code: string) => {
  return ts.createSourceFile('code.ts', code, ts.ScriptTarget.Latest, true);
};

interface AngularToJsxLiteOptions {}

const transformBinding = (
  binding: string,
  _options: AngularToJsxLiteOptions,
) => {
  return babelTransformCode(binding, {
    Identifier(path: babel.NodePath<babel.types.Identifier>) {
      const name = path.node.name;

      if (
        (types.isObjectProperty(path.parent) &&
          path.parent.key === path.node) ||
        (types.isMemberExpression(path.parent) &&
          path.parent.property === path.node)
      ) {
        return;
      }

      if (
        !(name.startsWith('state.') || name === 'event' || name === '$event')
      ) {
        path.replaceWith(types.identifier(`state.${name}`));
      }
    },
  });
};

const isElement = (node: Node): node is Element =>
  // TODO: theres got to be a better way than this
  Array.isArray((node as any).attributes);

const isTemplate = (node: Node): node is Template =>
  // TODO: theres got to be a better way than this
  Array.isArray((node as any).templateAttrs);

const isText = (node: Node): node is Text =>
  typeof (node as any).value === 'string';

const isBoundText = (node: Node): node is BoundText =>
  typeof (node as any).value === 'object';

const angularTemplateNodeToJsxLiteNode = (
  node: Node,
  options: AngularToJsxLiteOptions,
): JSXLiteNode => {
  if (isTemplate(node)) {
    const ngIf = node.templateAttrs.find((item) => item.name === 'ngIf');
    if (ngIf) {
      return createJSXLiteNode({
        name: 'Show',
        bindings: {
          when: transformBinding(
            (ngIf.value as ASTWithSource).source!,
            options,
          ),
        },
        children: [
          angularTemplateNodeToJsxLiteNode(
            omit(node, 'templateAttrs'),
            options,
          ),
        ],
      });
    }
    const ngFor = node.templateAttrs.find((item) => item.name === 'ngFor');
    if (ngFor) {
      const value = (ngFor.value as ASTWithSource).source!;
      const split = value.split(/let\s|\sof\s/);
      const [_let, itemName, _of, expression] = split;
      return createJSXLiteNode({
        name: 'For',
        bindings: {
          each: transformBinding(expression, options),
        },
        properties: {
          _forName: itemName,
        },
        children: [
          angularTemplateNodeToJsxLiteNode(
            omit(node, 'templateAttrs'),
            options,
          ),
        ],
      });
    }
  }

  if (isElement(node)) {
    const properties: Record<string, string> = {};
    const bindings: Record<string, string> = {};

    for (const input of node.inputs) {
      bindings[input.name] = transformBinding(
        (input.value as ASTWithSource).source!,
        options,
      );
    }
    for (const output of node.outputs) {
      bindings['on' + capitalize(output.name)] = transformBinding(
        (output.handler as ASTWithSource)
          .source! // TODO: proper reference replace
          .replace(/\$event/g, 'event'),
        options,
      );
    }
    for (const attribute of node.attributes) {
      properties[attribute.name] = attribute.value;
    }

    return createJSXLiteNode({
      name: node.name,
      properties,
      bindings,
      children: node.children.map((node) =>
        angularTemplateNodeToJsxLiteNode(node, options),
      ),
    });
  }

  if (isText(node)) {
    return createJSXLiteNode({
      properties: {
        _text: node.value,
      },
    });
  }

  if (isBoundText(node)) {
    // TODO: handle the bindings
    return createJSXLiteNode({
      properties: {
        _text: (node.value as ASTWithSource).source!,
      },
    });
  }

  throw new Error(`Element node type {${node}} is not supported`);
};

const angularTemplateToJsxLiteNodes = (
  template: string,
  options: AngularToJsxLiteOptions,
) => {
  const ast = parseTemplate(template, '.');
  const blocks = ast.nodes.map((node) =>
    angularTemplateNodeToJsxLiteNode(node, options),
  );

  return blocks;
};

const parseTypescript = (code: string, options: AngularToJsxLiteOptions) => {
  const component = createJSXLiteComponent();

  const ast = getTsAST(code);
  for (const statement of ast.statements) {
    if (ts.isClassDeclaration(statement)) {
      if (statement.decorators) {
        for (const decorator of statement.decorators) {
          // TODO: proper reference tracing
          if (ts.isCallExpression(decorator.expression))
            if (
              ts.isIdentifier(decorator.expression.expression) &&
              decorator.expression.expression.text === 'Component'
            ) {
              const firstArg = decorator.expression.arguments[0];
              if (ts.isObjectLiteralExpression(firstArg)) {
                firstArg.properties.find((item) => {
                  if (ts.isPropertyAssignment(item)) {
                    if (
                      ts.isIdentifier(item.name) &&
                      item.name.text === 'template'
                    ) {
                      if (ts.isTemplateLiteral(item.initializer)) {
                        const template = item.initializer
                          .getText()
                          .trim()
                          .slice(1, -1);
                        component.children = angularTemplateToJsxLiteNodes(
                          template,
                          options,
                        );
                      }
                    }
                  }
                });
              }
            }
        }
      }
    }
  }

  return component;
};

export function angularToJsxLiteComponent(
  code: string,
  options: AngularToJsxLiteOptions = {},
): JSXLiteComponent {
  return parseTypescript(code, options);
}
