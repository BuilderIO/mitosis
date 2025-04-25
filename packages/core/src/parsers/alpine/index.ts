import { HTMLElement, parse } from 'node-html-parser';
import { createSingleBinding } from '../../helpers/bindings';
import { createMitosisNode } from '../../helpers/create-mitosis-node';
import { MitosisComponent } from '../../types/mitosis-component';
import { parseDataObject, parseDirective } from './helpers';

export function parseAlpine(input: string): MitosisComponent {
  const root = parse(input);
  const component: MitosisComponent = {
    '@type': '@builder.io/mitosis/component',
    name: 'AlpineComponent',
    imports: [],
    state: {},
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
    inputs: [],
    refs: {}
  };

  // Process the root element
  const rootElement = root.firstChild as HTMLElement;
  if (!rootElement) {
    return component;
  }

  // Parse x-data attribute if present
  const dataAttr = rootElement.getAttribute('x-data');
  if (dataAttr) {
    component.state = parseDataObject(dataAttr);
  }

  // Process all elements recursively
  const processElement = (element: HTMLElement) => {
    const node = createMitosisNode({
      '@type': '@builder.io/mitosis/node',
      name: element.tagName?.toLowerCase() || 'div',
      properties: {},
      bindings: {},
      children: [],
      meta: {},
      scope: {}
    });

    // Process all attributes
    const attributes = element.attributes;
    for (const [key, value] of Object.entries(attributes)) {
      if (key.startsWith('x-')) {
        // Handle Alpine directives
        const bindings = parseDirective(key, value as string);
        Object.assign(node.bindings, bindings);
      } else {
        // Handle regular attributes
        node.properties[key] = value as string;
      }
    }

    // Process child nodes
    element.childNodes.forEach((child: any) => {
      if (child.nodeType === 1) { // Element node
        node.children.push(processElement(child as HTMLElement));
      } else if (child.nodeType === 3) { // Text node
        const text = child.text.trim();
        if (text) {
          node.children.push({
            '@type': '@builder.io/mitosis/node',
            name: 'div',
            properties: {},
            bindings: {
              _text: createSingleBinding({ code: `"${text}"` })
            },
            children: [],
            meta: {},
            scope: {}
          });
        }
      }
    });

    return node;
  };

  component.children = [processElement(rootElement)];

  return component;
} 