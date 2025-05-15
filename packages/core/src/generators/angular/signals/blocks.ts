import { SELF_CLOSING_HTML_TAGS, VALID_HTML_TAGS } from '@/constants/html_tags';
import { HELPER_FUNCTIONS, hasFirstChildKeyAttribute } from '@/generators/angular/helpers';
import { parseSelector } from '@/generators/angular/helpers/parse-selector';
import { createObjectSpreadComputed } from '@/generators/angular/signals/helpers/get-computed';
import { AngularBlockOptions, ToAngularOptions } from '@/generators/angular/types';
import { babelTransformExpression } from '@/helpers/babel-transform';
import { createSingleBinding } from '@/helpers/bindings';
import {
  checkIsBindingNativeEvent,
  checkIsEvent,
  getEventNameWithoutOn,
} from '@/helpers/event-handlers';
import isChildren from '@/helpers/is-children';
import { isMitosisNode } from '@/helpers/is-mitosis-node';
import { stripSlotPrefix } from '@/helpers/slots';
import { hashCodeAsString } from '@/symbols/symbol-processor';
import { MitosisComponent } from '@/types/mitosis-component';
import { Binding, ForNode, MitosisNode } from '@/types/mitosis-node';
import { isCallExpression } from '@babel/types';
import { pipe } from 'fp-ts/function';
import { isString, kebabCase } from 'lodash';
import { addCodeNgAfterViewInit, addCodeToOnUpdate } from '../helpers/hooks';

const getChildren = (
  root: MitosisComponent,
  json: MitosisNode,
  options: ToAngularOptions,
  blockOptions: AngularBlockOptions,
): string =>
  json.children
    ?.map((item) => blockToAngularSignals({ root, json: item, options, blockOptions }))
    .join('\n');

const MAPPERS: {
  [key: string]: (
    root: MitosisComponent,
    json: MitosisNode,
    options: ToAngularOptions,
    blockOptions: AngularBlockOptions,
  ) => string;
} = {
  Fragment: (root, json, options, blockOptions) => {
    const children = getChildren(root, json, options, blockOptions);
    // TODO: Handle `key`?
    return `<ng-container>${children}</ng-container>`;
  },
  Slot: (root, json, options, blockOptions) => {
    const children = getChildren(root, json, options, blockOptions);

    const namedSlotTransform = Object.entries({ ...json.bindings, ...json.properties })
      .map(([binding, value]) => {
        if (value && binding === 'name') {
          const selector = pipe(isString(value) ? value : value.code, stripSlotPrefix, kebabCase);
          return `select="[${selector}]"`;
        }
      })
      .join('\n');
    return `<ng-content ${namedSlotTransform}>
${children}
</ng-content>`;
  },
  For: (root, json, options, blockOptions) => {
    const forNode = json as ForNode;
    const indexName = forNode.scope.indexName;
    const forName = forNode.scope.forName;

    let trackByFnName;
    // Check if "key" is present for the first child of the for loop
    if (hasFirstChildKeyAttribute(forNode)) {
      const fnIndex = (root.meta?._trackByForIndex as number) || 0;
      trackByFnName = `trackBy${
        forName ? forName.charAt(0).toUpperCase() + forName.slice(1) : ''
      }${fnIndex}`;
      root.meta._trackByForIndex = fnIndex + 1;
      let code = forNode.children[0].bindings.key?.code;

      root.state[trackByFnName] = {
        code: `${trackByFnName}(${indexName ?? '_'}: number, ${forName}: any) { return ${code}; }`,
        type: 'method',
      };
    }

    const children = getChildren(root, json, options, blockOptions);
    const item = forName ?? '_';
    const of = forNode.bindings.each?.code;
    const track = `track ${
      trackByFnName
        ? `${trackByFnName}(${indexName ?? 'i'}, ${forName})`
        : indexName
        ? indexName
        : 'i'
    };`;
    const index = indexName ? `let ${indexName} = $index` : 'let i = $index';

    return `
    @for (${item} of ${of};${track}${index}) {
      ${children}
     }
    `;
  },
  Show: (root, json, options, blockOptions) => {
    let condition = json.bindings.when?.code;
    const children = getChildren(root, json, options, blockOptions);

    let elseBlock = '';
    // else condition
    if (isMitosisNode(json.meta?.else)) {
      elseBlock = `@else{
      ${blockToAngularSignals({ root, json: json.meta.else, options, blockOptions })}
      }`;
    }

    if (condition?.includes('children()')) {
      console.error(`
${json.name}: You can't use children() in a Show block for \`when\` targeting angular.
Try to invert it like this: 
"<Show when={props.label} else={props.children}>{props.label}</Show>"
`);
    }

    return `@if(${condition}){
    ${children}
    }${elseBlock}`;
  },
};

// TODO: Maybe in the future allow defining `string | function` as values
const BINDINGS_MAPPER: { [key: string]: string | undefined } = {
  innerHTML: 'innerHTML',
  style: 'ngStyle',
};

