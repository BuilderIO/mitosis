import { SELF_CLOSING_HTML_TAGS, VALID_HTML_TAGS } from '@/constants/html_tags';
import { HELPER_FUNCTIONS, hasFirstChildKeyAttribute } from '@/generators/angular/helpers';
import {
  addCodeNgAfterViewInit,
  addCodeToOnInit,
  addCodeToOnUpdate,
  makeReactiveState,
} from '@/generators/angular/helpers/hooks';
import { parse } from '@/generators/angular/parse-selector';
import { AngularBlockOptions, ToAngularOptions } from '@/generators/angular/types';
import { createSingleBinding } from '@/helpers/bindings';
import { checkIsBindingNativeEvent, checkIsEvent } from '@/helpers/event-handlers';
import isChildren from '@/helpers/is-children';
import { isMitosisNode } from '@/helpers/is-mitosis-node';
import { removeSurroundingBlock } from '@/helpers/remove-surrounding-block';
import { isSlotProperty, stripSlotPrefix, toKebabSlot } from '@/helpers/slots';
import { hashCodeAsString } from '@/symbols/symbol-processor';
import { BaseHook, MitosisComponent } from '@/types/mitosis-component';
import { Binding, MitosisNode, checkIsForNode } from '@/types/mitosis-node';
import { pipe } from 'fp-ts/function';
import { isString, kebabCase } from 'lodash';

const mappers: {
  [key: string]: (
    root: MitosisComponent,
    json: MitosisNode,
    options: ToAngularOptions,
    blockOptions: AngularBlockOptions,
  ) => string;
} = {
  Fragment: (root, json, options, blockOptions) => {
    return `<ng-container>${json.children
      .map((item) => blockToAngular({ root, json: item, options, blockOptions }))
      .join('\n')}</ng-container>`;
  },
  Slot: (root, json, options, blockOptions) => {
    const renderChildren = () =>
      json.children
        ?.map((item) => blockToAngular({ root, json: item, options, blockOptions }))
        .join('\n');

    return `<ng-content ${Object.entries({ ...json.bindings, ...json.properties })
      .map(([binding, value]) => {
        if (value && binding === 'name') {
          const selector = pipe(isString(value) ? value : value.code, stripSlotPrefix, kebabCase);
          return `select="[${selector}]"`;
        }
      })
      .join('\n')}>${Object.entries(json.bindings)
      .map(([binding, value]) => {
        if (value && binding !== 'name') {
          return value.code;
        }
      })
      .join('\n')}${renderChildren()}</ng-content>`;
  },
};

// TODO: Maybe in the future allow defining `string | function` as values
const BINDINGS_MAPPER: { [key: string]: string | undefined } = {
  innerHTML: 'innerHTML',
  style: 'ngStyle',
};

