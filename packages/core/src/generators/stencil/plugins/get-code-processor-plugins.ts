import { processBinding, ProcessBindingOptions } from '@/generators/stencil/helpers/index';
import { ToStencilOptions } from '@/generators/stencil/types';
import { CODE_PROCESSOR_PLUGIN } from '@/helpers/plugins/process-code';
import { MitosisComponent } from '@/types/mitosis-component';

export const getCodeProcessorPlugins = (
  json: MitosisComponent,
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
          return (code) => processBinding(json, code, processBindingOptions);
      }
    }),
  ];
};
