import { stat } from 'fs';
import {
  compileAwayBuilderComponentsFromTree,
  components as compileAwayComponents,
} from '../../plugins/compile-away-builder-components';
import { MitosisComponent } from '../../types/mitosis-component';
import { minify } from '../minify';
import { renderHandlers } from './handlers';
import { renderJSXNodes } from './jsx';
import {
  arrowFnBlock,
  arrowFnValue,
  File,
  iif,
  INDENT,
  invoke,
  NL,
  SrcBuilder,
  SrcBuilderOptions,
  UNINDENT,
  WS,
} from './src-generator';
import { collectStyles, CssStyles, renderStyles } from './styles';

export type QwikOptions = {
  qwikLib?: string;
  qrlPrefix?: string;
  output?: 'ts' | 'cjs' | 'mjs';
  jsx?: boolean;
  minify?: boolean;
};

export interface FileSet {
  high: File;
  med: File;
  low: File;
}

export function createFileSet(options: QwikOptions = {}): FileSet {
  const opts: Required<QwikOptions> = {
    qwikLib: '@builder.io/qwik',
    qrlPrefix: './',
    output: 'ts',
    minify: false,
    jsx: true,
    ...options,
  };
  const extension =
    (opts.output == 'mjs' ? 'js' : opts.output) + (opts.jsx ? 'x' : '');
  const srcOptions: SrcBuilderOptions = {
    isPretty: !opts.minify,
    isModule: opts.output != 'cjs',
    isTypeScript: opts.output == 'ts',
    isJSX: opts.jsx,
  };
  const fileSet = {
    high: new File(
      'high.' + extension,
      srcOptions,
      opts.qwikLib,
      opts.qrlPrefix,
    ),
    med: new File('med.' + extension, srcOptions, opts.qwikLib, opts.qrlPrefix),
    low: new File('low.' + extension, srcOptions, opts.qwikLib, opts.qrlPrefix),
  };
  Object.defineProperty(fileSet, '_commonStyles', {
    enumerable: false,
    value: { styles: new Map<string, CssStyles>() as any, symbolName: null },
  });
  fileSet.med.exportConst('__merge', minify`${__merge}`);
  return fileSet;
}

function getCommonStyles(
  fileSet: FileSet,
): {
  styles: Map<string, CssStyles>;
  symbolName: string | null;
} {
  return (fileSet as any)['_commonStyles'];
}