const handleNgOutletBindings = (node: MitosisNode, options: ToAngularOptions) => {
  let allProps = '';
  for (const key in node.properties) {
    if (key.startsWith('$')) {
      continue;
    }
    if (key === 'key') {
      continue;
    }
    const value = node.properties[key];
    allProps += `${key}: '${value}', `;
  }

  for (const key in node.bindings) {
    if (key.startsWith('"')) {
      continue;
    }
    if (key.startsWith('$')) {
      continue;
    }
    let { code, arguments: cusArgs = ['event'] } = node.bindings[key]!;
    if (options.state === 'class-properties') {
      code = `this.${code}`;

      if (node.bindings[key]?.type === 'spread') {
        allProps += `...${code}, `;
        continue;
      }
    }

    let keyToUse = key.includes('-') ? `'${key}'` : key;
    keyToUse = keyToUse.replace('state.', '').replace('props.', '');

    if (checkIsEvent(key)) {
      const { event, value } = processEventBinding(key, code, node.name, cusArgs[0]);
      allProps += `on${event.charAt(0).toUpperCase() + event.slice(1)}: ${value.replace(
        /\(.*?\)/g,
        '',
      )}.bind(this), `;
    } else {
      const codeToUse =
        options.state === 'inline-with-wrappers' ? processCodeBlockInTemplate(code) : code;
      allProps += `${keyToUse}: ${codeToUse}, `;
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

const handleObjectBindings = (code: string) => {
  let objectCode = code.replace(/^{/, '').replace(/}$/, '');
  objectCode = objectCode.replace(/\/\/.*\n/g, '');

  let temp = objectCode;

  //STEP 1. remove spread operator for expressions like '{ ...objectName }' and replace them with object name, example {...obj} => obj
  temp = temp.replace(/\{\s*\.\.\.(\w+)\s*}/g, '$1');
  //STEP 2. remove all remaining spread operators that could be nested somewhere deeper, example { ...obj, field1: value1 } => { obj, field1: value1 }
  temp = temp.replace(/\.\.\./g, '');
  //STEP 3. deal with consequences of STEP 2 - for all left field assignments we create new objects provided to useObjectWrapper,
  //and we get rid of surrounding brackets of the initial input value, example {...obj1,test:true,...obj2} => obj1, {test: true}, obj2
  temp = temp.replace(/(\s*\w+\s*:\s*((["'].+["'])|(\[.+])|([\w.]+)))(,|[\n\s]*)/g, `{ $1 },`);

  // handle template strings
  if (temp.includes('`')) {
    // template str
    let str = temp.match(/`[^`]*`/g);

    let values = str && str[0].match(/\${[^}]*}/g);
    let forValues = values?.map((val) => val.slice(2, -1)).join(' + ');

    if (str && forValues) {
      temp = temp.replace(str[0], forValues);
    }
  }

  return temp;
};

const processCodeBlockInTemplate = (code: string) => {
  // contains helper calls as Angular doesn't support JS expressions in templates
  if (code.startsWith('{') && code.includes('...')) {
    // Objects cannot be spread out directly in Angular so we need to use `useObjectWrapper`
    return `useObjectWrapper(${handleObjectBindings(code)})`;
  } else if (code.startsWith('Object.values')) {
    let stripped = code.replace('Object.values', '');
    return `useObjectDotValues${stripped}`;
  } else if (code.includes('JSON.stringify')) {
    let obj = code.match(/JSON.stringify\((.*)\)/);
    return `useJsonStringify(${obj})`;
  } else if (code.includes(' as ')) {
    const asIndex = code.indexOf('as');
    const asCode = code.slice(0, asIndex - 1);
    return `$any${asCode})`;
  } else {
    return `${code}`;
  }
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
  (node: MitosisNode, options: ToAngularOptions, blockOptions: AngularBlockOptions) =>
  ([key, binding]: [string, Binding | undefined]) => {
    if (key.startsWith('$') || key.startsWith('"') || key === 'key') {
      return;
    }
    if (binding?.type === 'spread') {
      return;
    }

    const keyToUse = BINDINGS_MAPPER[key] || key;
    const { code, arguments: cusArgs = ['event'] } = binding!;
    // TODO: proper babel transform to replace. Util for this

    if (checkIsEvent(keyToUse)) {
      const { event, value } = processEventBinding(keyToUse, code, node.name, cusArgs[0]);

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
      const codeToUse =
        options.state === 'inline-with-wrappers' ? processCodeBlockInTemplate(code) : code;
      return `[${keyToUse}]="${codeToUse}"`;
    }
  };

export const blockToAngular = ({
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
  const childComponents = blockOptions?.childComponents || [];

  if (mappers[json.name]) {
    return mappers[json.name](root, json, options, blockOptions);
  }

  if (isChildren({ node: json })) {
    return `<ng-content></ng-content>`;
  }

  if (json.properties._text) {
    return json.properties._text;
  }
  const textCode = json.bindings._text?.code;
  if (textCode) {
    if (isSlotProperty(textCode)) {
      return `<ng-content select="[${toKebabSlot(textCode)}]"></ng-content>`;
    }

    if (textCode.includes('JSON.stringify')) {
      const obj = textCode.replace(/JSON.stringify\(\s*(\w+)\s*,?.*\)/, '$1');
      return `{{${obj} | json}}`;
    }

    return `{{${textCode}}}`;
  }

  let str = '';

  if (checkIsForNode(json)) {
    const indexName = json.scope.indexName;
    const forName = json.scope.forName;

    // Check if "key" is present for the first child of the for loop
    if (hasFirstChildKeyAttribute(json)) {
      const fnIndex = (root.meta?._trackByForIndex as number) || 0;
      const trackByFnName = `trackBy${
        forName ? forName.charAt(0).toUpperCase() + forName.slice(1) : ''
      }${fnIndex}`;
      root.meta._trackByForIndex = fnIndex + 1;
      let code = json.children[0].bindings.key?.code;

      root.state[trackByFnName] = {
        code: `${trackByFnName}(${indexName ?? '_'}, ${forName}) { return ${code}; }`,
        type: 'method',
      };

      str += `<ng-container *ngFor="let ${forName ?? '_'} of ${json.bindings.each?.code}${
        indexName ? `; index as ${indexName}` : ''
      }; trackBy: ${trackByFnName}">`;
    } else {
      str += `<ng-container *ngFor="let ${forName ?? '_'} of ${json.bindings.each?.code}${
        indexName ? `; index as ${indexName}` : ''
      }">`;
    }
    str += json.children
      .map((item) => blockToAngular({ root, json: item, options, blockOptions }))
      .join('\n');
    str += `</ng-container>`;
  } else if (json.name === 'Show') {
    let condition = json.bindings.when?.code;
    if (options.state === 'inline-with-wrappers' && condition?.includes('typeof')) {
      let wordAfterTypeof = condition.split('typeof')[1].trim().split(' ')[0];
      condition = condition.replace(`typeof ${wordAfterTypeof}`, `useTypeOf(${wordAfterTypeof})`);
    }
    str += `<ng-container *ngIf="${condition}">`;
    str += json.children
      .map((item) => blockToAngular({ root, json: item, options, blockOptions }))
      .join('\n');
    str += `</ng-container>`;
    // else condition
    if (isMitosisNode(json.meta?.else)) {
      str += `<ng-container *ngIf="!(${condition})">`;
      str += blockToAngular({ root, json: json.meta.else, options, blockOptions });
      str += `</ng-container>`;
    }
  } else if (json.name.includes('.')) {
    const elSelector = childComponents.find((impName) => impName === json.name)
      ? kebabCase(json.name)
      : json.name;

    let allProps = handleNgOutletBindings(json, options);
    if (options.state === 'class-properties') {
      const inputsPropsStateName = `mergedInputs_${hashCodeAsString(allProps)}`;
      root.state[inputsPropsStateName] = {
        code: '{}' + (options.typescript ? ' as any' : ''),
        type: 'property',
      };
      if (!root.hooks.onInit?.code.includes(inputsPropsStateName)) {
        addCodeToOnInit(root, `this.${inputsPropsStateName} = {${allProps}};`);
      }
      if (
        !root.hooks.onUpdate
          ?.map((hook) => hook.code)
          .join('')
          .includes(inputsPropsStateName)
      ) {
        addCodeToOnUpdate(root, `this.${inputsPropsStateName} = {${allProps}};`);
      }
      allProps = `${inputsPropsStateName}`;
    } else {
      allProps = `{ ${allProps} }`;
    }

    str += `<ng-container *ngComponentOutlet="
      ${elSelector.replace('state.', '').replace('props.', '')};
      inputs: ${allProps};
      content: myContent;
      ">  `;

    str += `</ng-container>`;
  } else {
    let element: string | null = null,
      classNames: string[] = [],
      attributes;

    const isComponent = childComponents.find((impName) => impName === json.name);
    const tagName = json.properties.$tagName;
    const selector = json.meta.selector || blockOptions?.selector;
    if (selector) {
      try {
        ({ element, classNames, attributes } = parse(`${selector}`));
      } catch {
        element = tagName ?? kebabCase(json.name);
      }
    }
    if (!element) {
      if (isComponent) {
        element = tagName ?? kebabCase(json.name);
      } else {
        element = tagName ?? json.name;
      }
    }

    str += `<${element} `;

    // TODO: merge with existing classes/bindings
    if (classNames.length) {
      str += `class="${classNames.join(' ')}" `;
    }

    // TODO: Merge with existing properties
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        if (value) {
          str += `${key}=${JSON.stringify(value)} `;
        } else {
          str += `${key} `;
        }
      });
    }

    for (const key in json.properties) {
      if (key.startsWith('$')) {
        continue;
      }
      const value = json.properties[key];
      str += ` ${key}="${value}" `;
    }

    for (const key in json.bindings) {
      if (json.bindings[key]?.type === 'spread' && VALID_HTML_TAGS.includes(json.name.trim())) {
        if (json.bindings[key]?.code === 'this') {
          // if its an arbitrary { ...props } spread then we skip because Angular needs a named prop to be defined
          continue;
        }

        let refName = '';
        if (json.bindings['spreadRef']?.code) {
          refName = json.bindings['spreadRef'].code;
        } else {
          const spreadRefIndex = root.meta._spreadRefIndex || 0;
          refName = `elRef${spreadRefIndex}`;
          root.meta._spreadRefIndex = (spreadRefIndex as number) + 1;
          json.bindings['spreadRef'] = createSingleBinding({ code: refName });
          root.refs[refName] = { argument: '' };
        }
        json.bindings['spreadRef'] = createSingleBinding({ code: refName });
        root.refs[refName] = { argument: '' };
        root.meta.onViewInit = (root.meta.onViewInit || { code: '' }) as BaseHook;
        let spreadCode = '';
        let changesCode = '';
        if (json.bindings[key]?.code.startsWith('{')) {
          json.meta._spreadStateRef = json.meta._spreadStateRef || 0;
          const name = `${refName}_state_${json.meta._spreadStateRef}`;
          json.meta._spreadStateRef = (json.meta._spreadStateRef as number) + 1;
          makeReactiveState(root, name, `this.${name} = ${json.bindings[key]?.code};`);
          spreadCode = `this.${name}`;
          changesCode = `changes['${spreadCode.replace('this.', '')}']?.currentValue`;
        } else {
          spreadCode = `${json.bindings[key]?.code}`;
          changesCode = `changes['${spreadCode.replace('this.', '')}']?.currentValue`;
        }
        addCodeNgAfterViewInit(
          root,
          `\nthis.setAttributes(this.${refName}?.nativeElement, ${spreadCode});`,
        );

        addCodeToOnUpdate(
          root,
          `this.setAttributes(this.${refName}?.nativeElement, ${spreadCode}${
            changesCode ? `, ${changesCode}` : ''
          });`,
        );
        if (!root.state['setAttributes']) {
          root.state['setAttributes'] = {
            code: HELPER_FUNCTIONS(options?.typescript).setAttributes as string,
            type: 'method',
          };
        }
      }
    }

    const stringifiedBindings = Object.entries(json.bindings)
      .map(stringifyBinding(json, options, blockOptions))
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
        .map((item) => blockToAngular({ root, json: item, options, blockOptions }))
        .join('\n');
    }

    str += `</${element}>`;
  }
  return str;
};
