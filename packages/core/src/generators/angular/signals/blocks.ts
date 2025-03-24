import { SELF_CLOSING_HTML_TAGS, VALID_HTML_TAGS } from '@/constants/html_tags';
import { hasFirstChildKeyAttribute } from '@/generators/angular/helpers';
import { parseSelector } from '@/generators/angular/helpers/parse-selector';
import { AngularBlockOptions, ToAngularOptions } from '@/generators/angular/types';
import { babelTransformExpression } from '@/helpers/babel-transform';
import {
  checkIsBindingNativeEvent,
  checkIsEvent,
  getEventNameWithoutOn,
} from '@/helpers/event-handlers';
import isChildren from '@/helpers/is-children';
import { isMitosisNode } from '@/helpers/is-mitosis-node';
import { removeSurroundingBlock } from '@/helpers/remove-surrounding-block';
import { stripSlotPrefix } from '@/helpers/slots';
import { throwError } from '@/helpers/throw-error';
import { MitosisComponent } from '@/types/mitosis-component';
import { Binding, ForNode, MitosisNode } from '@/types/mitosis-node';
import { isCallExpression } from '@babel/types';
import { pipe } from 'fp-ts/function';
import { isString, kebabCase } from 'lodash';

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
        code: `${trackByFnName}(${indexName ?? '_'}, ${forName}) { return ${code}; }`,
        type: 'method',
      };
    }

    const children = getChildren(root, json, options, blockOptions);
    const item = forName ?? '_';
    const of = forNode.bindings.each?.code;
    const track = `track ${trackByFnName ? trackByFnName : indexName ? indexName : 'i'};`;
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
      throwError(`${json.name}: You can't use children() in a Show block for \`when\` targeting angular.
      Try to invert it like this: "<Show when={props.label} else={props.children}>{props.label}</Show>"`);
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

const processEventBinding = (key: string, code: string, nodeName: string, customArg: string) => {
  let event = key.replace('on', '');
  event = event.charAt(0).toLowerCase() + event.slice(1);

  // TODO: proper babel transform to replace. Util for this
  const eventName = customArg;
  const regexp = new RegExp(
    '(^|\\n|\\r| |;|\\(|\\[|!)' + eventName + '(\\?\\.|\\.|\\(| |;|\\)|$)',
    'g',
  );
  const replacer = '$1$event$2';
  const finalValue = removeSurroundingBlock(code.replace(regexp, replacer));
  return {
    event,
    value: finalValue,
  };
};

const stringifyBinding =
  (node: MitosisNode, blockOptions: AngularBlockOptions) =>
  ([key, binding]: [string, Binding | undefined]) => {
    if (key.startsWith('$') || key.startsWith('"') || key === 'key') {
      return;
    }
    if (binding?.type === 'spread') {
      return;
    }

    const keyToUse = BINDINGS_MAPPER[key] || key;

    if (!binding) return '';

    const { code } = binding;

    if (checkIsEvent(keyToUse)) {
      const args: string[] = binding.arguments || [];
      const event = getEventNameWithoutOn(keyToUse);

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

  const { element, additionalString } = getElementTag(json, blockOptions);
  str += `<${element} ${additionalString}`;

  for (const key in json.properties) {
    const value = json.properties[key];
    str += ` ${key}="${value}" `;
  }

  const stringifiedBindings = Object.entries(json.bindings)
    .map(stringifyBinding(json, blockOptions))
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
