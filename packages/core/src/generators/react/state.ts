import { types } from '@babel/core';
import traverse from 'traverse';
import { capitalize } from '../../helpers/capitalize';
import { isMitosisNode } from '../../helpers/is-mitosis-node';
import { MitosisComponent, StateValue } from '../../types/mitosis-component';
import { pipe } from 'fp-ts/lib/function';
import { ToReactOptions } from './types';
import { processBinding } from './helpers';
import { prefixWithFunction, replaceGetterWithFunction } from '../../helpers/patterns';
import { transformStateSetters } from '../../helpers/transform-state-setters';
import { getRefs } from '../../helpers/get-refs';
import { contextPropDrillingKey } from '@builder.io/mitosis';

/**
 * Removes all `this.` references.
 */
const stripThisRefs = (str: string, options: Pick<ToReactOptions, 'stateType'>) => {
  if (options.stateType !== 'useState') {
    return str;
  }

  return str.replace(/this\.([a-zA-Z_\$0-9]+)/g, '$1');
};

export const processHookCode = ({
  str,
  options,
}: {
  str: string;
  options: Pick<ToReactOptions, 'stateType'>;
}) => processBinding(updateStateSettersInCode(str, options), options);

const valueMapper = (options: Pick<ToReactOptions, 'stateType'>) => (val: string) => {
  const x = processHookCode({ str: val, options });
  return stripThisRefs(x, options);
};
const getSetStateFnName = (stateName: string) => `set${capitalize(stateName)}`;

const processStateValue = (options: Pick<ToReactOptions, 'stateType'>) => {
  const mapValue = valueMapper(options);

  return ([key, stateVal]: [key: string, stateVal: StateValue | undefined]) => {
    if (!stateVal) {
      return '';
    }
    const getDefaultCase = () =>
      pipe(
        value,
        mapValue,
        (x) => `const [${key}, ${getSetStateFnName(key)}] = useState(() => (${x}))`,
      );

    const value = stateVal.code || '';
    const type = stateVal.type;
    if (typeof value === 'string') {
      switch (type) {
        case 'getter':
          return pipe(value, replaceGetterWithFunction, mapValue);
        case 'function':
          return mapValue(value);
        case 'method':
          return pipe(value, prefixWithFunction, mapValue);
        default:
          return getDefaultCase();
      }
    } else {
      return getDefaultCase();
    }
  };
};

export const getUseStateCode = (
  json: MitosisComponent,
  options: Pick<ToReactOptions, 'stateType'>,
) => {
  const lineItemDelimiter = '\n\n\n';

  const stringifiedState = Object.entries(json.state).map(processStateValue(options));
  return stringifiedState.join(lineItemDelimiter);
};

export const updateStateSetters = (
  json: MitosisComponent,
  options: Pick<ToReactOptions, 'stateType'>,
) => {
  if (options.stateType !== 'useState') {
    return;
  }
  traverse(json).forEach(function (item) {
    if (isMitosisNode(item)) {
      for (const key in item.bindings) {
        let values = item.bindings[key]!;
        const newValue = updateStateSettersInCode(values?.code as string, options);
        if (newValue !== values?.code) {
          item.bindings[key] = {
            ...values,
            code: newValue,
          };
        }
      }
    }
  });
};

export const updateStateSettersInCode = (
  value: string,
  options: Pick<ToReactOptions, 'stateType'>,
) => {
  if (options.stateType !== 'useState') {
    return value;
  }
  return transformStateSetters({
    value,
    transformer: ({ path, propertyName }) => {
      const { node } = path;
      const newExpression = types.callExpression(
        types.identifier(getSetStateFnName(propertyName)),
        [node.right],
      );
      return newExpression;
    },
  });
};

export const getRefsString = (
  json: MitosisComponent,
  refs: string[],
  options: Pick<ToReactOptions, 'stateType' | 'typescript'>,
) => {
  let hasStateArgument = false;
  let code = '';
  const domRefs = getRefs(json);

  for (const ref of refs) {
    const typeParameter = json['refs'][ref]?.typeParameter || '';
    // domRefs must have null argument
    const argument = json['refs'][ref]?.argument || (domRefs.has(ref) ? 'null' : '');
    hasStateArgument = /state\./.test(argument);
    code += `\nconst ${ref} = useRef${
      typeParameter && options.typescript ? `<${typeParameter}>` : ''
    }(${processHookCode({
      str: argument,
      options,
    })});`;
  }

  return [hasStateArgument, code];
};

export function getContextString(
  component: MitosisComponent,
  options: Pick<ToReactOptions, 'contextType'>,
) {
  let str = '';
  for (const key in component.context.get) {
    if (options.contextType === 'prop-drill') {
      str += `
        const ${key} = ${contextPropDrillingKey}['${component.context.get[key].name}'];
      `;
    } else {
      str += `
        const ${key} = useContext(${component.context.get[key].name});
      `;
    }
  }

  return str;
}

export function getHooksCode(
  json: MitosisComponent,
  options: Parameters<typeof processHookCode>[0]['options'],
) {
  return `
    ${
      json.hooks.onInit?.code
        ? `
          useEffect(() => {
            ${processHookCode({
              str: json.hooks.onInit.code,
              options,
            })}
          }, [])
          `
        : ''
    }
      ${
        json.hooks.onMount?.code
          ? `useEffect(() => {
            ${processHookCode({
              str: json.hooks.onMount.code,
              options,
            })}
          }, [])`
          : ''
      }
  
      ${
        json.hooks.onUpdate
          ?.map(
            (hook) => `useEffect(() => {
            ${processHookCode({ str: hook.code, options })}
          },
          ${hook.deps ? processHookCode({ str: hook.deps, options }) : ''})`,
          )
          .join(';') ?? ''
      }
  
      ${
        json.hooks.onUnMount?.code
          ? `useEffect(() => {
            return () => {
              ${processHookCode({
                str: json.hooks.onUnMount.code,
                options,
              })}
            }
          }, [])`
          : ''
      }
  `;
}
