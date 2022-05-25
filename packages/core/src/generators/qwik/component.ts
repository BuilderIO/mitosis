import {
  compileAwayBuilderComponentsFromTree,
  components as compileAwayComponents,
} from '../../plugins/compile-away-builder-components';
import { MitosisComponent } from '../../types/mitosis-component';
import { renderHandlers } from './handlers';
import { renderJSXNodes } from './jsx';
import {
  arrowFnBlock,
  arrowFnValue,
  EmitFn,
  File,
  iif,
  invoke,
  quote,
  SrcBuilder,
  SrcBuilderOptions,
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
  return fileSet;
}

function getCommonStyles(fileSet: FileSet): {
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
  const styles = _opts.shareStyles
    ? getCommonStyles(fileSet).styles
    : new Map<string, CssStyles>();
  collectStyles(component.children, styles);
  let useStyles: EmitFn = () => null;
  if (_opts.shareStyles) {
    if (_opts.isRoot) {
      const symbolName = componentName + '_styles';
      getCommonStyles(fileSet).symbolName = symbolName;
      useStyles = generateStyles(onRenderFile, fileSet.low, symbolName, false);
    }
  } else {
    if (styles.size) {
      const symbolName = componentName + '_styles';
      onRenderFile.exportConst(symbolName, renderStyles(styles));
      useStyles = generateStyles(onRenderFile, onRenderFile, symbolName, true);
    }
  }
  const directives: Map<string, string> = new Map();
  addComponentOnMount(
    onRenderFile,
    function (this: SrcBuilder) {
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
    componentName,
    component,
    useStyles,
  );
  componentFile.exportConst(
    componentName,
    invoke(
      componentFile.import(componentFile.qwikModule, 'componentQrl'),
      [generateQrl(componentFile, onRenderFile, componentName + '_onMount')],
      ['any', 'any'],
    ),
  );

  directives.forEach((code, name) => {
    fileSet.med.import(fileSet.med.qwikModule, 'h');
    fileSet.med.exportConst(name, code, true);
  });
}

function generateStyles(
  fromFile: File,
  dstFile: File,
  symbol: string,
  scoped: boolean,
): EmitFn {
  return function (this: SrcBuilder) {
    this.emit(
      invoke(
        fromFile.import(
          fromFile.qwikModule,
          scoped ? 'withScopedStylesQrl' : 'useStylesQrl',
        ),
        [generateQrl(fromFile, dstFile, symbol)],
      ),
      ';',
    );
  };
}

export function renderUseLexicalScope(file: File) {
  return function (this: SrcBuilder) {
    return this.emit(
      'const state=',
      file.import(file.qwikModule, 'useLexicalScope').name,
      '()[0]',
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
  onRenderEmit: EmitFn,
  componentName: string,
  component: MitosisComponent,
  useStyles: EmitFn,
) {
  const inputInitializer: any[] = [];
  if (component.inputs) {
    component.inputs.forEach((input) => {
      input.defaultValue !== undefined &&
        inputInitializer.push(
          'if(state.',
          input.name,
          '===undefined)state.',
          input.name,
          '=',
          JSON.stringify(input.defaultValue),
          ';',
        );
    });
  }
  componentFile.exportConst(
    componentName + '_onMount',
    function (this: SrcBuilder) {
      this.emit(
        arrowFnValue(['state'], () =>
          this.emit(
            '{',
            'if(!state.__INIT__){',
            'state.__INIT__=true;',
            ...inputInitializer,
            'typeof __STATE__==="object"&&Object.assign(state,__STATE__[state.serverStateId]);',
            iif(component.hooks.onMount?.code),
            '}',
            useStyles,
            onRenderEmit,
            ';}',
          ),
        ),
      );
    },
  );
}

function generateQrl(
  fromFile: File,
  dstFile: File,
  componentName: string,
  capture: string[] = [],
): any {
  return invoke(fromFile.import(fromFile.qwikModule, 'qrl'), [
    dstFile.toQrlChunk(),
    quote(componentName),
    `[${capture.join(',')}]`,
  ]);
}
