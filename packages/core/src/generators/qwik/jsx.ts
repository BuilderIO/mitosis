import { isMitosisNode } from '../../helpers/is-mitosis-node';
import { MitosisNode } from '../../types/mitosis-node';
import { DIRECTIVES } from './directives';
import { File, invoke, SrcBuilder, quote, lastProperty } from './src-generator';
import { CssStyles } from './styles';

/**
 * Convert a Mitosis nodes to a JSX nodes.
 *
 * @param file File into which the output will be written to.
 * @param directives Store for directives which we came across so that they can be imported.
 * @param handlers A set of handlers which we came across so that they can be rendered
 * @param children A list of children to convert to JSX
 * @param styles Store for styles which we came across so that they can be rendered.
 * @param parentSymbolBindings A set of bindings from parent to be written into the child.
 * @param root True if this is the root JSX, and may need a Fragment wrapper.
 * @returns
 */
export function renderJSXNodes(
  file: File,
  directives: Map<string, string>,
  handlers: Map<string, string>,
  children: MitosisNode[],
  styles: Map<string, CssStyles>,
  parentSymbolBindings: Record<string, string>,
  root = true,
): any {
  return function (this: SrcBuilder) {
    if (children.length == 0) return;
    if (root) this.emit('(');
    const needsFragment =
      root && (children.length > 1 || (children.length && isInlinedDirective(children[0])));
    file.import(file.qwikModule, 'h');
    const fragmentSymbol = file.import(file.qwikModule, 'Fragment');
    if (needsFragment) {
      this.jsxBeginFragment(fragmentSymbol);
    }
    children.forEach((child) => {
      if (isEmptyTextNode(child)) return;
      if (isTextNode(child)) {
        this.isJSX
          ? this.emit(child.properties._text)
          : this.jsxTextBinding(quote(child.properties._text!));
      } else if (isSlotProjection(child)) {
        this.file.import(this.file.qwikModule, 'Slot');
        this.jsxBegin('Slot', {}, {});
        this.jsxEnd('Slot');
      } else {
        let childName = child.name;
        const directive = DIRECTIVES[childName];
        if (typeof directive == 'function') {
          this.emit(
            directive(child, () => {
              let children = child.children.filter((c) => !isEmptyTextNode(c));
              const childNeedsFragment =
                children.length > 1 || (children.length && isTextNode(children[0]));
              childNeedsFragment && this.jsxBeginFragment(fragmentSymbol);
              if (childNeedsFragment && children.length == 1) debugger;
              renderJSXNodes(file, directives, handlers, children, styles, {}, false).call(this);
              childNeedsFragment && this.jsxEndFragment();
            }),
          );
          !this.isJSX && this.emit(',');
        } else {
          if (typeof directive == 'string') {
            directives.set(childName, directive);
            Array.from(directive.matchAll(/(__[^_]+__)/g)).forEach((match) => {
              const name = match[0];
              const code = DIRECTIVES[name];
              typeof code == 'string' && directives.set(name, code);
            });
            if (file.module !== 'med' && file.imports.hasImport(childName)) {
              file.import('./med.js', childName);
            }
          }
          if (isSymbol(childName)) {
            // TODO(misko): We are hard coding './med.js' which is not right.
            !file.imports.hasImport(childName) && file.import('./med.js', childName);
            let exportedChildName = file.exports.get(childName);
            if (exportedChildName) {
              childName = exportedChildName;
            }
          }
          let props: Record<string, any> = child.properties;
          const css = child.bindings.css?.code;
          const specialBindings: Record<string, any> = {};
          if (css) {
            props = { ...props };
            const styleProps = styles.get(css)!;
            const imageMaxWidth = childName == 'Image' && styleProps.maxWidth;
            if (imageMaxWidth && imageMaxWidth.endsWith('px')) {
              // special case for Images. We want to make sure that we include the maxWidth in a srcset
              specialBindings.srcsetSizes = Number.parseInt(imageMaxWidth);
            }
            if (styleProps?.CLASS_NAME) {
              props.class = addClass(styleProps.CLASS_NAME, props.class);
            }
          }
          const symbolBindings: Record<string, string> = {};
          const bindings = rewriteHandlers(file, handlers, child.bindings, symbolBindings);
          this.jsxBegin(childName, props, {
            ...bindings,
            ...parentSymbolBindings,
            ...specialBindings,
          });
          renderJSXNodes(
            file,
            directives,
            handlers,
            child.children,
            styles,
            symbolBindings,
            false,
          ).call(this);
          this.jsxEnd(childName);
        }
      }
    });
    if (needsFragment) {
      this.jsxEndFragment();
    }
    if (root) this.emit(')');
  };
}

function isSymbol(name: string): boolean {
  return name.charAt(0) == name.charAt(0).toUpperCase();
}

function addClass(className: string, existingClass: string | undefined): string {
  return [className, ...(existingClass ? existingClass.split(' ') : [])].join(' ');
}

function isEmptyTextNode(child: MitosisNode) {
  return child.properties._text?.trim() == '';
}

function isTextNode(child: MitosisNode) {
  if (child.properties._text !== undefined) {
    return true;
  }
  const code = child.bindings._text?.code;
  if (code !== undefined && code !== 'props.children') {
    return true;
  }
  return false;
}

function isSlotProjection(child: MitosisNode) {
  return child.bindings._text?.code === 'props.children';
}

/**
 * Rewrites bindings:
 * - Remove `css`
 * - Rewrites event handles
 * - Extracts symbol bindings.
 *
 * @param file
 * @param handlers
 * @param bindings
 * @param symbolBindings Options record which will receive the symbol bindings
 * @returns
 */
function rewriteHandlers(
  file: File,
  handlers: Map<string, string>,
  bindings: {
    [key: string]: { code: string; arguments?: string[] } | undefined;
  },
  symbolBindings: Record<string, string>,
): { [key: string]: { code: string; arguments?: string[] } } {
  const outBindings: { [key: string]: { code: string; arguments?: string[] } } = {};
  for (let key in bindings) {
    if (Object.prototype.hasOwnProperty.call(bindings, key)) {
      let { code: binding } = bindings[key]!;
      let handlerBlock: string | undefined;
      if (binding != null) {
        if (key == 'css') {
          continue;
        } else if ((handlerBlock = handlers.get(binding))) {
          key = `${key}Qrl`;
          binding = invoke(file.import(file.qwikModule, 'qrl'), [
            quote(file.qrlPrefix + 'high.js'),
            quote(handlerBlock),
            '[state]',
          ]) as any;
        } else if (symbolBindings && key.startsWith('symbol.data.')) {
          symbolBindings[lastProperty(key)] = binding;
        }
        outBindings[key] = { code: binding as string };
      }
    }
  }
  return outBindings;
}

function isInlinedDirective(node: MitosisNode) {
  return (isMitosisNode(node) && node.name == 'Show') || node.name == 'For';
}
