import { MitosisNode } from '../../types/mitosis-node';
import { INDENT, SrcBuilder, NL, WS, UNINDENT } from './src-generator';

export const DIRECTIVES: Record<
  string,
  (node: MitosisNode, blockFn: () => void) => void
> = {
  Show: (node: MitosisNode, blockFn: () => void) =>
    function(this: SrcBuilder) {
      const expr = node.bindings.when;
      this.isJSX && this.emit('{', WS);
      this.emit(expr, WS, '?', INDENT, NL);
      blockFn();
      this.emit(':', WS, 'null', UNINDENT, NL);
      this.isJSX && this.emit('}', NL);
    },
  For: (node: MitosisNode, blockFn: () => void) =>
    function(this: SrcBuilder) {
      const expr = node.bindings.each;
      this.isJSX && this.emit('{', WS);
      this.emit('(', expr, WS, '||', WS, '[])');
      this.emit('.forEach(', '()', WS, '=>', WS, '(', INDENT, NL);
      blockFn();
      this.emit(UNINDENT, ')', ')', NL);
      this.isJSX && this.emit('}', NL);
    },
};
