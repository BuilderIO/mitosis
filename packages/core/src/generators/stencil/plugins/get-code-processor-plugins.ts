import { processBinding, ProcessBindingOptions } from '@/generators/stencil/helpers/index';
import { ToStencilOptions } from '@/generators/stencil/types';
import { CODE_PROCESSOR_PLUGIN } from '@/helpers/plugins/process-code';

export const getCodeProcessorPlugins = (
  options: ToStencilOptions,
  processBindingOptions: ProcessBindingOptions,
) => {
  return [
    ...(options.plugins || []),
    CODE_PROCESSOR_PLUGIN((codeType) => {
      switch (codeType) {
        case 'bindings':
        case 'properties':
        case 'hooks':
        case 'hooks-deps':
        case 'state':
        case 'context-set':
        case 'dynamic-jsx-elements':
        case 'types':
          return (code) => processBinding(code, processBindingOptions);
      }
    }),
  ];
};
