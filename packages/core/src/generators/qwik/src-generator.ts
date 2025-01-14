import parserTypeScript from 'prettier/parser-typescript';
import { format } from 'prettier/standalone';

import { checkIsEvent } from '@/helpers/event-handlers';
import { SELF_CLOSING_HTML_TAGS } from '../../constants/html_tags';
import { convertExportDefaultToReturn } from '../../parsers/builder';
import { stableJSONserialize } from './helpers/stable-serialize';
export interface SrcBuilderOptions {
  isPretty: boolean;
  isTypeScript: boolean;
  isModule: boolean;
  isJSX: boolean;
  isBuilder: boolean;
}

export type EmitFn = (this: SrcBuilder) => void;

export class File {
  filename: string;
  imports = new Imports();
  options: SrcBuilderOptions;
  src: SrcBuilder;
  qwikModule: string;
  qrlPrefix: string;
  exports: Map<string, string> = new Map();

  get module() {
    return this.filename.substr(0, this.filename.lastIndexOf('.'));
  }
  get path() {
    return this.filename;
  }
  get contents() {
    return this.toString();
  }

  constructor(filename: string, options: SrcBuilderOptions, qwikModule: string, qrlPrefix: string) {
    this.filename = filename;
    this.options = options;
    this.src = new SrcBuilder(this, this.options);
    this.qwikModule = qwikModule;
    this.qrlPrefix = qrlPrefix;
  }

  import(module: string, symbol: string, as?: string): Symbol {
    return this.imports.get(module, symbol, as);
  }

  toQrlChunk() {
    return quote(this.qrlPrefix + this.module + '.js');
  }

  exportConst(name: string, value?: any, locallyVisible = false) {
    if (this.exports.has(name)) return;
    this.exports.set(name, this.src.isModule ? name : 'exports.' + name);
    this.src.const(name, value, true, locallyVisible);
  }

  exportDefault(symbolName: any) {
    if (this.options.isPretty) {
      this.src.emit('\n\n');
    }
    if (this.options.isModule) {
      this.src.emit('export default ', symbolName, ';');
    } else {
      this.src.emit('module.exports=', symbolName, ';');
    }
  }

  toString() {
    const srcImports = new SrcBuilder(this, this.options);
    const imports = this.imports.imports;
    const modules = Array.from(imports.keys()).sort();
    modules.forEach((module) => {
      if (module == '<SELF>') return;
      const symbolMap = imports.get(module)!;
      const symbols = Array.from(symbolMap.values());
      symbols.sort(symbolSort);
      if (removeExt(module) !== removeExt(this.qrlPrefix + this.filename)) {
        srcImports.import(module, symbols);
      }
    });
    let source = srcImports.toString() + this.src.toString();
    if (this.options.isPretty) {
      try {
        source = format(source, {
          parser: 'typescript',
          plugins: [
            'prettier/parser-postcss',
            parserTypeScript,
            'prettier-plugin-organize-imports',
          ],
          htmlWhitespaceSensitivity: 'ignore',
        });
      } catch (e) {
        throw new Error(
          e +
            '\n' +
            '========================================================================\n' +
            source +
            '\n\n========================================================================',
        );
      }
    }
    return source;
  }
}

function symbolSort(a: Symbol, b: Symbol) {
  return a.importName < b.importName ? -1 : a.importName === b.importName ? 0 : 1;
}

function removeExt(filename: string): string {
  const indx = filename.lastIndexOf('.');
  return indx == -1 ? filename : filename.substr(0, indx);
}

export class SrcBuilder {
  file: File;
  isTypeScript: boolean;
  isModule: boolean;
  isJSX: boolean;

  buf: string[] = [];
  jsxDepth: number = 0;
  /**
   * Used to signal that we are generating code for Builder.
   *
   * In builder the `<For/>` iteration places the value on the state.
   */
  isBuilder: any = false;

  constructor(file: File, options: SrcBuilderOptions) {
    this.file = file;
    this.isTypeScript = options.isTypeScript;
    this.isModule = options.isModule;
    this.isJSX = options.isJSX;
    this.isBuilder = options.isBuilder;
  }

