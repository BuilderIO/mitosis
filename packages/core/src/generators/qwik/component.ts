import { MitosisComponent } from '@/types/mitosis-component';
import { MitosisNode } from '@/types/mitosis-node';
import {
  compileAwayBuilderComponentsFromTree,
  components as compileAwayComponents,
} from '../../plugins/compile-away-builder-components';
import { stringifySingleScopeOnMount } from '../helpers/on-mount';
import { DIRECTIVES } from './directives';
import { renderHandlers } from './helpers/handlers';
import { stableJSONserialize } from './helpers/stable-serialize';
import { CssStyles, collectStyles, renderStyles } from './helpers/styles';
import { renderJSXNodes } from './jsx';
import {
  EmitFn,
  File,
  SrcBuilder,
  SrcBuilderOptions,
  arrowFnValue,
  invoke,
  quote,
} from './src-generator';

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
  const extension = (opts.output == 'mjs' ? 'js' : opts.output) + (opts.jsx ? 'x' : '');
  const srcOptions: SrcBuilderOptions = {
    isPretty: !opts.minify,
    isModule: opts.output != 'cjs',
    isTypeScript: opts.output == 'ts',
    isJSX: opts.jsx,
    isBuilder: true,
  };
  const fileSet = {
    high: new File('high.' + extension, srcOptions, opts.qwikLib, opts.qrlPrefix),
    med: new File('med.' + extension, srcOptions, opts.qwikLib, opts.qrlPrefix),
    low: new File('low.' + extension, srcOptions, opts.qwikLib, opts.qrlPrefix),
  };
  Object.defineProperty(fileSet, 'CommonStyles', {
    enumerable: false,
    value: { styles: new Map<string, CssStyles>() as any, symbolName: null },
  });
  return fileSet;
}

function getCommonStyles(fileSet: FileSet): {
  styles: Map<string, CssStyles>;
  symbolName: string | null;
} {
  return (fileSet as any)['CommonStyles'];
}

export function addComponent(
  fileSet: FileSet,
  component: MitosisComponent,
  opts: { isRoot?: boolean; shareStyles?: boolean } = {},
) {
  const _opts = { isRoot: false, shareStyles: false, ...opts };
  compileAwayBuilderComponentsFromTree(component, {
    ...compileAwayComponents,
    // A set of components that should not be compiled away because they are implemented as runtime components.
    Image: undefined!,
    CoreButton: undefined!,
  });
  addBuilderBlockClass(component.children);
  const componentName = component.name;
  const handlers = renderHandlers(fileSet.high, componentName, component.children);
  // If the component has no handlers, than it is probably static
  // and so it is unlikely to be re-rendered on the client, therefore
  // put it in a low priority bucket.
  const isStatic = Array.from(handlers.keys()).reduce(
    (p, v) => p && v.indexOf('state') == -1,
    true,
  );
  const onRenderFile = isStatic ? fileSet.low : fileSet.med;
  const componentFile = fileSet.med;
  const styles = _opts.shareStyles ? getCommonStyles(fileSet).styles : new Map<string, CssStyles>();
  collectStyles(component.children, styles);
  let useStyles: EmitFn = () => null;
  if (styles.size) {
    if (_opts.shareStyles) {
      if (_opts.isRoot) {
        const symbolName = componentName + 'Styles';
        getCommonStyles(fileSet).symbolName = symbolName;
        useStyles = generateStyles(onRenderFile, fileSet.low, symbolName, false);
      }
    } else {
      const symbolName = componentName + 'Styles';
      onRenderFile.exportConst(symbolName, renderStyles(styles));
      useStyles = generateStyles(onRenderFile, onRenderFile, symbolName, true);
    }
  }
  if (component.meta.cssCode) {
    const symbolName = componentName + 'UsrStyles';
    onRenderFile.exportConst(symbolName, stableJSONserialize(component.meta.cssCode));
    useStyles = ((fns: EmitFn[]) =>
      function (this: SrcBuilder) {
        fns.forEach((fn) => fn.apply(this));
      })([useStyles, generateStyles(onRenderFile, onRenderFile, symbolName, false)]);
  }
  const directives: Map<string, string> = new Map();
  let rootChildren = component.children;
  addComponentOnMount(
    onRenderFile,
    function (this: SrcBuilder) {
      return this.emit(
        'return ',
        renderJSXNodes(onRenderFile, directives, handlers, rootChildren, styles, null, {}),
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
      [generateQrl(componentFile, onRenderFile, componentName + 'OnMount')],
      ['any', 'any'],
    ),
  );

  directives.forEach((code, name) => {
    fileSet.med.import(fileSet.med.qwikModule, 'h');
    fileSet.med.exportConst(name, code, true);
  });
  fileSet.low.exportConst('__proxyMerge__', DIRECTIVES['__proxyMerge__'], true);
  fileSet.med.exportConst('__proxyMerge__', DIRECTIVES['__proxyMerge__'], true);
  fileSet.high.exportConst('__proxyMerge__', DIRECTIVES['__proxyMerge__'], true);
}

function generateStyles(fromFile: File, dstFile: File, symbol: string, scoped: boolean): EmitFn {
  return function (this: SrcBuilder) {
    if (this.file.options.isPretty) {
      this.emit('\n\n');
    }
    this.emit(
      invoke(fromFile.import(fromFile.qwikModule, scoped ? 'useStylesScopedQrl' : 'useStylesQrl'), [
        generateQrl(fromFile, dstFile, symbol),
      ]),
      ';',
    );
    if (this.file.options.isPretty) {
      this.emit('\n\n');
    }
  };
}

function addBuilderBlockClass(children: MitosisNode[]) {
  children.forEach((child) => {
    const props = child.properties;
    if (props['builder-id']) {
      props.class = (props.class ? props.class + ' ' : '') + 'builder-block';
    }
  });
}

export function renderUseLexicalScope(file: File) {
  return function (this: SrcBuilder) {
    if (this.file.options.isBuilder) {
      return this.emit(
        'const [s,l]=',
        file.import(file.qwikModule, 'useLexicalScope').localName,
        '();',
        'const state=__proxyMerge__(s,l);',
      );
    } else {
      return this.emit(
        'const state=',
        file.import(file.qwikModule, 'useLexicalScope').localName,
        '()[0]',
      );
    }
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
          'if(!state.hasOwnProperty("',
          input.name,
          '"))state.',
          input.name,
          '=',
          stableJSONserialize(input.defaultValue),
          ';',
        );
    });
  }
  componentFile.exportConst(componentName + 'OnMount', function (this: SrcBuilder) {
    this.emit(
      arrowFnValue(['p'], () =>
        this.emit(
          '{',
          'const s=',
          componentFile.import(componentFile.qwikModule, 'useStore').localName,
          '(()=>{',
          'const state=Object.assign({},structuredClone(typeof __STATE__==="object"&&__STATE__[p.serverStateId]),p);',
          ...inputInitializer,
          inlineCode(stringifySingleScopeOnMount(component)),
          'return state;',
          '},{deep:true});',
          'const l={};',
          'const state=__proxyMerge__(s,l);',
          useStyles,
          onRenderEmit,
          ';}',
        ),
      ),
    );
  });
}

function inlineCode(code: string | undefined) {
  return function (this: SrcBuilder) {
    if (code) {
      // HACK: remove the return value as it is not the state we are creating.
      code = code
        .trim()
        .replace(/return main\(\);?$/, '')
        .trim();
      this.emit(code, ';');
    }
  };
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
