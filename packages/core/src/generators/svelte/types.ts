import { BaseTranspilerOptions } from '@/types/transpiler';

export type ToSvelteOptions = BaseTranspilerOptions & {
  stateType?: 'proxies' | 'variables';
  /**
   * Getters compile to `$: foo = () => ...` and are called as `foo()`, so every read re-runs the
   * getter body. When enabled, a getter's result is cached until its dependencies change (Svelte
   * re-creates the reactive declaration) or the current task ends, whichever comes first.
   *
   * A getter read, then invalidated by a state change, then read again within the same synchronous
   * block of code (e.g. one event handler) returns the first value.
   */
  memoizeGetters?: boolean;
};

export type SvelteMetadata = {};
