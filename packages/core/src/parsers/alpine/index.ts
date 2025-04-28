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
        _text: createSingleBinding({ code: directive.value }),
      };
    case 'bind':
      // Handle x-bind:attribute="value" or :attribute="value"
      const attribute = directive.modifiers[0];
      if (!attribute) {
        throw new Error('x-bind directive requires an attribute name');
      }
      return {
        [attribute]: createSingleBinding({ code: directive.value }),
      };
    case 'on':
      // Handle x-on:event="handler" or @event="handler"
      const event = directive.modifiers[0] || 'click';
      // Convert Alpine event modifiers to Mitosis event handlers
      const modifiers = directive.modifiers.slice(1);
      let handlerCode = directive.value;

      // Handle event modifiers
      if (modifiers.includes('prevent')) {
        handlerCode = `(e) => { e.preventDefault(); ${handlerCode} }`;
      }
      if (modifiers.includes('stop')) {
        handlerCode = `(e) => { e.stopPropagation(); ${handlerCode} }`;
      }
      if (modifiers.includes('once')) {
        handlerCode = `(function() { let called = false; return (e) => { if (!called) { called = true; ${handlerCode} } } })()`;
      }
      if (modifiers.includes('self')) {
        handlerCode = `(e) => { if (e.target === e.currentTarget) { ${handlerCode} } }`;
      }
      if (modifiers.includes('window')) {
        handlerCode = `(e) => { if (e.target === window) { ${handlerCode} } }`;
      }
      if (modifiers.includes('document')) {
        handlerCode = `(e) => { if (e.target === document) { ${handlerCode} } }`;
      }
      if (modifiers.includes('outside')) {
        handlerCode = `(e) => { if (!e.currentTarget.contains(e.target)) { ${handlerCode} } }`;
      }

      // Handle debounce and throttle
      const debounceMatch = modifiers.find((m) => m.startsWith('debounce'));
      if (debounceMatch) {
        const ms = debounceMatch.split('.')[1] || '250';
        handlerCode = `(function() { let timeout; return (e) => { clearTimeout(timeout); timeout = setTimeout(() => { ${handlerCode} }, ${ms}); } })()`;
      }

      const throttleMatch = modifiers.find((m) => m.startsWith('throttle'));
      if (throttleMatch) {
        const ms = throttleMatch.split('.')[1] || '250';
        handlerCode = `(function() { let lastCall = 0; return (e) => { const now = Date.now(); if (now - lastCall >= ${ms}) { lastCall = now; ${handlerCode} } } })()`;
      }

      return {
        [`on${event.charAt(0).toUpperCase() + event.slice(1)}`]: createSingleBinding({
          code: handlerCode,
        }),
      };
    case 'if':
      return {
        _if: createSingleBinding({ code: directive.value }),
      };
    case 'for':
      // Handle x-for="item in items" or x-for="(item, index) in items" syntax
      const forMatch =
        directive.value.match(/^\((.*?),\s*(.*?)\)\s+in\s+(.*)$/) ||
        directive.value.match(/^(.*?)\s+in\s+(.*)$/);
      if (!forMatch) {
        throw new Error('Invalid x-for syntax');
      }

      const [_, item, index, items] = forMatch;
      return {
        each: createSingleBinding({ code: items }),
        forName: item,
        indexName: index,
      };
    case 'show':
      return {
        _show: createSingleBinding({ code: directive.value }),
      };
    case 'model':
      // Handle x-model="variable" for two-way binding
      // Also handle x-model modifiers like .number, .trim, .lazy
      const modelModifiers = directive.modifiers;
      let modelValue = directive.value;
      let modelHandler = `(e) => { ${directive.value} = e.target.value }`;

      if (modelModifiers.includes('number')) {
        modelHandler = `(e) => { ${directive.value} = Number(e.target.value) }`;
      }
      if (modelModifiers.includes('trim')) {
        modelHandler = `(e) => { ${directive.value} = e.target.value.trim() }`;
      }
      if (modelModifiers.includes('lazy')) {
        modelHandler = `(e) => { ${directive.value} = e.target.value }`;
      }

      return {
        value: createSingleBinding({ code: modelValue }),
        onChange: createSingleBinding({ code: modelHandler }),
      };
    case 'html':
      return {
        innerHTML: createSingleBinding({ code: directive.value }),
      };
    case 'cloak':
      // x-cloak is handled by CSS, no need for binding
      return {};
    case 'init':
      // x-init is handled by component initialization
      return {};
    case 'transition':
      // Handle x-transition directives
      const transitionModifier = directive.modifiers[0];
      if (transitionModifier) {
        return {
          [`transition${transitionModifier.charAt(0).toUpperCase() + transitionModifier.slice(1)}`]:
            createSingleBinding({ code: directive.value }),
        };
      }
      return {};
    case 'teleport':
      // Handle x-teleport directive
      return {
        _teleport: createSingleBinding({ code: directive.value }),
      };
    case 'ref':
      // Handle x-ref directive
      return {
        ref: createSingleBinding({ code: directive.value }),
      };
    default:
      return {
        [directive.name]: createSingleBinding({ code: directive.value }),
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
      scope: {},
    });
  }

  // Handle text and comment nodes
  if (node.text) {
    return createMitosisNode({
      '@type': '@builder.io/mitosis/node',
      name: 'div',
      properties: {},
      bindings: {
        _text: createSingleBinding({ code: `"${node.text}"` }),
      },
      children: [],
      meta: {},
      scope: {},
    });
  }

  const mitosisNode = createMitosisNode({
    '@type': '@builder.io/mitosis/node',
    name: node.tagName || 'div',
    properties: node.attributes || {},
    bindings: {},
    children: [],
    meta: {},
    scope: {},
  });

  // Transform directives
  if (node.directives) {
    node.directives.forEach((directive) => {
      Object.assign(mitosisNode.bindings, transformDirective(directive));
    });
  }

  // Transform children
  if (node.children) {
    mitosisNode.children = node.children.map((child) => transformNode(child));
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
      onEvent: [],
    },
    subComponents: [],
    context: {
      get: {},
      set: {},
    },
    props: {},
    refs: {},
    inputs: [],
  };

  component.children = [transformNode(ast.root)];

  return component;
}
