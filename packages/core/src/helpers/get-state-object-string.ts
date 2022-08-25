import { MitosisContext } from '../types/mitosis-context';
import json5 from 'json5';
import { MitosisComponent, StateValue } from '../types/mitosis-component';

interface GetStateObjectStringOptions {
  data?: boolean;
  functions?: boolean;
  getters?: boolean;
  valueMapper?: (code: string, type: 'data' | 'function' | 'getter') => string;
  format?: 'object' | 'class' | 'variables';
  keyPrefix?: string;
}

type RequiredOptions = Required<GetStateObjectStringOptions>;

const DEFAULT_OPTIONS: RequiredOptions = {
  format: 'object',
  keyPrefix: '',
  valueMapper: (val) => val,
  data: true,
  functions: true,
  getters: true,
};

const convertStateMemberToString =
  ({ data, format, functions, getters, keyPrefix, valueMapper }: RequiredOptions) =>
  ([key, state]: [string, StateValue | undefined]): string | undefined => {
    const keyValueDelimiter = format === 'object' ? ':' : '=';

    if (!state) {
      return undefined;
    }

    const code = state.code;
    switch (state.type) {
      case 'function': {
        if (functions === false || typeof code !== 'string') {
          return undefined;
        }
        return `${keyPrefix} ${key} ${keyValueDelimiter} ${valueMapper(code, 'function')}`;
      }
      case 'method': {
        if (functions === false || typeof code !== 'string') {
          return undefined;
        }
        return `${keyPrefix} ${valueMapper(code, 'function')}`;
      }
      case 'getter': {
        if (getters === false || typeof code !== 'string') {
          return undefined;
        }

        return `${keyPrefix} ${valueMapper(code, 'getter')}`;
      }
      case 'property': {
        if (data === false) {
          return undefined;
        }
        return `${keyPrefix} ${key}${keyValueDelimiter} ${valueMapper(
          json5.stringify(code),
          'data',
        )}`;
      }
      default:
        break;
    }
  };

export const getMemberObjectString = (
  object: MitosisComponent['state'],
  userOptions: GetStateObjectStringOptions = {},
) => {
  const options = { ...DEFAULT_OPTIONS, ...userOptions };

  const lineItemDelimiter = options.format === 'object' ? ',' : '\n';

  const stringifiedProperties = Object.entries(object)
    .map(convertStateMemberToString(options))
    .filter((x) => x !== undefined)
    .join(lineItemDelimiter);

  const prefix = options.format === 'object' ? '{' : '';
  const suffix = options.format === 'object' ? '}' : '';

  // NOTE: we add a `lineItemDelimiter` at the very end because other functions will sometimes append more properties.
  // If the delimiter is a comma and the format is `object`, then we need to make sure we have an extra comma at the end,
  // or the object will become invalid JS.
  // We also have to make sure that `stringifiedProperties` isn't empty, or we will get `{,}` which is invalid
  const extraDelimiter = stringifiedProperties.length > 0 ? lineItemDelimiter : '';

  return `${prefix}${stringifiedProperties}${extraDelimiter}${suffix}`;
};

export const stringifyContextValue = (
  object: MitosisContext['value'],
  userOptions: GetStateObjectStringOptions = {},
) => getMemberObjectString(object, userOptions);

export const getStateObjectStringFromComponent = (
  component: MitosisComponent,
  options?: GetStateObjectStringOptions,
) => getMemberObjectString(component.state, options);
