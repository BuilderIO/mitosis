import { format } from 'prettier/standalone';
import { collectCss } from '../helpers/styles/collect-css';
import { fastClone } from '../helpers/fast-clone';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../modules/plugins';
import dedent from 'dedent';
import { BaseTranspilerOptions, Transpiler } from '../types/transpiler';

export interface ToMboxOptions extends BaseTranspilerOptions {}

const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

// TODO: add JS support similar to componentToHtml()
export const componentToMbox =
  (options: ToMboxOptions = {}): Transpiler =>
  ({ component }) => {
    let json = fastClone(component);
    console.log('JSON: ', JSON.stringify(json))
    if (options.plugins) {
      json = runPreJsonPlugins(json, options.plugins);
    }
    const css = collectCss(json);
    if (options.plugins) {
      json = runPostJsonPlugins(json, options.plugins);
    }

    const componentName = capitalizeFirstLetter(json.name);

    let str = dedent`
    export type ${componentName}Props = Omit<model.${componentName}, "type" | "id"> & { id?: string };
    export function ${componentName}(props: ${componentName}Props): Omit<model.${componentName}, "id"> {
      const result: Omit<model.${componentName}, "id"> = Object.assign(
        { type: "${json.name.toLowerCase()}" as const },
        props
      );
      return result;
    }
    export function is${componentName}(a: any): boolean {
      return a?.type === "${json.name.toLowerCase()}";
    }
  `;

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