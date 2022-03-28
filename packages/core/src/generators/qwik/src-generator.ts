import { format } from 'prettier/standalone';
export interface SrcBuilderOptions {
  isPretty: boolean;
  isTypeScript: boolean;
  isModule: boolean;
  isJSX: boolean;
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

  constructor(
    filename: string,
    options: SrcBuilderOptions,
    qwikModule: string,
    qrlPrefix: string,
  ) {
    this.filename = filename;
    this.options = options;
    this.src = new SrcBuilder(this.options);
    this.qwikModule = qwikModule;
    this.qrlPrefix = qrlPrefix;
  }

  import(module: string, symbol: string): Symbol {
    return this.imports.get(module, symbol);
  }

  toQrlChunk() {
    return quote(this.qrlPrefix + this.module + '.js');
  }

  exportConst(name: string, value?: any, locallyVisible = false) {
    if (this.exports.has(name)) return;
    this.exports.set(name, this.src.isModule ? name : 'exports.' + name);
    this.src.const(name, value, true, locallyVisible);
  }

  toString() {
    const srcImports = new SrcBuilder(this.options);
    const imports = this.imports.imports;
    const modules = Array.from(imports.keys()).sort();
    modules.forEach((module) => {
      const symbolMap = imports.get(module)!;
      const symbols = Array.from(symbolMap.keys()).sort();
      if (removeExt(module) !== removeExt(this.qrlPrefix + this.filename)) {
        srcImports.import(module, symbols);
      }
    });
    let source = srcImports.toString() + this.src.toString();
    if (this.options.isPretty) {
      source = format(source, {
        parser: 'typescript',
        plugins: [
          // To support running in browsers
          require('prettier/parser-typescript'),
          require('prettier/parser-postcss'),
          require('prettier/parser-html'),
          require('prettier/parser-babel'),
        ],
        htmlWhitespaceSensitivity: 'ignore',
      });
    }
    return source;
  }
}

function removeExt(filename: string): string {
  const indx = filename.lastIndexOf('.');
  return indx == -1 ? filename : filename.substr(0, indx);
}

const spaces: string[] = [''];

export class SrcBuilder {
  isTypeScript: boolean;
  isModule: boolean;
  isJSX: boolean;

  buf: string[] = [];

  constructor(options: SrcBuilderOptions) {
    this.isTypeScript = options.isTypeScript;
    this.isModule = options.isModule;
    this.isJSX = options.isJSX;
  }

  import(module: string, symbols: string[]) {
    if (this.isModule) {
      this.emit('import{', symbols, '}from', quote(module), ';');
    } else {
      symbols.forEach((symbol) => {
        this.const(symbol, function (this: SrcBuilder) {
          this.emit(invoke('require', [quote(module)]), '.', symbol);
        });
      });
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
      value.startsWith('}')
    ) {
      // clear last ',';
      let index = this.buf.length - 1;
      let ch: string = this.buf[index];
      if (ch.endsWith(',')) {
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

  const(
    name: string,
    value?: any,
    export_: boolean = false,
    locallyVisible: boolean = false,
  ) {
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

  jsxBegin(
    symbol: Symbol | string,
    props: Record<string, any>,
    bindings: Record<string, any>,
  ) {
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
        this.isJSX
          ? this.emit(' ', key)
          : this.emit(possiblyQuotePropertyName(key));
        this.isJSX ? this.emit('=') : this.emit(':');
        this.emit(quote(props[key]));
        !this.isJSX && this.emit(',');
      }
    }
    for (const rawKey in bindings) {
      if (
        Object.prototype.hasOwnProperty.call(bindings, rawKey) &&
        !ignoreKey(rawKey)
      ) {
        let binding = bindings[rawKey];
        const key = lastProperty(rawKey);
        this.isJSX
          ? this.emit(' ', key)
          : this.emit(possiblyQuotePropertyName(key));
        this.isJSX ? this.emit('={') : this.emit(':');
        if (binding === props[key]) {
          // HACK: workaround for the fact that sometimes the `bindings` have string literals
          // We assume that when the binding content equals prop content.
          binding = JSON.stringify(binding);
        } else if (typeof binding == 'string' && isStatement(binding)) {
          binding = iif(binding);
        }
        this.emit(binding);
        this.isJSX ? this.emit('}') : this.emit(',');
      }
    }
    if (this.isJSX) {
      this.emit('>');
    } else {
      this.emit('},');
    }
  }

  jsxEnd(symbol: Symbol | string) {
    if (this.isJSX) {
      this.emit('</', symbol, '>');
    } else {
      this.emit('),');
    }
  }

  jsxBeginFragment(symbol: Symbol) {
    if (this.isJSX) {
      this.emit('<>');
    } else {
      this.emit('h(', symbol.name, ',null,');
    }
  }
  jsxEndFragment() {
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

export class Symbol {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

export class Imports {
  imports: Map<string, Map<string, Symbol>> = new Map();

  get(moduleName: string, symbolName: string) {
    let importSymbols = this.imports.get(moduleName);
    if (!importSymbols) {
      importSymbols = new Map();
      this.imports.set(moduleName, importSymbols);
    }
    let symbol = importSymbols.get(symbolName);
    if (!symbol) {
      symbol = new Symbol(symbolName);
      importSymbols.set(symbolName, symbol);
    }
    return symbol;
  }
}

function ignoreKey(key: string): boolean {
  return (
    key.startsWith('$') ||
    key.startsWith('_') ||
    key == 'code' ||
    key == '' ||
    key == 'builder-id' ||
    key.indexOf('.') !== -1
  );
}

export class Block {
  imports: Imports;
  constructor(imports: Imports) {
    this.imports = imports;
  }
}

function possiblyQuotePropertyName(key: string): any {
  return /^\w[\w\d]*$/.test(key) ? key : JSON.stringify(key);
}

export function quote(text: string) {
  return JSON.stringify(text);
}

export function invoke(
  symbol: Symbol | string,
  args: any[],
  typeParameters?: string[],
) {
  return function (this: SrcBuilder) {
    this.emit(typeof symbol == 'string' ? symbol : symbol.name);
    this.typeParameters(typeParameters);
    this.emit('(', args, ')');
  };
}

export function arrowFnBlock(args: string[], statements: any[]) {
  return function (this: SrcBuilder) {
    this.emit('(', args, ')=>{').emitList(statements, ';').emit('}');
  };
}

export function arrowFnValue(args: string[], expression: any) {
  return function (this: SrcBuilder) {
    this.emit('(', args, ')=>', expression);
  };
}

export function iif(code: any) {
  return function (this: SrcBuilder) {
    code && this.emit('(()=>{', code, '})();');
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
  code = code.trim();
  if (code.startsWith('(') || code.startsWith('{') || code.endsWith('}')) {
    // Code starting with `(` is most likely and IFF and hence is an expression.
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
const EXPRESSION_SEPARATORS = /[()\[\]{}.\?:\-+/*,]+/;

// https://regexr.com/6cpka
const EXPRESSION_IDENTIFIER = /^\s*[a-zA-Z0-9_$]+\s*$/;

export function lastProperty(expr: string): string {
  const parts = expr.split('.');
  return parts[parts.length - 1];
}

export function iteratorProperty(expr: string): string {
  return lastProperty(expr) + 'Item';
}