  import(module: string, symbols: Symbol[]) {
    if (this.isModule) {
      this.emit('import');
      if (symbols.length === 1 && symbols[0].importName === 'default') {
        this.emit(' ', symbols[0].localName, ' ');
      } else {
        this.emit('{');
        symbols.forEach((symbol) => {
          if (symbol.importName === symbol.localName) {
            this.emit(symbol.importName);
          } else {
            this.emit(symbol.importName, ' as ', symbol.localName);
          }
          this.emit(',');
        });
        this.emit('}');
      }
      this.emit('from', quote(module), ';');
    } else {
      symbols.forEach((symbol) => {
        this.const(symbol.localName, function (this: SrcBuilder) {
          this.emit(invoke('require', [quote(module)]));
          if (symbol.importName !== 'default') {
            this.emit('.', symbol.importName);
          }
        });
      });
    }
    if (this.file.options.isPretty) {
      this.emit('\n\n');
    }
    return this;
  }

  emit(...values: any[]) {
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      if (typeof value == 'function') {
        value.call(this);
      } else if (value === null) {
        this.push('null');
      } else if (value === undefined) {
        this.push('undefined');
      } else if (typeof value == 'string') {
        this.push(value);
      } else if (typeof value == 'number') {
        this.push(String(value));
      } else if (typeof value == 'boolean') {
        this.push(String(value));
      } else if (Array.isArray(value)) {
        this.emitList(value);
      } else if (typeof value == 'object') {
        this.emit('{');
        let separator = false;
        for (const key in value) {
          if (Object.prototype.hasOwnProperty.call(value, key)) {
            if (separator) {
              this.emit(',');
            }
            this.emit(possiblyQuotePropertyName(key)).emit(':', value[key]);
            separator = true;
          }
        }
        this.emit('}');
      } else {
        throw new Error('Unexpected value: ' + value);
      }
    }
    return this;
  }

  private push(value: string) {
    if (
      value.startsWith(')') ||
      value.startsWith(':') ||
      value.startsWith(']') ||
      value.startsWith('}') ||
      value.startsWith(',') ||
      value.startsWith('?')
    ) {
      // clear last ',' or ';';
      let index = this.buf.length - 1;
      let ch: string = this.buf[index];
      if (ch.endsWith(',') || ch.endsWith(';')) {
        ch = ch.substring(0, ch.length - 1);
        this.buf[index] = ch;
      }
    }
    this.buf.push(value);
  }

  emitList(values: any[], sep: string = ',') {
    let separator = false;
    for (const value of values) {
      if (separator) {
        this.emit(sep);
      }
      this.emit(value);
      separator = true;
    }
    return this;
  }

  const(name: string, value?: any, export_: boolean = false, locallyVisible: boolean = false) {
    if (export_) {
      this.emit(
        this.isModule
          ? 'export const '
          : (locallyVisible ? 'const ' + name + '=' : '') + 'exports.',
      );
    } else {
      this.emit('const ');
    }
    this.emit(name);
    if (value !== undefined) {
      this.emit('=', value);
    }
    this.emit(';');
    return this;
  }

  type(def: string) {
    if (this.isTypeScript) {
      this.emit(':', def);
    }
    return this;
  }

  typeParameters(typeParameters: string[] | undefined) {
    if (this.isTypeScript && typeParameters && typeParameters.length) {
      this.emit('<', typeParameters, '>');
    }
  }

  jsxExpression(expression: EmitFn) {
    const previousJsxDepth = this.jsxDepth;
    try {
      if (previousJsxDepth) {
        this.jsxDepth = 0;
        this.isJSX && this.emit('{');
      }
      expression.apply(this);
    } finally {
      if (previousJsxDepth) {
        this.isJSX && this.emit('}');
      }
      this.jsxDepth = previousJsxDepth;
    }
  }

  jsxBegin(symbol: Symbol | string, props: Record<string, any>, bindings: Record<string, any>) {
    this.jsxDepth++;
    const self = this;
    if (symbol == 'div' && ('href' in props || 'href' in bindings)) {
      // HACK: if we contain href then we are `a` not `div`
      symbol = 'a';
    }
    if (this.isJSX) {
      this.emit('<' + symbol);
    } else {
      this.emit('h(', literalTagName(symbol), ',{');
    }
    for (const key in props) {
      if (
        Object.prototype.hasOwnProperty.call(props, key) &&
        !ignoreKey(key) &&
        !Object.prototype.hasOwnProperty.call(bindings, key)
      ) {
        emitJsxProp(key, quote(props[key]));
      }
    }
    for (const rawKey in bindings) {
      if (bindings[rawKey].type === 'spread') {
        if (this.isJSX) {
          this.emit('{...', bindings[rawKey].code, '}');
        } else {
          this.emit('...', bindings[rawKey].code);
        }
      } else if (Object.prototype.hasOwnProperty.call(bindings, rawKey) && !ignoreKey(rawKey)) {
        let binding = bindings[rawKey];
        binding =
          binding && typeof binding == 'object' && 'code' in binding ? binding.code : binding;
        if (rawKey === 'class' && props.class) {
          // special case for classes as they can have both static and dynamic binding
          binding = quote(props.class + ' ') + '+' + binding;
        }
        let key = lastProperty(rawKey);
        if (isEvent(key)) {
          key = key + '$';
          binding = `${this.file.import(this.file.qwikModule, '$').localName}((event)=>${binding})`;
        } else if (!binding && rawKey in props) {
          binding = quote(props[rawKey]);
        } else if (binding != null && binding === props[key]) {
          // HACK: workaround for the fact that sometimes the `bindings` have string literals
          // We assume that when the binding content equals prop content.
          binding = quote(binding);
        } else if (typeof binding == 'string' && isStatement(binding)) {
          binding = iif(binding);
        }
        if (key === 'hide' || key === 'show') {
          let [truthy, falsy] = key == 'hide' ? ['"none"', '"inherit"'] : ['"inherit"', '"none"'];
          emitJsxProp('style', function (this: SrcBuilder) {
            this.emit('{display:', binding, '?', truthy, ':', falsy, '}');
          });
        } else {
          emitJsxProp(key, binding);
        }
      }
    }
    if (this.isJSX) {
      if (!this.isSelfClosingTag(symbol)) {
        this.emit('>');
      }
    } else {
      this.emit('},');
    }

    function emitJsxProp(key: string, value: any) {
      if (value) {
        if (key === 'innerHTML') key = 'dangerouslySetInnerHTML';
        if (key === 'dataSet') return; // ignore
        if (self.isJSX) {
          if (key.includes(':') && value === '""') {
            self.emit(' ', key);
            return;
          }
          self.emit(' ', key, '=');
          if (typeof value == 'string' && value.startsWith('"') && value.endsWith('"')) {
            self.emit(value);
          } else {
            self.emit('{', value, '}');
          }
        } else {
          self.emit(possiblyQuotePropertyName(key), ':', value, ',');
        }
      }
    }
  }

  isSelfClosingTag(symbol: Symbol | string) {
    return SELF_CLOSING_HTML_TAGS.has(String(symbol));
  }

  jsxEnd(symbol: Symbol | string) {
    if (this.isJSX) {
      if (this.isSelfClosingTag(symbol)) {
        this.emit(' />');
      } else {
        this.emit('</', symbol, '>');
      }
    } else {
      this.emit('),');
    }
    this.jsxDepth--;
  }

  jsxBeginFragment(symbol: Symbol) {
    this.jsxDepth++;
    if (this.isJSX) {
      this.emit('<>');
    } else {
      this.emit('h(', symbol.localName, ',null,');
    }
  }
  jsxEndFragment() {
    this.jsxDepth--;
    if (this.isJSX) {
      this.emit('</>');
    } else {
      this.emit(')');
    }
  }

  jsxTextBinding(exp: string) {
    if (this.isJSX) {
      this.emit('{', exp, '}');
    } else {
      this.emit(exp);
    }
  }

  toString() {
    return this.buf.join('');
  }
}

