import { MitosisNode } from '../../types/mitosis-node';
import { DIRECTIVES } from './directives';
import {
  File,
  INDENT,
  invoke,
  NL,
  SrcBuilder,
  quote,
  UNINDENT,
} from './src-generator';
import { CssStyles } from './styles';

export function renderJSXNodes(
  file: File,
  handlers: Map<string, string>,
  children: MitosisNode[],
  styles: Map<string, CssStyles>,
  root = true,
): any {
  return function(this: SrcBuilder) {
    if (children.length == 0) return;
    if (root) this.emit('(', INDENT, NL);
    const needsFragment = root && children.length > 1;
    file.import(file.qwikModule, 'h');
    if (needsFragment) {
      file.import(file.qwikModule, 'Fragment');
      this.jsxBeginFragment(file.import(file.qwikModule, 'Fragment'));
    }
    children.forEach((child) => {
      if (isEmptyTextNode(child)) return;
      if (isTextNode(child)) {
        if (child.bindings._text !== undefined) {
          this.jsxTextBinding(child.bindings._text);
        } else {
          this.isJSX
            ? this.emit(child.properties._text)
            : this.jsxTextBinding(quote(child.properties._text!));
        }
      } else {
        let childName = child.name;
        const directive = DIRECTIVES[childName];
        if (typeof directive == 'function') {
          this.emit(
            directive(child, () =>
              renderJSXNodes(
                file,
                handlers,
                child.children,
                styles,
                false,
              ).call(this),
            ),
          );
        } else {
          if (isSymbol(childName)) {
            // TODO(misko): We are hard coding './med.js' which is not right.
            file.import('./med.js', childName);
            let exportedChildName = file.exports.get(childName);
            if (exportedChildName) {
              childName = exportedChildName;
            }
          }
          let props: Record<string, any> = child.properties;
          const css = child.bindings.css;
          if (css) {
            props = { ...props };
            props.class = addClass(styles.get(css)!.CLASS_NAME, props.class);
          }
          this.jsxBegin(
            childName,
            props,
            rewriteHandlers(file, handlers, child.bindings),
          );
          renderJSXNodes(file, handlers, child.children, styles, false).call(
            this,
          );
          this.jsxEnd(childName);
        }
      }
    });
    if (needsFragment) {
      this.jsxEndFragment();
    }
    if (root) this.emit(UNINDENT, ')');
  };
}

function isSymbol(name: string): boolean {
  return name.charAt(0) == name.charAt(0).toUpperCase();
}

function addClass(
  className: string,
  existingClass: string | undefined,
): string {
  return [className, ...(existingClass ? existingClass.split(' ') : [])].join(
    ' ',
  );
}

function isEmptyTextNode(child: MitosisNode) {
  return child.properties._text?.trim() == '';
}

function isTextNode(child: MitosisNode) {
  return (
    child.properties._text !== undefined || child.bindings._text !== undefined
  );
}

function rewriteHandlers(
  file: File,
  handlers: Map<string, string>,
  bindings: Record<string, string | undefined>,
): Record<string, string> {
  const outBindings: Record<string, string> = {};
  for (let key in bindings) {
    if (Object.prototype.hasOwnProperty.call(bindings, key)) {
      let binding: any = bindings[key]!;
      let handlerBlock: string | undefined;
      if (binding != null) {
        if (key == 'css') {
          continue;
        } else if ((handlerBlock = handlers.get(binding))) {
          key = `on:${key.substr(2).toLowerCase()}`;
          binding = invoke(file.import(file.qwikModule, 'qHook'), [
            quote(file.qrlPrefix + 'high#' + handlerBlock),
          ]);
        }
        outBindings[key] = binding;
      }
    }
  }
  return outBindings;
}
