export * from './flow';

export type Context<T> = {};

// These compile away
export const useStore = <T>(obj: T) => obj;
export const useState = <T>(obj: T): [T, (value: T) => void] => {
  throw new Error('useState: Mitosis hook should have been compiled away');
  return null as any;
};
export const useRef = <T>(obj?: null | void | T) => {
  throw new Error('useRef: Mitosis hook should have been compiled away');
  return obj as unknown as T;
};
export const useContext = <T = { [key: string]: any }>(key: Context<T>): T => null as unknown as T;
export const createContext = <T = { [key: string]: any }>(value: T): Context<T> =>
  null as unknown as Context<T>;
export const setContext = <T = { [key: string]: any }>(
  key: Context<T>,
  value: Partial<T>,
): void => {};
export const onMount = (fn: () => any) => {
  throw new Error('onMount: Mitosis hook should have been compiled away');
  return null as any;
};
export const onUpdate = (fn: () => any, deps?: any[]) => null as any;
export const onCreate = (fn: () => any) => null as any;
export const onInit = (fn: () => any) => null as any;
export const onUnMount = (fn: () => any) => null as any;
export const useDynamicTag = (fn: () => any) => null as any;
export const onError = (fn: () => any) => null as any;
export const useMetadata = (obj: object) => {
  throw new Error('useMetadata: Mitosis hook should have been compiled away');
  return null as any;
};
export const useDefaultProps = <T = { [key: string]: any }>(value: T): T => null as unknown as T;

export * from './parsers/jsx';
export * from './parsers/builder';
export * from './parsers/angular';
export * from './parsers/liquid';
export * from './parsers/context';
export * from './generators/vue';
export * from './generators/angular';
export * from './generators/context/react';
export * from './generators/context/qwik';
export * from './generators/context/solid';
export * from './generators/context/vue';
export * from './generators/context/svelte';
export * from './generators/react';
export * from './generators/mbox';
export * from './generators/mbox-model';
export * from './generators/solid';
export * from './generators/liquid';
export * from './generators/builder';
export * from './generators/qwik/index';
export * from './symbols/symbol-processor';
export * from './generators/html';
export * from './generators/svelte';
export * from './generators/stencil';
export * from './generators/marko';
export * from './generators/mitosis';
export * from './generators/template';
export * from './generators/swift-ui';
export * from './generators/lit';
export * from './generators/react-native';
export * from './helpers/parse-reactive-script';
export * from './helpers/is-mitosis-node';

export * from './types/mitosis-node';
export * from './types/mitosis-component';
export * from './types/config';
export * from './types/transpiler';

export * from './plugins/compile-away-builder-components';
export * from './plugins/compile-away-components';
export * from './plugins/map-styles';

export * from './targets';
