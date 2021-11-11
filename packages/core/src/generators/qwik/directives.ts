import { MitosisNode } from '../../types/mitosis-node';
import { INDENT, SrcBuilder, NL, WS, UNINDENT } from './src-generator';

export const DIRECTIVES: Record<
  string,
  (node: MitosisNode, blockFn: () => void) => void
> = {
  Show: (node: MitosisNode, blockFn: () => void) =>
    function(this: SrcBuilder) {
      const expr = node.bindings.when;
      if (this.isJSX) {
        this.emit('{', WS, INDENT, expr, WS, '?', NL);
      } else {
        this.emit(expr, WS, '?', INDENT, NL);
      }
      blockFn();
      if (this.isJSX) {
        this.emit(':', WS, 'null', UNINDENT, NL, '}', NL);
      } else {
        this.emit(':', WS, 'null', UNINDENT, NL);
      }
    },
};
