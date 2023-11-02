import { prefixWithFunction } from '@/helpers/patterns';
import { Plugin } from '../../modules/plugins';

export const FUNCTION_HACK_PLUGIN: Plugin = () => ({
  json: {
    pre: (json) => {
      for (const key in json.state) {
        const value = json.state[key]?.code;
        const type = json.state[key]?.type;
        if (typeof value === 'string' && type === 'method') {
          const newValue = prefixWithFunction(value);
          json.state[key] = {
            code: newValue,
            type: 'method',
          };
        } else if (typeof value === 'string' && type === 'function') {
          json.state[key] = {
            code: value,
            type: 'method',
          };
        }
      }
    },
  },
});
