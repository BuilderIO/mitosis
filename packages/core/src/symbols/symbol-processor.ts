import { BuilderContent, BuilderElement } from '@builder.io/sdk';
import { forEach } from 'neotraverse/legacy';
import { minify } from '../generators/minify';
import {
  builderContentToMitosisComponent,
  createBuilderElement,
  isBuilderElement,
} from '../parsers/builder';
import { MitosisComponent } from '../types/mitosis-component';

export type SymbolHierarchy = {
  // Reverse sorted symbols
  depthFirstSymbols: BuilderElement[];
} & {
  [id: string]: string[];
};

const enum Path {
  DEPTH = 0,
  ID = 1,
}

/**
 * Ensure every symbol in a BuilderContent tree has a unique ID.
 * Mutates the data tree directly.
 */
export function ensureAllSymbolsHaveIds(content: BuilderContent): void {
  let counter = 0;
  const ids = new Set<string>();
  forEach(content, function (this, el: any) {
    if (this.key === 'jsCode' && isString(el) && el.endsWith('return _virtual_index')) {
      // Sometimes rollup adds a final `return _virtual_index` but that causes VM evaluation to fail.
      // Instead of a return on the last line, it needs a plain expression on the last line. Luckily
      // because the rollup compile behavior is consistent this works pretty reliably
      el = el.replace(/return _virtual_index$/, '_virtual_index');
      this.parent && (this.parent.node.jsCode = el);
    }
    if (isBuilderElement(el)) {
      if (el?.component?.name === 'Symbol') {
        const id = getIdFromSymbol(el);
        if (id) {
          if (ids.has(id)) {
            if (el.component?.options?.symbol) {
              const id = pad(counter++);
              el.component.options.symbol.entry = id;
              if (el.component.options.symbol.content) {
                el.component.options.symbol.content.id = id;
              }
              ids.add(id);
            }
          } else {
            ids.add(id);
          }
        }
      }
    }
  });
}

interface BuilderSymbol {
  data: Record<string, any>;
  content: {
    data: {
      state?: Record<string, any>;
    };
  };
}

//TODO(misko): needs test
export function convertBuilderContentToSymbolHierarchy(
  content: BuilderContent,
  {
    collectComponentStyles,
    collectComponentState,
  }: {
    collectComponentStyles?: string[];
    collectComponentState?: Record<string, any>;
  } = {},
): SymbolHierarchy {
  if (collectComponentState && content.data?.state) {
    const state = content.data?.state;
    collectComponentState['ROOT_COMPONENT_STATE'] = state;
  }
  const path: (string | number)[] = [-1, content.id!];
  const hierarchy: SymbolHierarchy = {
    depthFirstSymbols: [],
    [content.id!]: [],
  };
  forEach(content, function (this, el: any) {
    let cssCode = el?.cssCode;
    if (cssCode) {
      collectComponentStyles && collectComponentStyles.push(minify`${cssCode}`);
    }
    while ((path[Path.DEPTH] as number) >= this.path.length) {
      path.shift();
      path.shift();
    }
    if (isBuilderElement(el)) {
      if (el?.component?.name === 'Symbol') {
        if (collectComponentState) {
          const symbol: BuilderSymbol = el.component.options.symbol;
          const props = symbol.data || (symbol.data = {});
          const state = symbol.content?.data?.state;
          if (state) {
            const id = hashCodeAsString(state);
            props['serverStateId'] = id;
            collectComponentState[id] = state;
          }
        }
        if ((path[Path.DEPTH] as number) < this.path.length) {
          const id = getIdFromSymbol(el);
          hierarchy[id] = [];
          addIfMissing(hierarchy[path[Path.ID]], id);
          path.unshift(this.path.length, id);
        }
        // TODO(misko): This should be `el.content` not `el`
        // Because we don't wante to take the `<Symbol>` with us.
        // TODO(misko): Do we really want to add ALL symbols? Even duplicates?
        hierarchy.depthFirstSymbols.unshift(el);
      }
    }
  });

  return hierarchy;
}

export function convertBuilderElementToMitosisComponent(
  element: BuilderElement,
): MitosisComponent | null {
  const symbolValue = element.component?.options?.symbol;
  const elContent = symbolValue?.content;

  if (!elContent) {
    console.warn('Symbol missing content', element.id);
    delete element.component; // TODO(misko): Should this be assign `undefined` for perf?
    element.children = [];
    return null;
  }

  const id = getIdFromSymbol(element);
  const componentName = getJsxSymbolComponentName(id);

  delete element.component; // TODO(misko): Should this be assign `undefined` for perf?

  element.children = [
    createBuilderElement({
      component: {
        name: componentName,
        options: symbolValue.data,
      },
      properties: {
        'builder-content-id': id,
      },
    }),
  ];

  const mitosisComponent: MitosisComponent = {
    ...builderContentToMitosisComponent(elContent, {
      includeBuilderExtras: true,
      preserveTextBlocks: true,
    }),
    name: componentName,
  };
  mitosisComponent.meta.builderElId = element.id;
  return mitosisComponent;
}

export function getJsxSymbolComponentName(id: string): string {
  return 'Component' + id.toUpperCase().replace(/-/g, '');
}

function getIdFromSymbol(el: BuilderElement): string {
  // TODO(misko): Don't use entry us el.id???
  return el.component?.options?.symbol?.entry!;
}

function addIfMissing<T>(array: T[], value: T) {
  if (array.indexOf(value) == -1) {
    array.push(value);
  }
}

function isString(value: any): value is string {
  return typeof value == 'string';
}

export function hashCodeAsString(obj: any): string {
  return Number(Math.abs(hashCode(obj))).toString(36);
}

export function hashCode(obj: any, hash = 0): number {
  let value = 0;
  switch (typeof obj) {
    case 'number':
      value = obj;
      break;
    case 'undefined':
      value = Number.MIN_SAFE_INTEGER;
      break;
    case 'string':
      for (let i = 0; i < obj.length; i++) {
        hash = hashCodeApply(hash, obj.charCodeAt(i));
      }
      value = obj.length;
    case 'boolean':
      value = obj ? 1 : 0;
      break;
    case 'object':
      if (obj === null) {
        value = Number.MAX_SAFE_INTEGER;
      } else if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          hash = hashCode(obj[i], hash);
        }
      } else {
        for (const key of Object.keys(obj).sort()) {
          if (obj.hasOwnProperty(key)) {
            hash = hashCode(obj[key], hash);
          }
        }
      }
      break;
  }
  return hashCodeApply(hash, value);
}

function hashCodeApply(hash: number, value: number): number {
  hash = (hash << 5) - hash + value;
  hash |= 0; // Convert to 32bit integer
  return hash;
}

function pad(value: number): string {
  const padding = '000000';
  let result = padding + String(value);
  return result.substring(result.length - padding.length);
}
