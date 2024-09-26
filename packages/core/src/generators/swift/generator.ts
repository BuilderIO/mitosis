import { ToSwiftOptions } from '@/generators/swift/types';
import traverse from 'neotraverse/legacy';
import { dedent } from '../../helpers/dedent';
import { fastClone } from '../../helpers/fast-clone';
import { filterEmptyTextNodes } from '../../helpers/filter-empty-text-nodes';
import { format } from '../../helpers/generic-format';
import { getStateObjectStringFromComponent } from '../../helpers/get-state-object-string';
import { getStyles } from '../../helpers/get-styles';
import isChildren from '../../helpers/is-children';
import { isMitosisNode } from '../../helpers/is-mitosis-node';
import { checkHasState } from '../../helpers/state';
import { tryPrettierFormat } from '../../helpers/try-prettier-format';
import { MitosisComponent } from '../../types/mitosis-component';
import { checkIsForNode, MitosisNode } from '../../types/mitosis-node';
import { MitosisStyles } from '../../types/mitosis-styles';
import { TranspilerGenerator } from '../../types/transpiler';

const scrolls = (json: MitosisNode) => {
  return getStyles(json)?.overflow === 'auto';
};

const mappers: {
  [key: string]: (json: MitosisNode, options: ToSwiftOptions) => string;
} = {
  Fragment: (json, options) => {
    return `${json.children.map((item) => blockToSwift(item, options)).join('\n')}`;
  },
  link: () => '',
  Image: (json, options) => {
    return (
      `Image(${
        processBinding(json.bindings.image?.code as string, options) || `"${json.properties.image}"`
      })` +
      getStyleString(json, options) +
      getActionsString(json, options)
    );
  },
  input: (json, options) => {
    const name = json.properties.$name;
    let str =
      `TextField(${
        json.bindings.placeholder
          ? processBinding(json.bindings.placeholder?.code as string, options)
          : json.properties.placeholder
          ? JSON.stringify(json.bindings.placeholder!.code)
          : '""'
      }, text: $${name})` +
      getStyleString(json, options) +
      getActionsString(json, options);

    if (json.bindings.onChange) {
      str += `
        .onChange(of: ${name}) { ${name} in 
          ${processBinding(
            wrapAction(
              `var event = { target: { value: "\\(${name})" } };
              ${json.bindings.onChange?.code}`,
            ),
            options,
          )} 
        }`;
    }

    return str;
  },
};

