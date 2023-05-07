import { contextPropDrillingKey, MitosisComponent, ToReactOptions } from '@builder.io/mitosis';
import { stringifyContextValue } from '../../helpers/get-state-object-string';
import { createMitosisNode } from '../../helpers/create-mitosis-node';
import { createSingleBinding } from '../../helpers/bindings';

export function provideContext(
  json: MitosisComponent,
  options: Pick<ToReactOptions, 'contextType'>,
): string | void {
  if (options.contextType === 'prop-drill') {
    let str = '';
    for (const key in json.context.set) {
      const { name, ref, value } = json.context.set[key];
      if (value) {
        str += `
          ${contextPropDrillingKey}.${name} = ${stringifyContextValue(value)};
        `;
      }
      // TODO: support refs. I'm not sure what those are so unclear how to support them
    }
    return str;
  } else {
    for (const key in json.context.set) {
      const { name, ref, value } = json.context.set[key];
      if (value) {
        json.children = [
          createMitosisNode({
            name: `${name}.Provider`,
            children: json.children,
            ...(value && {
              bindings: {
                value: createSingleBinding({
                  code: stringifyContextValue(value),
                }),
              },
            }),
          }),
        ];
      } else if (ref) {
        json.children = [
          createMitosisNode({
            name: 'Context.Provider',
            children: json.children,
            ...(ref && {
              bindings: {
                value: createSingleBinding({ code: ref }),
              },
            }),
          }),
        ];
      }
    }
  }
}
