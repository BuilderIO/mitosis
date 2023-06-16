import { MitosisComponent } from '../../../types/mitosis-component';

export type CodeType =
  | 'hooks'
  | 'hooks-deps'
  | 'bindings'
  | 'properties'
  | 'state'
  // this is for when we write dynamic JSX elements like `<state.foo>Hello</state.foo>` in Mitosis
  | 'dynamic-jsx-elements';

// declare function codeProcessor<T extends CodeType>(
//   codeType: T,
//   json: MitosisComponent,
// ): (code: string, hookType: T extends 'hooks' ? keyof MitosisComponent['hooks'] : string) => string;
declare function codeProcessor(
  codeType: CodeType,
  json: MitosisComponent,
): (code: string, hookType: string) => string;

export type CodeProcessor = typeof codeProcessor;
