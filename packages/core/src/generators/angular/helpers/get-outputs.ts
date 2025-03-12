import { AngularApi } from '@/generators/angular/types';
import type { MitosisComponent } from '@/types/mitosis-component';

export const getOutputImports = (api?: AngularApi): string[] => {
  if (api === 'signals') {
    return ['output'];
  }

  return ['Output', 'EventEmitter'];
};

export const getOutputs = ({
  json,
  outputVars,
  api,
}: {
  json: MitosisComponent;
  outputVars: string[];
  api?: AngularApi;
}) => {
  const propsTypeRef = json.propsTypeRef !== 'any' ? json.propsTypeRef : undefined;
  if (api === 'signals') {
    return outputVars
      .map((output) => {
        const propType = propsTypeRef ? `<ReturnType<Required<${propsTypeRef}>["${output}"]>>` : '';
        return `${output} = output${propType}()`;
      })
      .join('\n');
  }

  return outputVars
    .map((output) => {
      return `@Output() ${output} = new EventEmitter<any>()`;
    })
    .join('\n');
};
