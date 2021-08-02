import dedent from 'dedent';
import { tryPrettierFormat } from '../helpers/try-prettier-format';
import traverse from 'traverse';
import { fastClone } from '../helpers/fast-clone';
import { filterEmptyTextNodes } from '../helpers/filter-empty-text-nodes';
import { format } from '../helpers/generic-format';
import { getStateObjectStringFromComponent } from '../helpers/get-state-object-string';
import { getStyles } from '../helpers/get-styles';
import isChildren from '../helpers/is-children';
import { isMitosisNode } from '../helpers/is-mitosis-node';
import { MitosisComponent } from '../types/mitosis-component';
import { MitosisNode } from '../types/mitosis-node';
import { MitosisStyles } from '../types/mitosis-styles';

export type ToSwiftOptions = {
  prettier?: boolean;
};

const scrolls = (json: MitosisNode) => {
  return getStyles(json)?.overflow === 'auto';
};

const mappers: {
  [key: string]: (json: MitosisNode, options: ToSwiftOptions) => string;
} = {
  Fragment: (json, options) => {
    return `${json.children
      .map((item) => blockToSwift(item, options))
      .join('\n')}`;
  },
  link: () => '',
  Image: (json, options) => {
    return `Image(${processBinding(json.bindings.image as string, options) ||
      `"${json.properties.image}"`})`;
  },
};

const blockToSwift = (json: MitosisNode, options: ToSwiftOptions): string => {
  if (mappers[json.name]) {
    return mappers[json.name](json, options);
  }

  // TODO: Add support for `{props.children}` bindings
  // Right now we return an empty string because the generated code
  // is very likely wrong.
  if (isChildren(json)) {
    return '/* `props.children` is not supported yet for SwiftUI */';
  }

  if (json.properties._text) {
    if (!json.properties._text.trim().length) {
      return '';
    }
    return `Text("${json.properties._text.trim().replace(/\s+/g, ' ')}")`;
  }
  if (json.bindings._text) {
    return `Text(${processBinding(json.bindings._text as string, options)})`;
  }

  let str = '';

  const children = json.children.filter(filterEmptyTextNodes);

  const style = getStyles(json);

  // TODO: do as preprocess step and do more mappings of dom attributes to special
  // Image, TextField, etc component props
  const name =
    json.name === 'input'
      ? 'TextField'
      : json.name === 'img'
      ? 'Image'
      : json.name[0].toLowerCase() === json.name[0]
      ? json.bindings.onClick
        ? // TODO: also map onClick to action:s
          'Button'
        : scrolls(json)
        ? 'ScrollView'
        : style?.display === 'flex' && style.flexDirection !== 'column'
        ? 'HStack'
        : 'VStack'
      : json.name;

  if (name === 'TextField') {
    const placeholder = json.properties.placeholder;
    delete json.properties.placeholder;
    json.properties._ = placeholder || '';
  }

  if (json.name === 'For') {
    str += `ForEach(${processBinding(
      json.bindings.each as string,
      options,
    )}, id: \\.self) { ${json.properties._forName} in ${children
      .map((item) => blockToSwift(item, options))
      .join('\n')} }`;
  } else if (json.name === 'Show') {
    str += `if ${processBinding(json.bindings.when as string, options)} {
      ${children.map((item) => blockToSwift(item, options)).join('\n')}
    }`;
  } else {
    str += `${name}(`;

    for (const key in json.properties) {
      if (key === 'class' || key === 'className') {
        continue;
      }
      // TODO: binding mappings
      // const value = json.properties[key];
      // str += ` ${key}: "${(value as string).replace(/"/g, '&quot;')}", `;
      console.warn(`Unsupported property "${key}"`);
    }
    for (const key in json.bindings) {
      if (
        // TODO: implement spread, ref, more css
        key === '_spread' ||
        key === 'ref' ||
        key === 'css' ||
        key === 'class' ||
        key === 'className'
      ) {
        continue;
      }

      if (key.startsWith('on')) {
        if (key === 'onClick') {
          continue;
        } else {
          // TODO: other event mappings
          console.warn(`Unsupported event binding "${key}"`);
        }
      } else {
        console.warn(`Unsupported binding "${key}"`);
        // TODO: need binding mappings
        // str += ` ${key}: ${processBinding(value, options)}, `;
      }
    }
    str += `)`;

    str += ` {`;
    if (json.children) {
      str += json.children
        .map((item) => blockToSwift(item, options))
        .join('\n');
    }

    str += `}`;
    for (const key in style) {
      let useKey = key;
      const rawValue = style[key as keyof MitosisStyles]!;
      let value: number | string = `"${rawValue}"`;
      if (['padding', 'margin'].includes(key)) {
        // TODO: throw error if calc()
        value = parseFloat(rawValue as string);
        str += `.${useKey}(${value})`;
      } else if (key === 'color') {
        useKey = 'foregroundColor';
        // TODO: convert to RBG and use Color(red: ..., ....)
      } else {
        console.warn(`Styling key "${key}" is not supported`);
      }
    }

    if (json.bindings.onClick) {
      str += `.onTapGesture {
        ${processBinding(json.bindings.onClick as string, options)}
      }`;
    }
  }

  return str;
};

function getJsSource(json: MitosisComponent, options: ToSwiftOptions) {
  const str = `const state = ${getStateObjectStringFromComponent(json)};`;
  if (options.prettier === false) {
    return str.trim();
  } else {
    return tryPrettierFormat(str, 'typescript').trim();
  }
}

const processBinding = (str: string, options: ToSwiftOptions) => {
  return `eval(code: """${str}""")`;
};

function componentHasDynamicData(json: MitosisComponent) {
  const hasState = Object.keys(json.state).length > 0;
  if (hasState) {
    return true;
  }
  let found = false;
  traverse(json).forEach(function(node) {
    if (isMitosisNode(node)) {
      if (Object.keys(node.bindings).filter((item) => item !== 'css').length) {
        found = true;
        this.stop();
      }
    }
  });

  return found;
}

function getStyleString() {}

export const componentToSwift = (
  componentJson: MitosisComponent,
  options: ToSwiftOptions = {},
) => {
  const json = fastClone(componentJson);

  const hasDyanmicData = componentHasDynamicData(json);

  let children = json.children
    .map((item) => blockToSwift(item, options))
    .join('\n');

  let str = dedent`
    import SwiftUI
    ${!hasDyanmicData ? '' : `import JavaScriptCore`}

    struct ${componentJson.name}: View {
      ${
        !hasDyanmicData
          ? ''
          : `
        /* Keep track of updates to force a view update */
        @State private var updateIndex = 0
        private var jsContext = JSContext()

        func eval(code: String) -> JSValue! {
          return jsContext?.evaluateScript(code)
        }

        init() {
          let jsSource = """
              ${getJsSource(json, options)}
          """
          jsContext?.evaluateScript(jsSource)
        }
      `.trim()
      }

      var body: some View {
        VStack {
          ${!hasDyanmicData ? '' : `Text(String(updateIndex)).hidden()`}
          ${children}
        }
      }
    }
  `;

  if (options.prettier !== false) {
    try {
      str = format(str);
    } catch (err) {
      console.error(
        'Format error for file:',
        err,
        '\n\n',
        str,
        '\n\n\n',
        JSON.stringify(json, null, 2),
      );
    }
  }

  return str;
};
