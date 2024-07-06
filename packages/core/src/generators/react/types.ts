import { BaseTranspilerOptions } from '@/types/transpiler';

export interface ToReactOptions extends BaseTranspilerOptions {
  stylesType: 'emotion' | 'styled-components' | 'styled-jsx' | 'react-native' | 'style-tag' | 'twrnc';
  stateType: 'useState' | 'mobx' | 'valtio' | 'solid' | 'builder' | 'variables';
  format?: 'lite' | 'safe';
  type: 'dom' | 'native' | 'taro';
  preact?: boolean;
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
