import { walk } from 'svelte/compiler';
import type { MitosisNode } from '../../../types/mitosis-node';

import { parseEach } from './each';
import { parseElement } from './element';
import { parseFragment } from './fragment';
import { parseIfElse } from './if-else';
import { parseMustacheTag, parseRawMustacheTag } from './mustache-tag';
import { parseSlot } from './slot';
import { parseText } from './text';

import type { Ast, TemplateNode } from 'svelte/types/compiler/interfaces';
import type { SveltosisComponent } from '../types';

export function parseHtml(ast: Ast, json: SveltosisComponent) {
  // todo: should filter children and check if just 1 has length
  const html =
    ast.html.children?.length === 2 && ast.html.children[0].raw?.trim().length === 0
      ? ast.html.children[1]
      : ast.html;

  walk(html, {
    enter(node, parent) {
      const templateNode = node as TemplateNode;
      const parentTemplateNode = parent as TemplateNode;

      if (parentTemplateNode?.children || templateNode.data === '\n\n') {
        this.skip();
        return;
      }

      const mitosisNode = parseHtmlNode(json, templateNode);

      if (mitosisNode) {
        json.children.push(mitosisNode);
      }
    },
  });
}

export function parseHtmlNode(
  json: SveltosisComponent,
  node: TemplateNode,
): MitosisNode | undefined {
  const mitosisNode: MitosisNode = {
    '@type': '@builder.io/mitosis/node',
    name: '',
    meta: {},
    scope: {},
    children: [],
    bindings: {},
    properties: {},
    slots: {},
  };

  switch (node.type) {
    case 'Element':
    case 'InlineComponent': {
      return parseElement(json, node);
    }
    case 'MustacheTag': {
      return parseMustacheTag(node);
    }
    case 'RawMustacheTag': {
      return parseRawMustacheTag(node);
    }
    case 'IfBlock': {
      return parseIfElse(json, node);
    }
    case 'EachBlock': {
      return parseEach(json, node);
    }
    case 'Text': {
      return parseText(node);
    }
    case 'Fragment': {
      return parseFragment(json, node);
    }
    case 'Slot': {
      return parseSlot(json, node);
    }
    case 'Comment': {
      // do nothing :) probably skip?

      break;
    }
    default: {
      mitosisNode.name = 'div';
    }
  }
}