function isEvent(name: string): boolean {
  return checkIsEvent(name) && isUppercase(name.charAt(2)) && !name.endsWith('$');
}

function isUppercase(ch: string): boolean {
  return ch == ch.toUpperCase();
}

export class Symbol {
  importName: string;
  localName: string;
  constructor(importName: string, localName: string) {
    this.importName = importName;
    this.localName = localName;
  }
}

export class Imports {
  imports: Map<string, Map<string, Symbol>> = new Map();

  get(moduleName: string, symbolName: string, asVar?: string) {
    let importSymbols = this.imports.get(moduleName);
    if (!importSymbols) {
      importSymbols = new Map();
      this.imports.set(moduleName, importSymbols);
    }
    let symbol = importSymbols.get(symbolName);
    if (!symbol) {
      symbol = new Symbol(symbolName, asVar || symbolName);
      importSymbols.set(symbolName, symbol);
    }
    return symbol;
  }

  hasImport(localName: string): boolean {
    for (const symbolMap of Array.from(this.imports.values())) {
      for (const symbol of Array.from(symbolMap.values())) {
        if (symbol.localName === localName) {
          return true;
        }
      }
    }
    return false;
  }
}

function ignoreKey(key: string): boolean {
  return (
    key.startsWith('$') ||
    key.startsWith('_') ||
    key == 'code' ||
    key == '' ||
    key.indexOf('.') !== -1
  );
}

