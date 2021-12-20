import { MitosisComponent } from '../types/mitosis-component';
import { Plugin } from '../types/plugins';

export { Plugin };

export const runPreJsonPlugins = (
  json: MitosisComponent,
  plugins: Plugin[],
  options?: any,
) => {
  let useJson = json;
  for (const plugin of plugins) {
    const preFunction = plugin(options).json?.pre;
    if (preFunction) {
      useJson = preFunction(json) || json;
    }
  }
  return useJson;
};

export const runPostJsonPlugins = (
  json: MitosisComponent,
  plugins: Plugin[],
  options?: any,
) => {
  let useJson = json;
  for (const plugin of plugins) {
    const postFunction = plugin(options).json?.post;
    if (postFunction) {
      useJson = postFunction(json) || json;
    }
  }
  return useJson;
};

export const runPreCodePlugins = (
  code: string,
  plugins: Plugin[],
  options?: any,
) => {
  let string = code;
  for (const plugin of plugins) {
    const preFunction = plugin(options).code?.pre;
    if (preFunction) {
      string = preFunction(string);
    }
  }
  return string;
};

export const runPostCodePlugins = (
  code: string,
  plugins: Plugin[],
  options?: any,
) => {
  let string = code;
  for (const plugin of plugins) {
    const postFunction = plugin(options).code?.post;
    if (postFunction) {
      string = postFunction(string);
    }
  }
  return string;
};
