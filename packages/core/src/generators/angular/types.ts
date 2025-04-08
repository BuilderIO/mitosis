import { BaseTranspilerOptions } from '@/types/transpiler';

export const BUILT_IN_COMPONENTS = new Set(['Show', 'For', 'Fragment', 'Slot']);

export type AngularApi = 'classic' | 'signals';

export interface ToAngularOptions extends BaseTranspilerOptions {
  api?: AngularApi;
  state?: 'class-properties' | 'inline-with-wrappers';
  standalone?: boolean;
  preserveImports?: boolean;
  preserveFileExtensions?: boolean;
  importMapper?: Function;
  bootstrapMapper?: Function;
  visuallyIgnoreHostElement?: boolean;
  defaultExportComponents?: boolean;
  experimental?: {
    injectables?: (variableName: string, variableType: string) => string;
    inject?: boolean;
  };
}

export const DEFAULT_ANGULAR_OPTIONS: ToAngularOptions = {
  api: 'classic',
  state: 'inline-with-wrappers',
  preserveImports: false,
  preserveFileExtensions: false,
  visuallyIgnoreHostElement: true,
  defaultExportComponents: false,
};

export type AngularMetadata = {
  /**
   * Mitosis uses `attr.XXX` as default see https://angular.io/guide/attribute-binding.
   * If you want to skip some you can use the 'nativeAttributes'.
   */
  nativeAttributes?: string[];
  /**
   * If you encounter some native events which aren't generated in lower-case.
   * Create a new PR inside [event-handlers.ts](https://github.com/BuilderIO/mitosis/blob/main/packages/core/src/helpers/event-handlers.ts) to fix it for all.
   */
  nativeEvents?: string[];
  /**
   * @deprecated Rename component in *.lite.tsx
   * Overwrite default selector for component. Default will be kebab case (MyComponent -> my-component)
   */
  selector?: string;
  /**
   * Overwrite default change detection strategy.
   * `OnPush` adds `changeDetection: ChangeDetectionStrategy.OnPush` to the component metadata.
   */
  changeDetection?: 'Default' | 'OnPush';
  /**
   * Overwrite default sanitizeInnerHTML. Default is `false`
   */
  sanitizeInnerHTML?: boolean;

  /**
   * @deprecated Only for api=classic
   * Add additional @Output() properties to the component.
   * Can be used with `useTarget({angular: ()=> ...})` if needed.
   */
  outputs?: string[];

  /**
   * Only for api=signals
   */
  signals?: {
    /**
     * Turns every property in this array to [`model`](https://angular.dev/api/core/model).
     * This is useful if you want to use ngModel(`[(prop)]`) syntax in Angular.
     */
    writeable?: string[];
    /**
     * Adds [`.required`](https://angular.dev/api/core/input#required()) to the `input()` properties.
     */
    required?: string[];
  };
};

export type AngularBlockOptions = {
  childComponents?: string[];
} & AngularMetadata;