function possiblyQuotePropertyName(key: string): any {
  return /^\w[\w\d]*$/.test(key) ? key : quote(key);
}

export function quote(text: string) {
  const string = stableJSONserialize(text);
  // So \u2028 is a line separator character and prettier treats it as such
  // https://www.fileformat.info/info/unicode/char/2028/index.htm
  // That means it can't be inside of a string, so we replace it with `\\u2028`.
  // (see double `\\` vs `\`)
  const parts = string.split('\u2028');
  return parts.join('\\u2028');
}

export function invoke(symbol: Symbol | string, args: any[], typeParameters?: string[]) {
  return function (this: SrcBuilder) {
    this.emit(typeof symbol == 'string' ? symbol : symbol.localName);
    this.typeParameters(typeParameters);
    this.emit('(', args, ')');
  };
}

export function arrowFnBlock(args: string[], statements: any[], argTypes?: string[]) {
  return function (this: SrcBuilder) {
    this.emit('(');
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const type = argTypes && argTypes[i];
      this.emit(arg);
      if (type && this.file.options.isTypeScript) {
        this.emit(':', type);
      }
      this.emit(',');
    }
    this.emit(')=>{').emitList(statements, ';').emit('}');
  };
}

export function arrowFnValue(args: string[], expression: any) {
  return function (this: SrcBuilder) {
    this.emit('(', args, ')=>', expression);
  };
}

const _virtual_index = '_virtual_index;';
const return_virtual_index = 'return _virtual_index;';

export function iif(code: any) {
  if (!code) return;
  code = code.trim();
  if (code.endsWith(_virtual_index) && !code.endsWith(return_virtual_index)) {
    code = code.substr(0, code.length - _virtual_index.length) + return_virtual_index;
  }
  if (code.indexOf('export') !== -1) {
    code = convertExportDefaultToReturn(code);
  }
  return function (this: SrcBuilder) {
    code && this.emit('(()=>{', code, '})()');
  };
}

const LOWER_CASE = 'a'.charCodeAt(0) - 1;

function literalTagName(symbol: string | Symbol): string | Symbol {
  if (
    typeof symbol == 'string' &&
    symbol.charCodeAt(0) > LOWER_CASE &&
    symbol.indexOf('.') === -1
  ) {
    return quote(symbol);
  }
  return symbol;
}

/**
 * Returns `true` if the code is a statement (rather than expression).
 *
 * Code is an expression if it is a list of identifiers all connected with a valid separator
 * identifier: [a-z_$](a-z0-9_$)*
 * separator: [()[]{}.-+/*,]
 *
 * it is not 100% but a good enough approximation
 */
export function isStatement(code: string) {
  // remove trailing `!` as it is used to mark a non-null assertion in TS
  // it messes up the logic afterwards
  if (code.endsWith('!')) {
    code = code.substr(0, code.length - 1);
  }

  code = code.trim();
  if (
    (code.startsWith('(') && code.endsWith(')')) ||
    (code.startsWith('{') && code.endsWith('}'))
  ) {
    // Code starting with `(` is most likely an IFF and hence is an expression.
    return false;
  }
  const codeNoStrings = code.replace(STRING_LITERAL, 'STRING_LITERAL');
  const identifiers = codeNoStrings.split(EXPRESSION_SEPARATORS);
  const filteredIdentifiers = identifiers.filter((i) => {
    i = i.trim();
    return i && !i.match(EXPRESSION_IDENTIFIER);
  });
  return filteredIdentifiers.length !== 0;
}

// https://regexr.com/6cppf
const STRING_LITERAL = /(["'`])((\\{2})*|((\n|.)*?[^\\](\\{2})*))\1/g;

// https://regexr.com/6cpk4
const EXPRESSION_SEPARATORS = /[()\[\]{}.\?:\-+/*,|&]+/;

// https://regexr.com/6cpka
const EXPRESSION_IDENTIFIER = /^\s*[a-zA-Z0-9_$]+\s*$/;

export function lastProperty(expr: string): string {
  const parts = expr.split('.');
  return parts[parts.length - 1];
}

export function iteratorProperty(expr: string): string {
  return lastProperty(expr) + 'Item';
}
