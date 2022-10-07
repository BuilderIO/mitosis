import { BaseTranspilerOptions } from '../../types/transpiler';

export interface ToReactOptions extends BaseTranspilerOptions {
  stylesType?: 'emotion' | 'styled-components' | 'styled-jsx' | 'react-native' | 'style-tag';
  stateType?: 'useState' | 'mobx' | 'valtio' | 'solid' | 'builder' | 'variables';
  format?: 'lite' | 'safe';
  type?: 'dom' | 'native';
  preact?: boolean;
  forwardRef?: string;
  experimental?: any;
}
