import { MitosisComponent } from '../../../types/mitosis-component';
import { MitosisNode } from '../../../types/mitosis-node';

export type CodeType =
  | 'hooks'
  | 'hooks-deps'
  | 'hooks-deps-array'
  | 'bindings'
  | 'properties'
  | 'state'
  | 'types'
  | 'context-set'
  // this is for when we write dynamic JSX elements like `<state.foo>Hello</state.foo>` in Mitosis
  | 'dynamic-jsx-elements';

// declare function codeProcessor<T extends CodeType>(
//   codeType: T,
//   json: MitosisComponent,
// ): (code: string, hookType: T extends 'hooks' ? keyof MitosisComponent['hooks'] : string) => string;
declare function codeProcessor(
  codeType: CodeType,
  json: MitosisComponent,
  node?: MitosisNode,
): (code: string, hookType: string) => string | (() => void);

export type CodeProcessor = typeof codeProcessor;
