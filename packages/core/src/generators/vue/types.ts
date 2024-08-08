import { BaseTranspilerOptions } from '@/types/transpiler';

export type Api = 'options' | 'composition';

export interface ToVueOptions extends BaseTranspilerOptions {
  cssNamespace?: () => string;
  namePrefix?: (path: string) => string;
  asyncComponentImports?: boolean;
  defineComponent?: boolean;
  api: Api;
  convertClassStringToObject?: boolean;
  casing?: 'pascal' | 'kebab';
}

export type Prop<T> =
  | { (): T }
  | { new (...args: never[]): T & object }
  | { new (...args: string[]): Function };
export type PropType<T> = Prop<T> | Prop<T>[];
export type PropValidator<T> = PropOptions<T> | PropType<T>;

export interface PropOptions<T = any> {
  type?: PropType<T>;
  required?: boolean;
  default?: T | null | undefined | (() => T | null | undefined);
  validator?(value: T): boolean;
}

export type DefaultProps = Record<string, any>;
export type RecordPropsDefinition<T> = {
  [K in keyof T]: PropValidator<T[K]>;
};
export type ArrayPropsDefinition<T> = (keyof T)[];
export type PropsDefinition<T> = ArrayPropsDefinition<T> | RecordPropsDefinition<T>;
