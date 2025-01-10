import { prefixWithFunction } from '@/helpers/patterns';
import { MitosisPlugin } from '../../modules/plugins';

export const FUNCTION_HACK_PLUGIN: MitosisPlugin = () => ({
  json: {
    pre: (json) => {
      for (const key in json.state) {
        const state = json.state[key];
        const value = state?.code;
        const type = state?.type;
        if (typeof value === 'string' && type === 'method') {
          const newValue = prefixWithFunction(value);
          json.state[key] = {
            ...state,
            code: newValue,
            type: 'method',
          };
        } else if (typeof value === 'string' && type === 'function') {
          json.state[key] = {
            ...state,
            code: value,
            type: 'method',
          };
        }
      }
    },
  },
});
