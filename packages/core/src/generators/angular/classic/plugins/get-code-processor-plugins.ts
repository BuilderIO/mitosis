import { VALID_HTML_TAGS } from '@/constants/html_tags';
import { processAngularCode } from '@/generators/angular/helpers';
import { ToAngularOptions } from '@/generators/angular/types';
import { getRefs } from '@/helpers/get-refs';
import { CODE_PROCESSOR_PLUGIN } from '@/helpers/plugins/process-code';
import { replaceIdentifiers } from '@/helpers/replace-identifiers';
import { MitosisComponent } from '@/types/mitosis-component';
import { flow } from 'fp-ts/function';

export const getCodeProcessorPlugins = ({
  json,
  contextVars,
  options,
  outputVars,
}: {
  json: MitosisComponent;
  options: ToAngularOptions;
  contextVars: string[];
  outputVars: string[];
}) => {
  return [
    ...(options.plugins || []),
    CODE_PROCESSOR_PLUGIN((codeType, _, node) => {
      switch (codeType) {
        case 'hooks':
          return flow(
            processAngularCode({
              replaceWith: 'this',
              contextVars,
              outputVars,
              domRefs: Array.from(getRefs(json)),
            }),
            (code) => {
              const allMethodNames = Object.entries(json.state)
                .filter(([_, value]) => value?.type === 'function' || value?.type === 'method')
                .map(([key]) => key);

              return replaceIdentifiers({
                code,
                from: allMethodNames,
                to: (name) => `this.${name}`,
              });
            },
          );

        case 'bindings':
          return (code, key) => {
            // we create a separate state property for spread binding and use ref to attach the attributes
            // so we need to use `this.` inside the class to access state and props
            const isSpreadAttributeBinding =
              node?.bindings[key]?.type === 'spread' && VALID_HTML_TAGS.includes(node.name.trim());

            // If we have a For loop with "key" it will be transformed to
            // trackOfXXX, we need to use "this" for state properties
            const isKey = key === 'key';

            const newLocal = processAngularCode({
              contextVars: [],
              outputVars,
              domRefs: [], // the template doesn't need the this keyword.
              replaceWith: isKey || isSpreadAttributeBinding ? 'this' : undefined,
            })(code);
            return newLocal.replace(/"/g, '&quot;');
          };
        case 'hooks-deps':
        case 'hooks-deps-array':
        case 'state':
        case 'context-set':
        case 'properties':
        case 'dynamic-jsx-elements':
        case 'types':
          return (code) => code;
      }
    }),
  ];
};
