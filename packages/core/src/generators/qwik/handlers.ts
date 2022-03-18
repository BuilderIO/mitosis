import { MitosisNode } from '../../types/mitosis-node';
import { renderUseLexicalScope } from './component';
import {
  arrowFnBlock,
  File,
  INDENT,
  invoke,
  NL,
  SrcBuilder,
  UNINDENT,
  WS,
} from './src-generator';

const IIF_START = '(() => {';
const IIF_END = '})()';
export function extractJSBlock(binding: any): string | null {
  if (typeof binding == 'string') {
    if (
      binding.startsWith('{') &&
      binding.endsWith('}') &&
      !binding.startsWith('{"') &&
      !binding.endsWith('"}')
    ) {
      return binding.substring(1, binding.length - 2);
    } else if (binding.startsWith(IIF_START) && binding.endsWith(IIF_END)) {
      return binding.substring(
        IIF_START.length,
        binding.length - IIF_END.length - 1,
      );
    }
  }
  return null;
}

export function renderHandlers(
  file: File,
  componentName: string,
  children: MitosisNode[],
): Map<string, string> {
  let id = 0;
  const map = new Map<string, string>();
  const nodes = [...children];
  while (nodes.length) {
    const node = nodes.shift()!;
    const bindings = node.bindings;
    for (const key in bindings) {
      if (Object.prototype.hasOwnProperty.call(bindings, key)) {
        const binding = bindings[key]!;
        if (binding != null) {
          if (key.startsWith('on')) {
            let block = extractJSBlock(binding) || binding;
            const symbol = `${componentName}_${key}_${id++}`;
            map.set(binding, symbol);
            renderHandler(file, symbol, block);
          }
        }
      }
    }
    nodes.push(...node.children);
  }
  return map;
}

function renderHandler(file: File, symbol: string, code: string) {
  const body = [wrapWithUse(file, code)];
  const shouldRenderStateRestore = code.indexOf('state') !== -1;
  if (shouldRenderStateRestore) {
    body.unshift(renderUseLexicalScope(file));
  }
  file.exportConst(symbol, function(this: SrcBuilder) {
    this.emit([arrowFnBlock([], body)]);
  });
  file.src.emit(NL);
}

function wrapWithUse(
  file: File,
  code: string,
): string | ((this: SrcBuilder) => void) {
  const needsEvent = !!code.match(/\bevent\b/);
  if (needsEvent) {
    return function(this: SrcBuilder) {
      this.emit('{', NL, INDENT);
      needsEvent &&
        this.emit(
          'const event',
          WS,
          '=',
          WS,
          invoke(file.import(file.qwikModule, 'useEvent'), []),
          ';',
          NL,
        );
      const blockContent = stripBlock(code);
      this.emit(blockContent);
      this.emit(UNINDENT, NL, '}');
    };
  } else {
    return code;
  }
}

function stripBlock(block: string) {
  return block.substring(1, block.length - 1).trim();
}
