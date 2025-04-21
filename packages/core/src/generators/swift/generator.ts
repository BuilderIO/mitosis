import { dedent } from '@/helpers/dedent';
import { fastClone } from '@/helpers/fast-clone';
import { getProps } from '@/helpers/get-props';
import { getRefs } from '@/helpers/get-refs';
import { gettersToFunctions } from '@/helpers/getters-to-functions';
import { initializeOptions } from '@/helpers/merge-options';
import { processOnEventHooksPlugin } from '@/helpers/on-event';
import { stripGetter } from '@/helpers/patterns';
import { CODE_PROCESSOR_PLUGIN } from '@/helpers/plugins/process-code';
import { isSlotProperty } from '@/helpers/slots';
import { stripMetaProperties } from '@/helpers/strip-meta-properties';
import { TranspilerGenerator } from '@/types/transpiler';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../../modules/plugins';
import { blockToSwift } from './blocks';
import {
  convertConsoleLogToPrint,
  convertJsFunctionToSwift,
  getStatePropertyTypeAnnotation,
  getSwiftType,
  stripStateAndProps,
} from './helpers';
import { ToSwiftOptions } from './types';

const DEFAULT_OPTIONS: ToSwiftOptions = {
  stateType: 'state',
  formatCode: true,
  includeTypes: true,
  includePreview: true,
  classPrefix: '',
};

