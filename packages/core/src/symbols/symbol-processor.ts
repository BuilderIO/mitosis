import { BuilderContent, BuilderElement } from '@builder.io/sdk';
import { forEach } from 'traverse';
import {
  builderContentToMitosisComponent,
  createBuilderElement,
  isBuilderElement,
} from '../parsers/builder';
import { MitosisComponent } from '../types/mitosis-component';
import { minify } from '../generators/minify';

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
  const ids = new Set<string>();
  forEach(content, function(this, el: any) {
    if (
      this.key === 'jsCode' &&
      isString(el) &&
      el.endsWith('return _virtual_index')
    ) {
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
              const id = generateId();
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
      state: Record<string, any>;
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
  const path: (string | number)[] = [-1, content.id!];
  const hierarchy: SymbolHierarchy = {
    depthFirstSymbols: [],
    [content.id!]: [],
  };
  forEach(content, function(this, el: any) {
    let cssCode = el?.cssCode;
    if (cssCode) {
      collectComponentStyles && collectComponentStyles.push(minify`${cssCode}`);
    }
    while (path[Path.DEPTH] >= this.path.length) {
      path.shift();
      path.shift();
    }
    if (isBuilderElement(el)) {
      if (el?.component?.name === 'Symbol') {
        if (collectComponentState) {
          const symbol: BuilderSymbol = el.component.options.symbol;
          const props = symbol.data;
          const state = symbol.content?.data?.state;
          if (state) {
            const id = toHash(state);
            props['serverStateId'] = id;
            collectComponentState[id] = state;
          }
        }
        if (path[Path.DEPTH] < this.path.length) {
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

function generateId() {
  return (
    // TODO(misko): For now I have removed the data as I think it is overkill
    // and makes the output unnecessarily big.
    // new Date().getTime().toString(36) +
    Math.round(Math.random() * Number.MAX_SAFE_INTEGER).toString(36)
  );
}

function toHash(obj: any): string {
  return hashCode(JSON.stringify(obj));
}

function hashCode(text: string): string {
  var hash = 0,
    i,
    chr;
  if (text.length === 0) return String(hash);
  for (i = 0; i < text.length; i++) {
    chr = text.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return Number(Math.abs(hash)).toString(36);
}
