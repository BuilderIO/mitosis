import { AngularApi } from '@/generators/angular/types';
import { getEventNameWithoutOn } from '@/helpers/event-handlers';
import type { MitosisComponent } from '@/types/mitosis-component';

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
        const propType = propsTypeRef
          ? `<Parameters<Required<${propsTypeRef}>["${output}"]>[number] | void> `
          : '';
        return `${getEventNameWithoutOn(output)} = output${propType}()`;
      })
      .join('\n');
  }

  return outputVars
    .map((output) => {
      return `@Output() ${output} = new EventEmitter<any>()`;
    })
    .join('\n');
};