export const componentToSwift: TranspilerGenerator<ToSwiftOptions> =
  (userProvidedOptions) =>
  ({ component }) => {
    const options = initializeOptions({
      target: 'swift',
      component,
      defaults: DEFAULT_OPTIONS,
      userOptions: userProvidedOptions,
    });

    options.plugins = [
      ...(options.plugins || []),
      processOnEventHooksPlugin(),
      CODE_PROCESSOR_PLUGIN((codeType) => {
        switch (codeType) {
          case 'bindings':
          case 'properties':
          case 'hooks':
          case 'hooks-deps':
          case 'hooks-deps-array':
          case 'state':
          case 'context-set':
          case 'dynamic-jsx-elements':
          case 'types':
            return (x) => convertConsoleLogToPrint(x);
        }
      }),
      CODE_PROCESSOR_PLUGIN((codeType) => {
        switch (codeType) {
          case 'hooks':
            return (code: string) => stripStateAndProps({ json, options })(code);
          case 'bindings':
          case 'hooks-deps':
          case 'state':
            return (code: string) => stripGetter(stripStateAndProps({ json, options })(code));
          case 'properties':
          case 'context-set':
            return (code: string) => stripStateAndProps({ json, options })(code);
          case 'dynamic-jsx-elements':
          case 'hooks-deps-array':
          case 'types':
            return (x) => convertConsoleLogToPrint(x);
        }
      }),
    ];

    // Make a copy we can safely mutate
    let json = fastClone(component);
    json = runPreJsonPlugins({ json, plugins: options.plugins });

    gettersToFunctions(json);

    const componentName =
      options.classPrefix + (json.name || json.meta.useMetadata?.name || 'MitosisComponent');

    // Process props
    const filteredProps = Array.from(getProps(json)).filter((prop) => !isSlotProperty(prop));

    const props = Array.from(new Set(filteredProps));

    // Process refs (not directly applicable in SwiftUI, will be converted to @State)
    const refs = Array.from(getRefs(json))
      .map(stripStateAndProps({ json, options }))
      .filter((x) => !props.includes(x));

    json = runPostJsonPlugins({ json, plugins: options.plugins });
    stripMetaProperties(json);

    // Generate state variables
    const stateProperties = Object.entries(json.state)
      .filter(([_, value]) => {
        // Skip methods - they'll be handled separately
        return !(
          value?.type === 'method' ||
          (value?.code && (value.code.includes('function') || value.code.includes('=>')))
        );
      })
      .map(([key, value]) => {
        // Check for value properties safely
        const propertyType = value?.propertyType;

        // Determine Swift type - handle missing type property
        let valueType = 'Any';
        if (value?.typeParameter) {
          valueType = (value as any).typeParameter;
        } else {
          // Try to infer type from code if possible
          if (value?.code?.includes('"') || value?.code?.includes("'")) {
            valueType = 'string';
          } else if (value?.code?.match(/^[0-9]+(\.[0-9]+)?$/)) {
            valueType = 'number';
          } else if (value?.code === 'true' || value?.code === 'false') {
            valueType = 'boolean';
          } else if (value?.code?.startsWith('[') || value?.code?.startsWith('Array')) {
            valueType = 'Array<Any>';
          }
        }

        const typeAnnotation = getStatePropertyTypeAnnotation(propertyType, valueType);
        const swiftType = getSwiftType(valueType);

        let stateDeclaration = `${typeAnnotation} ${key}: ${swiftType}`;

        // Add default value if present
        if (value?.code) {
          stateDeclaration += ` = ${value.code}`;
        } else {
          // Add default initialization based on type
          switch (swiftType) {
            case 'String':
              stateDeclaration += ' = ""';
              break;
            case 'Bool':
              stateDeclaration += ' = false';
              break;
            case 'Double':
            case 'Int':
              stateDeclaration += ' = 0';
              break;
            case 'Array<String>':
            case '[String]':
              stateDeclaration += ' = []';
              break;
            default:
              if (swiftType.includes('Array') || swiftType.includes('[')) {
                stateDeclaration += ' = []';
              } else if (swiftType !== 'Any' && swiftType !== 'Void') {
                stateDeclaration += '/* initialize with appropriate default */';
              }
          }
        }

        return stateDeclaration;
      })
      .join('\n  ');

    // Generate state function variables with inline closure assignment
    const functionStateProperties: string[] = [];

    Object.entries(json.state)
      .filter(([_, value]) => {
        return (
          value?.type === 'method' ||
          (value?.code && (value.code.includes('function') || value.code.includes('=>')))
        );
      })
      .forEach(([key, value]) => {
        if (!value?.code) {
          // Handle empty function with inline closure
          functionStateProperties.push(
            `private var ${key}: () -> Void = { () in /* Empty function */ }`,
          );
          return;
        }

        // Convert the JS function to Swift
        const processedCode = stripStateAndProps({ json, options })(value.code);
        const { swiftCode, signature } = convertJsFunctionToSwift(processedCode, `_${key}`);

        // Parse signature to get parameter list and return type
        const signatureMatch = signature.match(/func _([^(]+)\(([^)]*)\) -> ([^{]+)/);
        if (signatureMatch) {
          const [, funcName, params, returnType] = signatureMatch;

          // Create the function type for the state variable
          const paramTypes = params
            ? params
                .split(',')
                .map((p) => p.trim().split(':')[1]?.trim() || 'Any')
                .join(', ')
            : '';

          const functionType = params
            ? `(${paramTypes}) -> ${returnType.trim()}`
            : `() -> ${returnType.trim()}`;

          // Extract function body from swiftCode
          const bodyMatch = swiftCode.match(/{\s*([\s\S]*?)\s*}/);
          const functionBody = bodyMatch ? bodyMatch[1].trim() : '/* Empty function body */';

          // Build closure syntax for inline assignment
          const closureSyntax = params
            ? `{ (${params}) -> ${returnType.trim()} in\n    ${functionBody}\n  }`
            : `{ () -> ${returnType.trim()} in\n    ${functionBody}\n  }`;

          // Add the state variable declaration with inline closure assignment
          functionStateProperties.push(`var ${key}: ${functionType} = ${closureSyntax}`);
        } else {
          // Fallback if signature parsing fails
          functionStateProperties.push(
            `var ${key}: () -> Void = { () in /* Could not parse function */ }`,
          );
        }
      });

    // Process lifecycle methods
    const lifecycleMethods: string[] = [];

    // Only add onInit if needed and if there are no function state properties
    // (to avoid duplicate initializers)
    if (json.hooks.onInit?.code) {
      lifecycleMethods.push(dedent`
        init() {
          ${json.hooks.onInit.code}
        }
      `);
    }

    // Generate SwiftUI component
    let str = dedent`
      import SwiftUI

      struct ${componentName}: View {
        // Props
        ${props
          .map((prop) => {
            const propType = json.props?.[prop]?.propertyType || 'Any';
            const swiftType = getSwiftType(propType);
            return `let ${prop}: ${swiftType}${json.props?.[prop]?.optional ? '?' : ''}`;
          })
          .join('\n  ')}
        
        // State
        ${stateProperties}
        ${
          functionStateProperties.length > 0
            ? '\n  // Function state variables\n  ' + functionStateProperties.join('\n  ')
            : ''
        }
        
        // Body
        var body: some View {
          ${json.children
            .map((item) =>
              blockToSwift({
                json: item,
                options: options,
                parentComponent: json,
              }),
            )
            .join('\n')}
          ${lifecycleMethods.filter((method) => method.startsWith('.')).join('\n  ')}
        }
        
        ${lifecycleMethods.filter((method) => !method.startsWith('.')).join('\n  ')}
      }
    `;

    // Add preview if enabled
    if (options.includePreview) {
      str += dedent`
        \n
        #if DEBUG
        struct ${componentName}_Previews: PreviewProvider {
          static var previews: some View {
            ${componentName}(
              ${props
                .map((prop) => {
                  const propType = json.props?.[prop]?.propertyType || 'Any';
                  const swiftType = getSwiftType(propType);

                  // Generate appropriate preview values based on type
                  let previewValue = '';
                  switch (swiftType) {
                    case 'String':
                      previewValue = '"Preview"';
                      break;
                    case 'Bool':
                      previewValue = 'false';
                      break;
                    case 'Double':
                    case 'Int':
                      previewValue = '0';
                      break;
                    default:
                      if (json.props?.[prop]?.optional) {
                        previewValue = 'nil';
                      } else {
                        previewValue = '/* provide preview value */';
                      }
                  }

                  return `${prop}: ${previewValue}`;
                })
                .join(',\n              ')}
            )
          }
        }
        #endif
      `;
    }

    str = runPreCodePlugins({ json, code: str, plugins: options.plugins });
    str = runPostCodePlugins({ json, code: str, plugins: options.plugins });

    return str;
  };
