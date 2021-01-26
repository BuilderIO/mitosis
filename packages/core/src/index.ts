// import './jsx';

export * from './flow';

// These compile away
export const useState = <T>(obj: T) => obj;
export const useRef = () => null as any;
export const useContext = () => null as any;
export const createContext = () => null as any;
export const onMount = (fn: () => any) => null as any;
export const onUnMount = (fn: () => any) => null as any;
export const afterUnmount = (fn: () => any) => null as any;
export const useDynamicTag = (fn: () => any) => null as any;
export const onError = (fn: () => any) => null as any;

export * from './parsers/jsx';
export * from './parsers/builder';
export * from './parsers/liquid';
export * from './generators/vue';
export * from './generators/angular';
export * from './generators/react';
export * from './generators/solid';
export * from './generators/liquid';
export * from './generators/builder';
export * from './generators/html';
export * from './generators/svelte';
export * from './generators/jsx-lite';
export * from './generators/template';
export * from './generators/swift-ui';
export * from './generators/react-native';
export * from './helpers/parse-reactive-script';
export * from './helpers/is-jsx-lite-node';

export * from './types/jsx-lite-node';
export * from './types/jsx-lite-component';

export * from './plugins/compile-away-builder-components';
export * from './plugins/map-styles';