const handleDynamicComponentBindings = (node: MitosisNode) => {
  let allProps = '';

  for (const key in node.properties) {
    if (key.startsWith('$') || key === 'key') {
      continue;
    }
    const value = node.properties[key];
    allProps += `${key}: '${value}', `;
  }

  for (const key in node.bindings) {
    if (key.startsWith('"') || key.startsWith('$') || key === 'key') {
      continue;
    }
    const { code } = node.bindings[key]!;

    if (key === 'ref') {
      allProps += `${key}: this.${code}(), `;
      continue;
    }

    if (node.bindings[key]?.type === 'spread') {
      allProps += `...${code}, `;
      continue;
    }

    let keyToUse = key.includes('-') ? `'${key}'` : key;
    keyToUse = keyToUse.replace('state.', '').replace('props.', '');

    if (checkIsEvent(key)) {
      const eventName = getEventNameWithoutOn(key);
      allProps += `on${eventName.charAt(0).toUpperCase() + eventName.slice(1)}: ${code.replace(
        /\(.*?\)/g,
        '',
      )}.bind(this), `;
    } else {
      allProps += `${keyToUse}: ${code}, `;
    }
  }

  if (allProps.endsWith(', ')) {
    allProps = allProps.slice(0, -2);
  }

  if (allProps.startsWith(', ')) {
    allProps = allProps.slice(2);
  }

  return allProps;
};

const codeSetAttributes = (refName: string, code: string) => {
  return `this.setAttributes(this.${refName}()?.nativeElement, ${code});`;
};

const saveSpreadRef = (root: MitosisComponent, refName: string) => {
  root.compileContext = root.compileContext || {};
  root.compileContext.angular = root.compileContext.angular || { extra: {} };
  root.compileContext.angular.extra = root.compileContext.angular.extra || {};
  root.compileContext.angular.extra.spreadRefs = root.compileContext.angular.extra.spreadRefs || [];
  root.compileContext.angular.extra.spreadRefs.push(refName);
};

const handleSpreadBinding = (node: MitosisNode, binding: Binding, root: MitosisComponent) => {
  if (VALID_HTML_TAGS.includes(node.name.trim())) {
    if (binding.code === 'this') {
      // if its an arbitrary { ...props } spread then we skip because Angular needs a named prop to be defined
      return;
    }

    let refName = '';
    if (node.meta._spreadRefName) {
      refName = node.meta._spreadRefName as string;
      const shouldAddRef = !node.meta._spreadRefAdded;
      node.meta._spreadRefAdded = true;

      addCodeToOnUpdate(root, codeSetAttributes(refName, binding.code));
      addCodeNgAfterViewInit(root, codeSetAttributes(refName, binding.code));

      return shouldAddRef ? `#${refName} ` : '';
    }

    const spreadRefIndex = root.meta._spreadRefIndex || 0;
    refName = `elRef${spreadRefIndex}`;
    root.meta._spreadRefIndex = (spreadRefIndex as number) + 1;

    node.meta._spreadRefName = refName;
    node.meta._spreadRefAdded = true;

    node.bindings['spreadRef'] = createSingleBinding({ code: refName });
    if (!root.refs[refName]) {
      root.refs[refName] = { argument: '' };
    }

    if (!root.state['_listenerFns']) {
      root.state['_listenerFns'] = {
        code: 'new Map()',
        type: 'property',
      };
    }

    addCodeToOnUpdate(root, codeSetAttributes(refName, binding.code));
    addCodeNgAfterViewInit(root, codeSetAttributes(refName, binding.code));

    if (!root.state['setAttributes']) {
      root.state['setAttributes'] = {
        code: HELPER_FUNCTIONS(true).setAttributes,
        type: 'method',
      };
    }

    if (!root.hooks.onUnMount) {
      root.hooks.onUnMount = {
        code: `
          for (const fn of this._listenerFns.values()) {
            fn();
          }
        `,
      };
    }

    saveSpreadRef(root, refName);

    return `#${refName} `;
  }
};

