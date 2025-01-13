import { Node, types } from '@babel/core';
import generate from '@babel/generator';
import { Target } from '../../types/config';
import { MitosisPlugin } from '../../types/plugins';
import { babelTransformExpression } from '../babel-transform';
import { capitalize } from '../capitalize';
import { checkIsDefined } from '../nullable';
import { replaceNodes } from '../replace-identifiers';
import { getSignalMitosisImportForTarget, mapSignalType } from '../signals';
import { createCodeProcessorPlugin } from './process-code';

export const replaceSignalSetters = ({
  code,
  nodeMaps,
}: {
  code: string;
  nodeMaps: {
    from: types.Node;
    setTo: types.Expression;
  }[];
}) => {
  for (const { from, setTo } of nodeMaps) {
    code = babelTransformExpression(code, {
      AssignmentExpression(path) {
        if (path.node.operator !== '=') return;

        const lhs = path.node.left;
        const rhs = path.node.right;

        if (!types.isMemberExpression(lhs)) return;
        if (!(types.isObjectExpression(rhs) || types.isIdentifier(rhs))) return;

        const signalAccess = lhs.object;
        if (!types.isMemberExpression(signalAccess)) return;

        if (generate(signalAccess).code !== generate(from).code) return;

        /**
         * Go from:
         *  a.b.c.value.d = e
         *
         * to:
         *  a.b.setC((PREVIOUS_VALUE) => ({ ...PREVIOUS_VALUE, d: e }))
         */
        const setter = types.cloneNode(setTo);

        // TO-DO: replace all `value` references inside of the set logic with `PREVIOUS_VALUE`.
        const prevValueIdentifier = types.identifier('PREVIOUS_VALUE');
        const setFn = types.arrowFunctionExpression(
          [prevValueIdentifier],
          types.objectExpression([
            types.spreadElement(prevValueIdentifier),
            types.objectProperty(lhs.property, rhs),
          ]),
        );
        const setterExpression = types.callExpression(setter, [setFn]);

        path.replaceWith(setterExpression);
      },
    });
  }
  return code;
};

type SignalMapper = {
  getter: (name: string) => types.Expression;
  setter?: (name: string) => types.Expression;
};

/**
 * Processes `Signal` type imports, transforming them to the target's equivalent and adding the import to the component.
 */
export const getSignalTypePlugin =
  ({ target }: { target: Target }): MitosisPlugin =>
  () => ({
    json: {
      pre: (json) => {
        createCodeProcessorPlugin((codeType, json) => {
          switch (codeType) {
            // Skip these for now because they break for svelte: `<svelte:element>` becomes `<svelte: element>`.
            // Besides, fairly impossible to endup with a Signal generic there like `<MyComponent<Signal<number>> />`.
            case 'dynamic-jsx-elements':
              return (x) => x;
            default:
              return (code) => {
                if (json.signals?.signalTypeImportName) {
                  return mapSignalType({
                    code,
                    signalImportName: json.signals.signalTypeImportName,
                    target,
                  });
                }

                return code;
              };
          }
        })(json);

        if (json.signals?.signalTypeImportName) {
          json.imports = json.imports || [];
          const signalMappedImport = getSignalMitosisImportForTarget(target);
          if (signalMappedImport) {
            json.imports.push(signalMappedImport);
          }
        }
      },
    },
  });

const getSignalMapperForTarget = (target: Target): SignalMapper => {
  switch (target) {
    case 'svelte':
      return {
        getter: (name) => types.identifier('$' + name),
      };
    case 'preact':
    case 'reactNative':
    case 'react':
    case 'solid':
      return {
        getter: (name) => types.identifier(name),
        setter: (name) => types.identifier('set' + capitalize(name)),
      };
    default:
      // default case: strip the `.value` accessor
      return {
        getter: (name) => types.identifier(name),
      };
  }
};

/**
 * Processes `mySignal.value` accessors for props, context, and state.
 */
export const getSignalAccessPlugin =
  ({ target }: { target: Target }): MitosisPlugin =>
  () => ({
    json: {
      pre: (x) => {
        return createCodeProcessorPlugin((_codeType, json) => (code) => {
          const mapSignal = getSignalMapperForTarget(target);
          const nodeMaps: { from: Node; to: Node; setTo: types.Expression | undefined }[] = [];

          for (const propName in json.props) {
            if (json.props[propName].propertyType === 'reactive') {
              const getter = types.memberExpression(
                types.identifier('props'),
                mapSignal.getter(propName),
              );
              const setter = mapSignal.setter
                ? types.memberExpression(types.identifier('props'), mapSignal.setter(propName))
                : undefined;

              nodeMaps.push({
                from: types.memberExpression(
                  types.memberExpression(types.identifier('props'), types.identifier(propName)),
                  types.identifier('value'),
                ),
                to: getter,
                setTo: setter,
              });

              nodeMaps.push({
                from: types.optionalMemberExpression(
                  types.memberExpression(types.identifier('props'), types.identifier(propName)),
                  types.identifier('value'),
                  false,
                  true,
                ),
                to: getter,
                setTo: setter,
              });
            }
          }

          for (const propName in json.context.get) {
            if (json.context.get[propName].type === 'reactive') {
              nodeMaps.push({
                from: types.memberExpression(types.identifier(propName), types.identifier('value')),
                to: mapSignal.getter(propName),
                setTo: mapSignal.setter ? mapSignal.setter(propName) : undefined,
              });
            }
          }

          for (const propName in json.state) {
            if (json.state[propName]?.propertyType === 'reactive') {
              const to = types.memberExpression(
                types.identifier('state'),
                mapSignal.getter(propName),
              );
              const setTO = mapSignal.setter ? mapSignal.setter(propName) : undefined;

              nodeMaps.push({
                from: types.memberExpression(
                  types.memberExpression(types.identifier('state'), types.identifier(propName)),
                  types.identifier('value'),
                ),
                to: to,
                setTo: setTO,
              });

              nodeMaps.push({
                from: types.optionalMemberExpression(
                  types.memberExpression(types.identifier('state'), types.identifier(propName)),
                  types.identifier('value'),
                  false,
                  true,
                ),
                to: to,
                setTo: setTO,
              });
            }
          }

          const filteredNodeMaps = nodeMaps.filter(
            (
              x,
            ): x is {
              from: types.Node;
              to: types.Node;
              setTo: types.Expression;
            } => checkIsDefined(x.setTo),
          );
          // we run state-setter replacement first, because otherwise the other one will catch it.
          if (filteredNodeMaps.length) {
            code = replaceSignalSetters({ code, nodeMaps: filteredNodeMaps });
          }

          if (nodeMaps.length) {
            code = replaceNodes({ code, nodeMaps });
          }

          return code;
        })(x);
      },
    },
  });
