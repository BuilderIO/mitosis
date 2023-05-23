import { format } from 'prettier/standalone';
import { convertTypeScriptToJS } from '../../helpers/babel-transform';
import { fastClone } from '../../helpers/fast-clone';
import { mergeOptions } from '../../helpers/merge-options';
import { CODE_PROCESSOR_PLUGIN } from '../../helpers/plugins/process-code';
import { replaceIdentifiers, replaceStateIdentifier } from '../../helpers/replace-identifiers';
import { checkHasState } from '../../helpers/state';
import { collectCss } from '../../helpers/styles/collect-css';
import {
  Plugin,
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../../modules/plugins';
import { MitosisComponent } from '../../types/mitosis-component';
import { BaseTranspilerOptions, TranspilerGenerator } from '../../types/transpiler';
import { addPreventDefault } from './helpers/add-prevent-default';
import { stableInject } from './helpers/stable-inject';
import { emitStateMethodsAndRewriteBindings, emitUseStore, StateInit } from './helpers/state';
import { renderJSXNodes } from './jsx';
import { arrowFnBlock, File, invoke, SrcBuilder } from './src-generator';

Error.stackTraceLimit = 9999;

const DEBUG = false;

export interface ToQwikOptions extends BaseTranspilerOptions {}

const PLUGINS: Plugin[] = [
  () => ({
    json: {
      post: (json) => {
        addPreventDefault(json);

        return json;
      },
    },
  }),
  CODE_PROCESSOR_PLUGIN((codeType, json) => {
    switch (codeType) {
      case 'bindings':
      case 'state':
      case 'hooks':
      case 'hooks-deps':
      case 'properties':
      case 'dynamic-jsx-elements':
        // update signal getters to have `.value`
        return (code, k) => {
          // `ref` should not update the signal value access
          if (k === 'ref') {
            return code;
          }
          Object.keys(json.refs).forEach((ref) => {
            code = replaceIdentifiers({
              code,
              from: ref,
              to: (x) => (x === ref ? `${x}.value` : `${ref}.value.${x}`),
            });
          });
          // update signal getters to have `.value`
          return replaceStateIdentifier((name) => {
            const state = json.state[name];
            switch (state?.type) {
              case 'getter':
                return `${name}.value`;

              case 'function':
              case 'method':
              case 'property':
              case undefined:
                return `state.${name}`;
            }
          })(code);
        };
    }
  }),
];

const DEFAULT_OPTIONS: ToQwikOptions = {
  plugins: PLUGINS,
};

export const componentToQwik: TranspilerGenerator<ToQwikOptions> =
  (userOptions = {}) =>
  ({ component: _component, path }): string => {
    // Make a copy we can safely mutate, similar to babel's toolchain
    let component = fastClone(_component);

    const options = mergeOptions(DEFAULT_OPTIONS, userOptions);

    component = runPreJsonPlugins(component, options.plugins);
    component = runPostJsonPlugins(component, options.plugins);

    const isTypeScript = !!options.typescript;
    const file = new File(
      component.name + (isTypeScript ? '.ts' : '.js'),
      {
        isPretty: true,
        isJSX: true,
        isTypeScript: isTypeScript,
        isModule: true,
        isBuilder: false,
      },
      '@builder.io/qwik',
      '',
    );
    try {
      emitImports(file, component);
      emitTypes(file, component);
      emitExports(file, component);
      const metadata: Record<string, any> = component.meta.useMetadata || ({} as any);
      const isLightComponent: boolean = metadata?.qwik?.component?.isLight || false;
      const mutable: string[] = metadata?.qwik?.mutable || [];

      const imports: Record<string, string> = metadata?.qwik?.imports || {};
      Object.keys(imports).forEach((key) => file.import(imports[key], key));

      const state: StateInit = emitStateMethodsAndRewriteBindings(file, component, metadata);
      const hasState = checkHasState(component);

      let css: string | null = null;

      const componentFn = arrowFnBlock(
        ['props'],
        [
          function (this: SrcBuilder) {
            css = emitUseStyles(file, component);
            emitUseContext(file, component);
            emitUseRef(file, component);
            hasState &&
              emitUseStore({ file, stateInit: state, isDeep: metadata?.qwik?.hasDeepStore });
            emitUseComputed(file, component);
            emitUseContextProvider(file, component);
            emitUseClientEffect(file, component);
            emitUseMount(file, component);
            emitUseTask(file, component);

            emitJSX(file, component, mutable);
          },
        ],
        [(component.propsTypeRef || 'any') + (isLightComponent ? '&{key?:any}' : '')],
      );
      file.src.const(
        component.name,
        isLightComponent
          ? componentFn
          : invoke(file.import(file.qwikModule, 'component$'), [componentFn]),
        true,
        true,
      );
      file.exportDefault(component.name);
      emitStyles(file, css);
      DEBUG && file.exportConst('COMPONENT', JSON.stringify(component));
      let sourceFile = file.toString();
      sourceFile = runPreCodePlugins(sourceFile, options.plugins);
      sourceFile = runPostCodePlugins(sourceFile, options.plugins);
      return sourceFile;
    } catch (e) {
      console.error(e);
      return (e as Error).stack || String(e);
    }
  };

function emitExports(file: File, component: MitosisComponent) {
  Object.keys(component.exports || {}).forEach((key) => {
    const exportObj = component.exports![key]!;
    const code = exportObj.code.startsWith('export ') ? exportObj.code : `export ${exportObj.code}`;
    file.src.emit(code);
  });
}

function emitUseClientEffect(file: File, component: MitosisComponent) {
  if (component.hooks.onMount) {
    // This is called useMount, but in practice it is used as
    // useClientEffect. Not sure if this is correct, but for now.
    const code = component.hooks.onMount.code;
    file.src.emit(file.import(file.qwikModule, 'useVisibleTask$').localName, '(()=>{', code, '});');
  }
}

function emitUseMount(file: File, component: MitosisComponent) {
  if (component.hooks.onInit) {
    const code = component.hooks.onInit.code;
    file.src.emit(file.import(file.qwikModule, 'useTask$').localName, '(()=>{', code, '});');
  }
}

function emitUseTask(file: File, component: MitosisComponent) {
  if (component.hooks.onUpdate) {
    component.hooks.onUpdate.forEach((onUpdate) => {
      file.src.emit(file.import(file.qwikModule, 'useTask$').localName, '(({track})=>{');
      emitTrackExpressions(file.src, onUpdate.deps);
      file.src.emit(convertTypeScriptToJS(onUpdate.code));
      file.src.emit('});');
    });
  }
}

function emitTrackExpressions(src: SrcBuilder, deps?: string) {
  if (!deps) {
    return;
  }

  const dependencies = deps.substring(1, deps.length - 1).split(',');
  dependencies.forEach((dep) => {
    src.emit(`track(() => ${dep});`);
  });
}

function emitJSX(file: File, component: MitosisComponent, mutable: string[]) {
  const directives = new Map();
  const handlers = new Map<string, string>();
  const styles = new Map();
  const parentSymbolBindings = {};
  if (file.options.isPretty) {
    file.src.emit('\n\n');
  }
  file.src.emit(
    'return ',
    renderJSXNodes(
      file,
      directives,
      handlers,
      component.children,
      styles,
      null,
      parentSymbolBindings,
    ),
  );
}

function emitUseContextProvider(file: File, component: MitosisComponent) {
  Object.entries(component.context.set).forEach(([_ctxKey, context]) => {
    file.src.emit(`
      ${file.import(file.qwikModule, 'useContextProvider').localName}(
        ${context.name}, ${file.import(file.qwikModule, 'useStore').localName}({
      `);

    for (const [prop, propValue] of Object.entries(context.value || {})) {
      file.src.emit(`${prop}: `);
      switch (propValue?.type) {
        case 'getter':
          file.src.emit(`(()=>{
            ${extractGetterBody(propValue.code)}
          })()`);
          break;

        case 'function':
        case 'method':
          throw new Error('Qwik: Functions are not supported in context');

        case 'property':
          file.src.emit(stableInject(propValue.code));
          break;
      }
      file.src.emit(',');
    }
    file.src.emit('}));');
  });
}

function emitUseContext(file: File, component: MitosisComponent) {
  Object.keys(component.context.get).forEach((ctxKey) => {
    const context = component.context.get[ctxKey];
    file.src.emit(
      'const ',
      ctxKey,
      '=',
      file.import(file.qwikModule, 'useContext').localName,
      '(',
      context.name,
      ');',
    );
  });
}

function emitUseRef(file: File, component: MitosisComponent) {
  Object.keys(component.refs).forEach((refKey) => {
    file.src.emit(
      `const `,
      refKey,
      '=',
      file.import(file.qwikModule, 'useSignal').localName,
      `${file.options.isTypeScript ? '<Element>' : ''}();`,
    );
  });
}

function emitUseStyles(file: File, component: MitosisComponent): string {
  const css = collectCss(component, { prefix: component.name });
  if (css) {
    file.src.emit(file.import(file.qwikModule, 'useStylesScoped$').localName, '(STYLES);');
    if (file.options.isPretty) {
      file.src.emit('\n\n');
    }
  }
  return css;
}

function emitStyles(file: File, css: string | null) {
  if (!css) {
    return;
  }

  if (file.options.isPretty) {
    file.src.emit('\n\n');
    try {
      css = format(css, {
        parser: 'css',
        plugins: [
          // To support running in browsers
          require('prettier/parser-postcss'),
        ],
      });
    } catch (e) {
      throw new Error(
        e +
          '\n' +
          '========================================================================\n' +
          css +
          '\n\n========================================================================',
      );
    }
  }
  file.exportConst('STYLES', '`\n' + css.replace(/`/g, '\\`') + '`\n');
}

function emitTypes(file: File, component: MitosisComponent) {
  if (file.options.isTypeScript) {
    component.types?.forEach((t) => file.src.emit(t, '\n'));
  }
}

function emitImports(file: File, component: MitosisComponent) {
  // <SELF> is used for self-referencing within the file.
  file.import('<SELF>', component.name);
  component.imports?.forEach((i) => {
    Object.keys(i.imports).forEach((key) => {
      const keyValue = i.imports[key]!;
      file.import(i.path.replace('.lite', '').replace('.tsx', ''), keyValue, key);
    });
  });
}

function extractGetterBody(code: string): string {
  const start = code.indexOf('{');
  const end = code.lastIndexOf('}');
  return code.substring(start + 1, end).trim();
}

function emitUseComputed(file: File, component: MitosisComponent) {
  for (const [key, stateValue] of Object.entries(component.state)) {
    switch (stateValue?.type) {
      case 'getter':
        file.src.const(`
          ${key} = ${file.import(file.qwikModule, 'useComputed$').localName}(() => {
            ${extractGetterBody(stateValue.code)}
          })
        `);
        continue;
    }
  }
}
