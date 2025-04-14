import { BaseTranspilerOptions } from '@/types/transpiler';

export interface ToReactOptions extends BaseTranspilerOptions {
  stylesType:
    | 'emotion'
    | 'styled-components'
    | 'styled-jsx'
    | 'react-native'
    | 'style-tag'
    | 'twrnc'
    | 'native-wind';
  styleTagsPlacement?: 'top' | 'bottom';
  stateType: 'useState' | 'mobx' | 'valtio' | 'solid' | 'builder' | 'variables';
  format?: 'lite' | 'safe';
  type: 'dom' | 'native' | 'taro';
  preact?: boolean;
  sanitizeReactNative?: boolean;
  rsc?: boolean;
  forwardRef?: string;
  experimental?: any;
  /**
   * For RSC, normal React context is currently not supported, so provide a prop drilling
   * option
   */
  contextType?: 'context' | 'prop-drill';
  addUseClientDirectiveIfNeeded?: boolean;
}

export type ReactMetadata = {
  forwardRef?: string;
};
