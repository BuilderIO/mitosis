import { makeReactiveState } from '@/generators/angular/helpers/hooks';
import { createSingleBinding } from '@/helpers/bindings';
import { checkIsEvent } from '@/helpers/event-handlers';
import isChildren from '@/helpers/is-children';
import { isMitosisNode } from '@/helpers/is-mitosis-node';
import { traverseNodes } from '@/helpers/traverse-nodes';
import { MitosisComponent } from '@/types/mitosis-component';
import { MitosisNode } from '@/types/mitosis-node';
import { MitosisPlugin } from '@/types/plugins';

const isASimpleProperty = (code: string) => {
  const expressions = ['==', '===', '!=', '!==', '<', '>', '<=', '>='];
  const invalidChars = ['{', '}', '(', ')', 'typeof'];

  return !invalidChars.some((char) => code.includes(char)) && !expressions.includes(code);
};

const generateNewBindingName = (index: number, name: string) =>
  `node_${index}_${name.replaceAll('.', '_').replaceAll('-', '_')}`;

const handleBindings = (
  json: MitosisComponent,
  item: MitosisNode,
  index: number,
  forName?: string,
  indexName?: string,
) => {
  for (const key in item.bindings) {
    if (
      key.startsWith('"') ||
      key.startsWith('$') ||
      key === 'css' ||
      key === 'ref' ||
      isASimpleProperty(item.bindings[key]!.code)
    ) {
      continue;
    }

    const newBindingName = generateNewBindingName(index, item.name);

    if (forName) {
      if (item.name === 'For') continue;
      if (key === 'key') continue;

      if (checkIsEvent(key)) {
        const { arguments: cusArgs = ['event'] } = item.bindings[key]!;
        const eventBindingName = `${generateNewBindingName(index, item.name)}_event`;
        if (
          item.bindings[key]?.code.trim().startsWith('{') &&
          item.bindings[key]?.code.trim().endsWith('}')
        ) {
          const forAndIndex = `${forName ? `, ${forName}` : ''}${
            indexName ? `, ${indexName}` : ''
          }`;
          const eventArgs = `${cusArgs.join(', ')}${forAndIndex}`;
          json.state[eventBindingName] = {
            code: `(${eventArgs}) => ${item.bindings[key]!.code}`,
            type: 'function',
          };
          item.bindings[key]!.code = `state.${eventBindingName}(${eventArgs})`;
          json.state[newBindingName] = {
            code: `(${eventArgs}) => (${item.bindings[key]!.code})`,
            type: 'function',
          };
          item.bindings[key]!.code = `state.${newBindingName}($${eventArgs})`;
        }
      } else {
        json.state[newBindingName] = {
          code: `(${forName}${indexName ? `, ${indexName}` : ''}) => (${item.bindings[key]!.code})`,
          type: 'function',
        };
        item.bindings[key]!.code = `state.${newBindingName}(${forName}${
          indexName ? `, ${indexName}` : ''
        })`;
      }
    } else if (item.bindings[key]?.code) {
      if (item.bindings[key]?.type !== 'spread' && !checkIsEvent(key)) {
        json.state[newBindingName] = { code: 'null', type: 'property' };
        makeReactiveState(
          json,
          newBindingName,
          `this.${newBindingName} = ${item.bindings[key]!.code}`,
        );
        item.bindings[key]!.code = `state.${newBindingName}`;
      } else if (checkIsEvent(key)) {
        const { arguments: cusArgs = ['event'] } = item.bindings[key]!;
        if (
          item.bindings[key]?.code.trim().startsWith('{') &&
          item.bindings[key]?.code.trim().endsWith('}')
        ) {
          json.state[newBindingName] = {
            code: `(${cusArgs.join(', ')}) => ${item.bindings[key]!.code}`,
            type: 'function',
          };
          item.bindings[key]!.code = `state.${newBindingName}(${cusArgs.join(', ')})`;
        }
      } else {
        makeReactiveState(
          json,
          newBindingName,
          `state.${newBindingName} = {...(${item.bindings[key]!.code})}`,
        );
        item.bindings[newBindingName] = item.bindings[key];
        item.bindings[key]!.code = `state.${newBindingName}`;
        delete item.bindings[key];
      }
    }
    index++;
  }
  return index;
};

const handleProperties = (json: MitosisComponent, item: MitosisNode, index: number) => {
  for (const key in item.properties) {
    if (key.startsWith('$') || isASimpleProperty(item.properties[key]!)) {
      continue;
    }
    const newBindingName = generateNewBindingName(index, item.name);
    json.state[newBindingName] = { code: '`' + `${item.properties[key]}` + '`', type: 'property' };
    item.bindings[key] = createSingleBinding({ code: `state.${newBindingName}` });
    delete item.properties[key];
    index++;
  }
  return index;
};

const handleAngularBindings = (
  json: MitosisComponent,
  item: MitosisNode,
  index: number,
  { forName, indexName }: { forName?: string; indexName?: string } = {},
): number => {
  if (isChildren({ node: item })) return index;

  index = handleBindings(json, item, index, forName, indexName);
  index = handleProperties(json, item, index);

  return index;
};

export const getClassPropertiesPlugin = (): MitosisPlugin => () => ({
  json: {
    pre: (json: MitosisComponent) => {
      let lastId = 0;
      traverseNodes(json, (item) => {
        if (isMitosisNode(item)) {
          if (item.name === 'For') {
            const forName = (item.scope as any).forName;
            const indexName = (item.scope as any).indexName;
            traverseNodes(item, (child) => {
              if (isMitosisNode(child)) {
                (child as any)._traversed = true;
                lastId = handleAngularBindings(json, child, lastId, {
                  forName,
                  indexName,
                });
              }
            });
          } else if (!(item as any)._traversed) {
            lastId = handleAngularBindings(json, item, lastId);
          }
        }
      });
      return json;
    },
  },
});
