import { format } from 'prettier/standalone';
import { collectCss } from '../helpers/collect-styles';
import { fastClone } from '../helpers/fast-clone';
import {} from '../helpers/strip-state-and-props-refs';
import { selfClosingTags } from '../parsers/jsx';
import { MitosisComponent } from '../types/mitosis-component';
import { MitosisNode } from '../types/mitosis-node';
import {
  Plugin,
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../modules/plugins';
import dedent from 'dedent';
import { getStateObjectStringFromComponent } from '../helpers/get-state-object-string';

type ToTemplateOptions = {
  prettier?: boolean;
  plugins?: Plugin[];
};

const mappers: {
  [key: string]: (json: MitosisNode, options: ToTemplateOptions) => string;
} = {
  Fragment: (json, options) => {
    return `<div>${json.children
      .map((item) => blockToTemplate(item, options))
      .join('\n')}</div>`;
  },
};

// TODO: spread support
const blockToTemplate = (
  json: MitosisNode,
  options: ToTemplateOptions = {},
) => {
  if (mappers[json.name]) {
    return mappers[json.name](json, options);
  }

  if (json.properties._text) {
    return json.properties._text;
  }
  if (json.bindings._text) {
    return `\${${json.bindings._text as string}}`;
  }

  let str = '';

  if (json.name === 'For') {
    str += `\${${json.bindings.each as string}?.map(${
      json.properties._forName
    } => \``;
    if (json.children) {
      str += json.children
        .map((item) => blockToTemplate(item, options))
        .join('\n');
    }

    str += '`).join("")}';
  } else if (json.name === 'Show') {
    str += `\${!(${json.bindings.when as string}) ? '' : \``;
    if (json.children) {
      str += json.children
        .map((item) => blockToTemplate(item, options))
        .join('\n');
    }

    str += '`}';
  } else {
    str += `<${json.name} `;

    // TODO: JS iteration or with helper
    // if (json.bindings._spread === '_spread') {
    //   str += `
    //       {% for _attr in ${json.bindings._spread} %}
    //         {{ _attr[0] }}="{{ _attr[1] }}"
    //       {% endfor %}
    //     `;
    // }

    for (const key in json.properties) {
      const value = json.properties[key];
      str += ` ${key}="${value}" `;
    }

    for (const key in json.bindings) {
      if (key === '_spread' || key === 'ref' || key === 'css') {
        continue;
      }
      const value = json.bindings[key] as string;
      // TODO: proper babel transform to replace. Util for this
      const useValue = value;

      if (key.startsWith('on')) {
        // Do nothing
      } else {
        str += ` ${key}="\${${useValue}}" `;
      }
    }
    if (selfClosingTags.has(json.name)) {
      return str + ' />';
    }
    str += '>';
    if (json.children) {
      str += json.children
        .map((item) => blockToTemplate(item, options))
        .join('\n');
    }

    str += `</${json.name}>`;
  }
  return str;
};

// TODO: add JS support similar to componentToHtml()
export const componentToTemplate = (
  componentJson: MitosisComponent,
  options: ToTemplateOptions = {},
) => {
  let json = fastClone(componentJson);
  if (options.plugins) {
    json = runPreJsonPlugins(json, options.plugins);
  }
  const css = collectCss(json);
  if (options.plugins) {
    json = runPostJsonPlugins(json, options.plugins);
  }
  let str = json.children.map((item) => blockToTemplate(item)).join('\n');

  if (css.trim().length) {
    str += `<style>${css}</style>`;
  }

  str = dedent`
    export default function template(props) {
      let state = ${getStateObjectStringFromComponent(json)}

      return \`${str.replace(/\s+/g, ' ')}\`
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
