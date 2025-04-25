import { parseExpression } from '@babel/parser';
import { MitosisComponent } from '@builder.io/mitosis';
import { parse as parseHTML } from 'node-html-parser';
import { createSingleBinding } from '../../helpers/bindings';
import { createMitosisNode } from '../../helpers/create-mitosis-node';
import { MitosisNode } from '../../types/mitosis-node';
import { AlpineAST, AlpineDirective, AlpineNode } from './types';

export function parseAlpine(html: string): MitosisComponent {
  const root = parseHTML(html);
  const ast: AlpineAST = {
    type: 'AlpineAST',
    root: parseNode(root),
    data: null,
  };

  // Find x-data directive
  const dataDirective = findDataDirective(ast.root);
  if (dataDirective) {
    ast.data = {
      type: 'AlpineData',
      value: dataDirective.value,
      parsed: parseData(dataDirective.value),
    };
  }

  return convertToMitosis(ast);
}

function findDataDirective(node: AlpineNode): { value: string } | null {
  const dataDirective = node.directives.find((d) => d.name === 'x-data');
  if (dataDirective) {
    return { value: dataDirective.value };
  }

  for (const child of node.children) {
    const result = findDataDirective(child);
    if (result) {
      return result;
    }
  }

  return null;
}

function parseData(value: string): Record<string, any> {
  try {
    // First try parsing as JSON
    return JSON.parse(value);
  } catch (e) {
    try {
      // Then try parsing as JavaScript expression
      const ast = parseExpression(value, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });
      return {
        expression: ast,
        value,
      };
    } catch (e) {
      // If both fail, return the raw value
      return { value };
    }
  }
}

function parseNode(node: any): AlpineNode {
  if (node.nodeType === 3) {
    // Text node
    return {
      type: 'AlpineNode',
      tagName: '',
      attributes: {},
      directives: [],
      children: [],
      text: node.text,
    };
  }

  if (node.nodeType === 8) {
    // Comment node
    return {
      type: 'AlpineNode',
      tagName: '',
      attributes: {},
      directives: [],
      children: [],
      text: `<!--${node.text}-->`,
    };
  }

  const directives: any[] = [];
  const attributes: Record<string, string> = {};

  // Parse attributes and directives
  const attrs = node.attributes;
  if (attrs) {
    Object.keys(attrs).forEach((name) => {
      const value = attrs[name];
      if (name.startsWith('x-')) {
        const [directiveName, ...modifiers] = name.split('.');
        directives.push({
          type: 'AlpineDirective',
          name: directiveName.slice(2), // Remove 'x-' prefix
          value,
          modifiers,
        });
      } else {
        attributes[name] = value;
      }
    });
  }

  // Parse child nodes
  const children: AlpineNode[] = [];
  if (node.childNodes) {
    for (const child of node.childNodes) {
      const parsedChild = parseNode(child);
      if (parsedChild.tagName || parsedChild.text) {
        children.push(parsedChild);
      }
    }
  }

  return {
    type: 'AlpineNode',
    tagName: node.tagName?.toLowerCase() || '',
    attributes,
    directives,
    children,
    text: undefined,
  };
}

function transformDirective(directive: AlpineDirective) {
  switch (directive.name) {
    case 'text':
      return {
        _text: createSingleBinding({ code: directive.value })
      };
    case 'bind':
      return {
        [directive.modifiers[0] || 'value']: createSingleBinding({ code: directive.value })
      };
    case 'on':
      return {
        [directive.modifiers[0] || 'onClick']: createSingleBinding({ code: directive.value })
      };
    case 'if':
      return {
        _if: createSingleBinding({ code: directive.value })
      };
    case 'for':
      return {
        each: createSingleBinding({ code: directive.value })
      };
    default:
      return {
        [directive.name]: createSingleBinding({ code: directive.value })
      };
  }
}

function transformNode(node: AlpineNode | null | undefined): MitosisNode {
  // Handle null or undefined nodes
  if (!node) {
    return createMitosisNode({
      '@type': '@builder.io/mitosis/node',
      name: 'div',
      properties: {},
      bindings: {},
      children: [],
      meta: {},
      scope: {}
    });
  }

  // Handle text and comment nodes
  if (node.text) {
    return createMitosisNode({
      '@type': '@builder.io/mitosis/node',
      name: 'div',
      properties: {},
      bindings: {
        _text: createSingleBinding({ code: `"${node.text}"` })
      },
      children: [],
      meta: {},
      scope: {}
    });
  }

  const mitosisNode = createMitosisNode({
    '@type': '@builder.io/mitosis/node',
    name: node.tagName || 'div',
    properties: node.attributes || {},
    bindings: {},
    children: [],
    meta: {},
    scope: {}
  });

  // Transform directives
  if (node.directives) {
    node.directives.forEach(directive => {
      Object.assign(mitosisNode.bindings, transformDirective(directive));
    });
  }

  // Transform children
  if (node.children) {
    mitosisNode.children = node.children.map(child => transformNode(child));
  }

  return mitosisNode;
}

function convertToMitosis(ast: AlpineAST): MitosisComponent {
  const component: MitosisComponent = {
    '@type': '@builder.io/mitosis/component',
    name: 'AlpineComponent',
    imports: [],
    state: ast.data?.parsed || {},
    children: [],
    meta: {},
    hooks: {
      onMount: [],
      onEvent: []
    },
    subComponents: [],
    context: {
      get: {},
      set: {}
    },
    props: {},
    refs: {},
    inputs: []
  };

  component.children = [transformNode(ast.root)];

  return component;
} 