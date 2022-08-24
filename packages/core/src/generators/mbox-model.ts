import { format } from 'prettier/standalone';
import { fastClone } from '../helpers/fast-clone';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../modules/plugins';
import dedent from 'dedent';
import { BaseTranspilerOptions, Transpiler } from '../types/transpiler';

export interface ToMboxModelOptions extends BaseTranspilerOptions {}

// TODO: for some reason, types property contains both ts types and some random comments from source code. Will try to filter it out
export const componentToMboxModel =
  (options: ToMboxModelOptions = {}): Transpiler =>
  ({ component }) => {
    let json = fastClone(component);
    if (options.plugins) {
      json = runPreJsonPlugins(json, options.plugins);
    }
    if (options.plugins) {
      json = runPostJsonPlugins(json, options.plugins);
    }

    const types = json.types && json.types.length > 0 ? json.types?.join(' ') : '';

    let str = dedent`${types}`;

    if (options.plugins) {
      str = runPreCodePlugins(str, options.plugins);
    }

    if (options.prettier !== false) {
      try {
        str = format(str, {
          parser: 'typescript',
          htmlWhitespaceSensitivity: 'ignore',
          plugins: [
            // To support running in browsers
            require('prettier/parser-typescript'),
            require('prettier/parser-postcss'),
            require('prettier/parser-babel'),
          ],
        });
      } catch (err) {
        console.warn('Could not prettify', { string: str }, err);
      }
    }

    if (options.plugins) {
      str = runPostCodePlugins(str, options.plugins);
    }
    return str;
  };
