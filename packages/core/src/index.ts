import './jsx';

export * from './flow';

// These compile away
export const useState = <T>(obj: T) => obj;
export const useRef = () => null as any;
export const useContext = () => null as any;
export const createContext = () => null as any;

export * from './parse';
export * from './generators/vue'
export * from './generators/react'
export * from './generators/liquid'