export function addComponent(
  fileSet: FileSet,
  component: MitosisComponent,
  opts: { isRoot?: boolean; shareStyles?: boolean } = {},
) {
  const _opts = { isRoot: false, shareStyles: false, ...opts };
  compileAwayBuilderComponentsFromTree(component, {
    ...compileAwayComponents,
    Image: undefined!,
    CoreButton: undefined!,
  });
  const componentName = component.name;
  const handlers = renderHandlers(
    fileSet.high,
    componentName,
    component.children,
  );
  // If the component has no handlers, than it is probably static
  // and so it is unlikely to be re-rendered on the client, therefore
  // put it in a low priority bucket.
  const isStatic = Array.from(handlers.keys()).reduce(
    (p, v) => p && v.indexOf('state') == -1,
    true,
  );
  const onRenderFile = isStatic ? fileSet.low : fileSet.med;
  const componentFile = fileSet.med;
  if (!componentFile.exports.get('onMountCreateEmptyState')) {
    componentFile.exportConst('onMountCreateEmptyState', function(
      this: SrcBuilder,
    ) {
      this.emit(
        invoke(
          componentFile.import(componentFile.qwikModule, 'qHook'),
          [arrowFnValue([], ['({})'])],
          ['any', 'any'],
        ),
      );
    });
  }
  if (component.hooks.onMount?.code) {
    addComponentOnMount(componentFile, componentName, component);
  }
  const styles = _opts.shareStyles
    ? getCommonStyles(fileSet).styles
    : new Map<string, CssStyles>();
  collectStyles(component.children, styles);
  const qComponentOptions: Record<string, any> = {
    // tagName: string(componentName.toLowerCase()),
    onMount: invoke(componentFile.import(componentFile.qwikModule, 'qHook'), [
      componentFile.toQrl(
        component.hooks.onMount?.code
          ? componentName + '_onMount'
          : 'onMountCreateEmptyState',
      ),
    ]),
    onRender: invoke(componentFile.import(componentFile.qwikModule, 'qHook'), [
      onRenderFile.toQrl(componentName + '_onRender'),
    ]),
  };
  if (_opts.shareStyles) {
    if (_opts.isRoot) {
      const symbolName = componentName + '_styles';
      getCommonStyles(fileSet).symbolName = symbolName;
      qComponentOptions.unscopedStyles = onRenderFile.toQrl(symbolName);
    }
  } else {
    if (styles.size) {
      qComponentOptions.styles = onRenderFile.toQrl(componentName + '_styles');
      onRenderFile.exportConst(componentName + '_styles', renderStyles(styles));
    }
  }
  componentFile.exportConst(
    componentName,
    invoke(
      componentFile.import(componentFile.qwikModule, 'qComponent'),
      [qComponentOptions],
      ['any', 'any'],
    ),
  );

  onRenderFile.src.emit(NL);
  const directives: Map<string, string> = new Map();
  onRenderFile.exportConst(
    componentName + '_onRender',
    invoke(onRenderFile.import(onRenderFile.qwikModule, 'qHook'), [
      arrowFnBlock(
        ['__props__', '__state__'],
        [
          renderStateConst(onRenderFile),
          function(this: SrcBuilder) {
            return this.emit(
              'return ',
              renderJSXNodes(
                onRenderFile,
                directives,
                handlers,
                component.children,
                styles,
                {},
              ),
              ';',
            );
          },
        ],
      ),
    ]),
  );
  directives.forEach((code, name) => {
    fileSet.med.import(fileSet.med.qwikModule, 'h');
    fileSet.med.exportConst(name, code);
  });
}

function renderStateConst(file: File, isMount = false): any {
  return function(this: SrcBuilder) {
    return this.emit(
      'const state',
      WS,
      '=',
      WS,
      file.module == 'med'
        ? file.exports.get('__merge')
        : file.import('./med', '__merge').name,
      '(__state__,',
      WS,
      '__props__',
      isMount ? ',true);' : ');',
      NL,
    );
  };
}

export function addCommonStyles(fileSet: FileSet) {
  const { styles, symbolName } = getCommonStyles(fileSet);
  const onRenderFile = fileSet.low;
  if (symbolName) {
    onRenderFile.exportConst(symbolName, renderStyles(styles));
  }
}

function addComponentOnMount(
  componentFile: File,
  componentName: string,
  component: MitosisComponent,
) {
  componentFile.exportConst(componentName + '_onMount', function(
    this: SrcBuilder,
  ) {
    this.emit(
      invoke(
        componentFile.import(componentFile.qwikModule, 'qHook'),
        [
          arrowFnValue(['__props__'], () =>
            this.emit(
              '{',
              NL,
              INDENT,
              'const __state__',
              WS,
              '=',
              WS,
              componentFile.import(componentFile.qwikModule, 'qObject').name,
              '({});',
              NL,
              renderStateConst(componentFile, true),
              iif(component.hooks.onMount?.code),
              NL,
              'return state;',
              UNINDENT,
              NL,
              '}',
            ),
          ),
        ],
        ['any', 'any'],
      ),
    );
  });
}

declare const __STATE__: Record<string, Record<string, any>>;

function __merge(
  state: Record<string, any>,
  props: Record<string, any>,
  create = false,
) {
  for (const key in props) {
    if (
      key.indexOf(':') == -1 &&
      !key.startsWith('__') &&
      Object.prototype.hasOwnProperty.call(props, key)
    ) {
      state[key] = props[key];
    }
  }
  if (create && typeof __STATE__ == 'object' && props.serverStateId) {
    debugger;
    Object.assign(state, __STATE__[props.serverStateId]);
  }
  return state;
}
