import { MitosisComponent, StateValue } from '../types/mitosis-component';
import { MitosisContext } from '../types/mitosis-context';

type ValueMapper = (
  code: string,
  type: 'data' | 'function' | 'getter',
  typeParameter: string | undefined,
  key: string | undefined,
) => string;

interface GetStateObjectStringOptions {
  data?: boolean;
  functions?: boolean;
  getters?: boolean;
  valueMapper?: ValueMapper;
  format?: 'object' | 'class' | 'variables';
  keyPrefix?: string;
  withType?: boolean;
}

type RequiredOptions = Required<GetStateObjectStringOptions>;

const DEFAULT_OPTIONS: RequiredOptions = {
  format: 'object',
  keyPrefix: '',
  valueMapper: (val) => val,
  data: true,
  functions: true,
  getters: true,
  withType: false,
};

const convertStateMemberToString =
  ({ data, format, functions, getters, keyPrefix, valueMapper, withType }: RequiredOptions) =>
  ([key, state]: [string, StateValue | undefined]): string | undefined => {
    const keyValueDelimiter = format === 'object' ? ':' : '=';

    if (!state) {
      return undefined;
    }

    const { code, typeParameter } = state;

    const type = withType && typeParameter ? `:${typeParameter}` : '';

    switch (state.type) {
      case 'function': {
        if (!functions) {
          return undefined;
        }
        return `${keyPrefix} ${key} ${keyValueDelimiter} ${valueMapper(
          code,
          'function',
          typeParameter,
          key,
        )}`;
      }
      case 'method': {
        if (!functions) {
          return undefined;
        }
        return `${keyPrefix} ${valueMapper(code, 'function', typeParameter, key)}`;
      }
      case 'getter': {
        if (!getters) {
          return undefined;
        }

        return `${keyPrefix} ${valueMapper(code, 'getter', typeParameter, key)}`;
      }
      case 'property': {
        if (!data) {
          return undefined;
        }
        return `${keyPrefix} ${key}${type}${keyValueDelimiter} ${valueMapper(
          code,
          'data',
          typeParameter,
          key,
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
