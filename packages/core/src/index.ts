export * from './flow';

export type Context<T> = {};

// These compile away
export const useState = <T>(obj: T) => obj;
export const useRef = () => null as any;
export const useContext = <T = { [key: string]: any }>(key: Context<T>): T =>
  null as unknown as T;
export const createContext = <T = { [key: string]: any }>(
  value: T,
): Context<T> => null as unknown as Context<T>;
export const setContext = <T = { [key: string]: any }>(
  key: Context<T>,
  value: Partial<T>,
): void => {};
export const onMount = (fn: () => any) => null as any;
export const onUpdate = (fn: () => any, deps?: any[]) => null as any;
export const onCreate = (fn: () => any) => null as any;
export const onInit = (fn: () => any) => null as any;
export const onUnMount = (fn: () => any) => null as any;
export const useDynamicTag = (fn: () => any) => null as any;
export const onError = (fn: () => any) => null as any;
export const useMetadata = (obj: object) => null;

export * from './parsers/jsx';
export * from './parsers/builder';
export * from './parsers/angular';
export * from './parsers/liquid';
export * from './parsers/context';
export * from './generators/vue';
export * from './generators/angular';
export * from './generators/context/react';
export * from './generators/context/vue';
export * from './generators/react';
export * from './generators/solid';
export * from './generators/liquid';
export * from './generators/builder';
export * from './generators/qwik/index';
export * from './symbols/symbol-processor';
export * from './generators/html';
export * from './generators/svelte';
export * from './generators/stencil';
export * from './generators/mitosis';
export * from './generators/template';
export * from './generators/swift-ui';
export * from './generators/react-native';
export * from './helpers/parse-reactive-script';
export * from './helpers/is-mitosis-node';

export * from './types/mitosis-node';
export * from './types/mitosis-component';
export * from './types/config';

export * from './plugins/compile-away-builder-components';
export * from './plugins/compile-away-components';
export * from './plugins/map-styles';

export * from './targets';