const blockToSwift = (json: MitosisNode, options: ToSwiftOptions): string => {
  if (mappers[json.name]) {
    return mappers[json.name](json, options);
  }

  // TODO: Add support for `{props.children}` bindings
  // Right now we return an empty string because the generated code
  // is very likely wrong.
  if (isChildren({ node: json })) {
    return '/* `props.children` is not supported yet for SwiftUI */';
  }

  if (json.properties._text) {
    if (!json.properties._text.trim().length) {
      return '';
    }
    return `Text("${json.properties._text.trim().replace(/\s+/g, ' ')}")`;
  }
  if (json.bindings._text) {
    return `Text(${processBinding(json.bindings._text.code as string, options)}.toString())`;
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
      ? scrolls(json)
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

  if (checkIsForNode(json)) {
    str += `ForEach(${processBinding(
      json.bindings.each?.code as string,
      options,
    )}, id: \\.self) { ${json.scope.forName} in ${children
      .map((item) => blockToSwift(item, options))
      .join('\n')} }`;
  } else if (json.name === 'Show') {
    str += `if ${processBinding(json.bindings.when?.code as string, options)} {
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
      str += json.children.map((item) => blockToSwift(item, options)).join('\n');
    }

    str += `}`;
    str += getStyleString(json, options);
    str += getActionsString(json, options);
  }

  return str;
};

const wrapAction = (str: string) => `(() => { ${str} })()`;

function getActionsString(json: MitosisNode, options: ToSwiftOptions): string {
  let str = '';
  if (json.bindings.onClick) {
    str += `\n.onTapGesture {
      ${processBinding(wrapAction(json.bindings.onClick.code as string), options)}
    }`;
  }
  return str;
}

function getStyleString(node: MitosisNode, options: ToSwiftOptions): string {
  const style = getStyles(node);
  let str = '';
  for (const key in style) {
    let useKey = key;
    const rawValue = style[key as keyof MitosisStyles]!;
    let value: number | string = `"${rawValue}"`;
    if (['padding', 'margin'].includes(key)) {
      // TODO: throw error if calc()
      value = parseFloat(rawValue as string);
      str += `\n.${useKey}(${value})`;
    } else if (key === 'color') {
      useKey = 'foregroundColor';
      // TODO: convert to RBG and use Color(red: ..., ....)
    } else {
      console.warn(`Styling key "${key}" is not supported`);
    }
  }

  return str;
}

function getJsSource(json: MitosisComponent, options: ToSwiftOptions) {
  const str = `const state = new Proxy(${getStateObjectStringFromComponent(json)}, {
    set: (target, key, value) => {
      const returnVal = Reflect.set(target, key, value);
      update();
      return returnVal;
    }
  });`;
  if (options.prettier === false) {
    return str.trim();
  } else {
    return tryPrettierFormat(str, 'typescript').trim();
  }
}

const processBinding = (str: string, options: ToSwiftOptions) => {
  // Use triple quotes for multiline strings or strings including '"'
  if (str.includes('\n') || str.includes('"')) {
    return `eval(code: """
      ${str}
      """)`;
  }
  // Use double quotes for simple strings
  return `eval(code: "${str}")`;
};

function componentHasDynamicData(json: MitosisComponent) {
  const hasState = checkHasState(json);
  if (hasState) {
    return true;
  }
  let found = false;
  traverse(json).forEach(function (node) {
    if (isMitosisNode(node)) {
      if (Object.keys(node.bindings).filter((item) => item !== 'css').length) {
        found = true;
        this.stop();
      }
    }
  });

  return found;
}

function mapDataForSwiftCompatability(json: MitosisComponent) {
  let inputIndex = 0;
  json.meta.inputNames = json.meta.inputNames || [];

  traverse(json).forEach(function (node) {
    if (isMitosisNode(node)) {
      if (node.name === 'input') {
        if (!Object.keys(node.bindings).filter((item) => item !== 'css').length) {
          return;
        }
        if (!node.properties.$name) {
          node.properties.$name = `input${++inputIndex}`;
        }
        (json.meta.inputNames as Record<string, string>)[node.properties.$name] =
          node.bindings.value?.code || '';
      }
    }
  });
}

function getInputBindings(json: MitosisComponent, options: ToSwiftOptions) {
  let str = '';
  const inputNames = json.meta.inputNames as Record<string, string>;
  if (!inputNames) {
    return str;
  }

  for (const item in inputNames) {
    str += `\n@State private var ${item}: String = ""`;
  }
  return str;
}
export const componentToSwift: TranspilerGenerator<ToSwiftOptions> =
  (options = {}) =>
  ({ component }) => {
    const json = fastClone(component);
    mapDataForSwiftCompatability(json);

    const hasDyanmicData = componentHasDynamicData(json);

    let children = json.children.map((item) => blockToSwift(item, options)).join('\n');

    const hasInputNames = Object.keys(json.meta.inputNames || {}).length > 0;

    let str = dedent`
    import SwiftUI
    ${
      !hasDyanmicData
        ? ''
        : `import JavaScriptCore
    
    final class UpdateTracker: ObservableObject {
        @Published var value = 0;
    
        func update() {
            value += 1
        }
    }
    `
    }

    struct ${component.name}: View {
      ${
        !hasDyanmicData
          ? ''
          : `
        @ObservedObject var updateTracker = UpdateTracker()
        private var jsContext = JSContext()
        ${getInputBindings(json, options)}

        func eval(code: String) -> JSValue! {
          return jsContext?.evaluateScript(code)
        }

        ${
          !hasInputNames
            ? ''
            : `
        func setComputedState() {
          ${Object.keys(json.meta.inputNames || {})
            .map((item) => {
              return `${item} = ${processBinding(
                (json.meta.inputNames as Record<string, string>)[item],
                options,
              )}.toString()!`;
            })
            .join('\n')}
        }`
        }

        init() {
          let jsSource = """
              ${getJsSource(json, options)}
          """
          jsContext?.exceptionHandler = { context, exception in
            print("JS Error: \\(exception!)") 
          }

          let updateRef = updateTracker.update
          let updateFn : @convention(block) () -> Void = { updateRef() }
          jsContext?.setObject(updateFn, forKeyedSubscript: "update" as NSString)

          jsContext?.evaluateScript(jsSource)
        }
      `.trim()
      }

      var body: some View {
        VStack {
          ${children}
        }${
          !hasInputNames
            ? ''
            : `
        .onAppear {
          setComputedState()
        }
        `
        }
      }
    }
  `;

    if (options.prettier !== false) {
      str = format(str);
    }

    return str;
  };
