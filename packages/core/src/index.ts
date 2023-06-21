import { JSX } from '@builder.io/mitosis/jsx-runtime';
import { Dictionary } from './helpers/typescript';
import { ComponentMetadata } from './types/metadata';
import { ContextType, TargetBlock } from './types/mitosis-component';

export * from './flow';
export * from './generators/alpine';
export * from './generators/angular';
export * from './generators/builder';
export * from './generators/context/qwik';
export * from './generators/context/react';
export * from './generators/context/rsc';
export * from './generators/context/solid';
export * from './generators/context/svelte';
export * from './generators/context/vue';
export * from './generators/html';
export * from './generators/liquid';
export * from './generators/lit';
export * from './generators/marko';
export * from './generators/mitosis';
export * from './generators/qwik/index';
export * from './generators/react';
export * from './generators/react-native';
export * from './generators/rsc';
export * from './generators/solid';
export * from './generators/stencil';
export * from './generators/svelte';
export * from './generators/swift-ui';
export * from './generators/taro';
export * from './generators/template';
export * from './generators/vue';
export * from './helpers/is-mitosis-node';
export * from './parsers/angular';
export * from './parsers/builder';
export * from './parsers/context';
export * from './parsers/jsx';
export * from './parsers/svelte';
export * from './plugins/compile-away-builder-components';
export * from './plugins/compile-away-components';
export * from './plugins/map-styles';
export * from './symbols/symbol-processor';
export * from './targets';
export * from './types/config';
export * from './types/mitosis-component';
export * from './types/mitosis-node';
export * from './types/plugins';
export * from './types/transpiler';

declare function Provider<T>(props: { value: T; children: JSX.Element }): any;

export type Context<T> = {
  Provider: typeof Provider<T>;
};

export type Signal<T> = {
  value: T;
};

// These compile away
export declare function useStore<T>(obj: T): T;

export declare function useState<T>(
  obj: T,
  args: { reactive: true },
): [Signal<T>, (value: T) => void];
export declare function useState<T>(obj: T, args?: { reactive?: boolean }): [T, (value: T) => void];

export declare function useRef<T>(obj?: null | void | T): T;
export declare function useContext<T = Dictionary<any>>(key: Context<T>, type?: ContextType): T;
export declare function createContext<T = Dictionary<any>>(
  value: T,
  type?: ContextType,
): Context<T>;
export declare function setContext<T = Dictionary<any>>(
  key: Context<T>,
  value: Partial<T>,
  type?: ContextType,
): void;
export declare function onMount(fn: () => any): void;
export declare function onUpdate(fn: () => any, deps?: any[]): void;
export declare function onInit(fn: () => any): void;
export declare function onUnMount(fn: () => any): void;
export declare function useDynamicTag(fn: () => any): void;
export declare function onError(fn: () => any): void;
export declare function useMetadata(obj: ComponentMetadata): void;
export declare function useDefaultProps<T = Dictionary<any>>(value: T): T;
export declare function useStyle(value: string): void;

// TO-DO: better type strictness that guarantees `Target` is a subset of `Targets`
export declare function useTarget<Return>(dict: TargetBlock<Return>): Return;