const stringifyBinding =
  (node: MitosisNode, blockOptions: AngularBlockOptions, root: MitosisComponent) =>
  ([key, binding]: [string, Binding | undefined]) => {
    if (key.startsWith('$') || key.startsWith('"') || key === 'key') {
      return;
    }
    if (binding?.type === 'spread') {
      return handleSpreadBinding(node, binding, root);
    }

    const keyToUse = BINDINGS_MAPPER[key] || key;

    if (!binding) return '';

    const { code } = binding;

    if (checkIsEvent(keyToUse)) {
      const args: string[] = binding.arguments || [];
      const event = getEventNameWithoutOn(keyToUse);

      if (code.includes('event.target.')) {
        console.error(`
Component ${node.name} has an event ${event} that uses 'event.target.xxx'. 
This will cause an error in Angular.
Please create a new function with the EventTarget and use e.g:
'(event.target as HTMLInputElement).value'`);
      }

      const value = babelTransformExpression(code, {
        Identifier(path) {
          // Only change arguments inside a call expression or event
          if (
            (isCallExpression(path.parent) && args.includes(path.node.name)) ||
            path.node.name === 'event'
          ) {
            path.node.name = '$event';
          }
        },
      });

      // native events are all lowerCased
      const lowerCaseEvent = event.toLowerCase();
      const eventKey =
        checkIsBindingNativeEvent(event) ||
        blockOptions.nativeEvents?.find(
          (nativeEvent) =>
            nativeEvent === keyToUse || nativeEvent === event || nativeEvent === lowerCaseEvent,
        )
          ? lowerCaseEvent
          : event;
      return ` (${eventKey})="${value}"`;
    } else if (keyToUse === 'class') {
      return ` [class]="${code}" `;
    } else if (keyToUse === 'ref' || keyToUse === 'spreadRef') {
      return ` #${code} `;
    } else if (
      (VALID_HTML_TAGS.includes(node.name.trim()) || keyToUse.includes('-')) &&
      !blockOptions.nativeAttributes?.includes(keyToUse) &&
      !Object.values(BINDINGS_MAPPER).includes(keyToUse)
    ) {
      // standard html elements need the attr to satisfy the compiler in many cases: eg: svg elements and [fill]
      return ` [attr.${keyToUse}]="${code}" `;
    } else if (keyToUse === 'innerHTML') {
      return blockOptions.sanitizeInnerHTML
        ? ` [innerHTML]="${code}" `
        : ` [innerHTML]="sanitizer.bypassSecurityTrustHtml(${code})" `;
    } else {
      if ((code.startsWith('{') && code.includes('...')) || code.includes(' as ')) {
        const computedName = createObjectSpreadComputed(root, binding, key);
        return `[${keyToUse}]="${computedName}()"`;
      }
      return `[${keyToUse}]="${code}"`;
    }
  };

const getElementTag = (json: MitosisNode, blockOptions?: AngularBlockOptions) => {
  const childComponents = blockOptions?.childComponents || [];
  let element,
    classNames: string[] = [],
    attributes;

  const isComponent = childComponents.find((impName) => impName === json.name);
  if (isComponent) {
    const selector = json.meta.selector;
    if (selector) {
      try {
        ({ element, classNames, attributes } = parseSelector(`${selector}`));
      } catch {
        element = kebabCase(json.name);
      }
    } else {
      element = kebabCase(json.name);
    }
  } else {
    element = json.name;
  }

  let additionalString = '';
  // TODO: merge with existing classes/bindings
  if (classNames.length) {
    additionalString += `class="${classNames.join(' ')}" `;
  }

  // TODO: Merge with existing properties
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value) {
        additionalString += `${key}=${JSON.stringify(value)} `;
      } else {
        additionalString += `${key} `;
      }
    });
  }

  return { element, additionalString };
};

export const blockToAngularSignals = ({
  root,
  json,
  options = {},
  blockOptions = {
    nativeAttributes: [],
    nativeEvents: [],
  },
  rootRef,
}: {
  root: MitosisComponent;
  json: MitosisNode;
  options?: ToAngularOptions;
  rootRef?: string;
  blockOptions?: AngularBlockOptions;
}): string => {
  if (MAPPERS[json.name]) {
    return MAPPERS[json.name](root, json, options, blockOptions);
  }

  if (isChildren({ node: json })) {
    return `<ng-content></ng-content>`;
  }

  if (json.properties._text) {
    return json.properties._text;
  }

  const textCode = json.bindings._text?.code;
  if (textCode) {
    return `{{${textCode}}}`;
  }

  let str = '';

  // Handle dynamic components, state.MyComponent / props.MyComponent
  if (json.name.includes('.')) {
    const elSelector = blockOptions.childComponents?.find((impName) => impName === json.name)
      ? kebabCase(json.name)
      : json.name;

    const elSelectorProcessed = elSelector.replace('state.', '').replace('props.', '');
    const dynamicComponentRef = elSelectorProcessed.replace(/^this\.([^.]+)/, '$1()');

    let allProps = handleDynamicComponentBindings(json);
    const computedName = `dynamicProps_${hashCodeAsString(allProps)}`;

    if (allProps) {
      if (!root.state[computedName]) {
        root.state[computedName] = {
          code: `get ${computedName}() { 
          return { ${allProps} };
        }`,
          type: 'getter',
        };
      }
    }

    str += `<ng-container *ngComponentOutlet="
      ${dynamicComponentRef};${allProps ? `\ninputs: ${computedName}();` : ''}
      content: myContent();
      ">  `;

    str += `</ng-container>`;
    return str;
  }

  const { element, additionalString } = getElementTag(json, blockOptions);
  str += `<${element} ${additionalString}`;

  for (const key in json.properties) {
    const value = json.properties[key];
    str += ` ${key}="${value}" `;
  }

  const stringifiedBindings = Object.entries(json.bindings)
    .map(stringifyBinding(json, blockOptions, root))
    .join('');

  str += stringifiedBindings;

  if (rootRef && !str.includes(`#${rootRef}`)) {
    // Add ref for passing attributes
    str += `#${rootRef}`;
  }

  if (SELF_CLOSING_HTML_TAGS.has(json.name)) {
    return str + ' />';
  }
  str += '>';

  if (json.children) {
    str += json.children
      .map((item) => blockToAngularSignals({ root, json: item, options, blockOptions }))
      .join('\n');
  }

  str += `</${element}>`;

  return str;
};
