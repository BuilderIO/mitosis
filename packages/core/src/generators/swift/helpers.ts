import { capitalize } from '@/helpers/capitalize';
import { stripStateAndPropsRefs } from '@/helpers/strip-state-and-props-refs';
import { MitosisComponent } from '@/types/mitosis-component';
import { MitosisNode } from '@/types/mitosis-node';
import { ToSwiftOptions } from './types';

// TODO(kyle): use babel here to do ast
export const convertConsoleLogToPrint = (code: string): string => {
  if (!code) return code;

  if (code.includes('console.log')) {
    console.log('Converting console.log to print');
  }

  // Match console.log statements with various argument patterns
  return code.replace(/console\.log\s*\(\s*(.*?)\s*\)/g, (match, args) => {
    // Handle empty console.log()
    if (!args.trim()) {
      return 'print()';
    }

    // Simple handling for basic console.log calls
    // For complex cases, we'd need a more sophisticated parser
    return `print(${ensureSwiftStringFormat(args)})`;
  });
};

// Helper function to ensure Swift strings use double quotes
export const ensureSwiftStringFormat = (code: string): string => {
  if (!code) return code;

  // Replace string literals enclosed in single quotes with double quotes
  // This regex looks for single-quoted strings not inside double quotes
  return code.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'(?=(?:[^"]*"[^"]*")*[^"]*$)/g, '"$1"');
};

export const stripStateAndProps = ({
  json,
  options,
}: {
  json: MitosisComponent;
  options: ToSwiftOptions;
}) => {
  return (code: string): string => {
    // Convert console.log statements to Swift print
    code = convertConsoleLogToPrint(code);

    // Ensure Swift strings use double quotes
    code = ensureSwiftStringFormat(code);

    // In Swift, we use self.propertyName for accessing properties
    return stripStateAndPropsRefs(code, {
      includeState: true,
      includeProps: true,
      replaceWith: (name) => {
        // In Swift, we access properties with self.propertyName
        return `self.${name}`;
      },
    });
  };
};

export const getSwiftType = (type: string | undefined): string => {
  if (!type) return 'Any';

  // Handle array types with proper Swift syntax
  if (type.includes('Array<') || type.includes('[]') || type.toLowerCase().startsWith('array')) {
    // Extract the element type from Array<ElementType>
    let elementType = 'Any';

    // Match different array type patterns
    const arrayMatch =
      type.match(/Array<([^>]+)>/i) ||
      type.match(/([^[\]]+)\[\]/i) ||
      type.match(/array\s*<([^>]+)>/i);

    if (arrayMatch && arrayMatch[1]) {
      elementType = getSwiftType(arrayMatch[1].trim());
    }

    // Return Swift array type: [ElementType]
    return `[${elementType}]`;
  }

  // Handle primitive types
  switch (type.toLowerCase()) {
    case 'string':
      return 'String';
    case 'number':
      return 'Double';
    case 'boolean':
    case 'bool':
      return 'Bool';
    case 'any':
      return 'Any';
    case 'void':
      return 'Void';
    case 'object':
      return '[String: Any]';
    case 'null':
    case 'undefined':
      return 'Optional<Any>';
    default:
      // For complex types, return as is with first letter capitalized
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

export const jsxElementToSwiftUIView = (tagName: string): string => {
  // Map JSX/HTML elements to SwiftUI components
  switch (tagName.toLowerCase()) {
    case 'div':
      return 'VStack';
    case 'span':
    case 'p':
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return 'Text';
    case 'img':
      return 'Image';
    case 'input':
      return 'TextField';
    case 'button':
      return 'Button';
    case 'a':
      return 'Link';
    case 'ul':
      return 'List';
    case 'li':
      return 'Text'; // Will be wrapped in List
    case 'form':
      return 'Form';
    case 'select':
      return 'Picker';
    case 'option':
      return 'Text'; // Options in SwiftUI are part of the Picker content
    default:
      // For custom components or unrecognized tags
      return capitalize(tagName);
  }
};

export const cssToSwiftUIModifiers = (style: Record<string, string>): string[] => {
  const modifiers: string[] = [];

  // Map CSS properties to SwiftUI modifiers
  Object.entries(style).forEach(([key, value]) => {
    switch (key) {
      case 'backgroundColor':
        modifiers.push(`.background(Color("${value}"))`);
        break;
      case 'color':
        modifiers.push(`.foregroundColor(Color("${value}"))`);
        break;
      case 'fontSize':
        const fontSize = parseInt(value);
        if (!isNaN(fontSize)) {
          modifiers.push(`.font(.system(size: ${fontSize}))`);
        }
        break;
      case 'fontWeight':
        modifiers.push(`.fontWeight(.${value})`);
        break;
      case 'padding':
        modifiers.push(`.padding(${value})`);
        break;
      case 'margin':
        // Swift doesn't have direct margin equivalent, we'll use padding
        modifiers.push(`// Note: 'margin' converted to padding: ${value}`);
        modifiers.push(`.padding(${value})`);
        break;
      case 'width':
        modifiers.push(`.frame(width: ${value})`);
        break;
      case 'height':
        modifiers.push(`.frame(height: ${value})`);
        break;
      // Add more CSS to SwiftUI modifier mappings as needed
      default:
        modifiers.push(`// Unmapped style: ${key}: ${value}`);
    }
  });

  return modifiers;
};

export const getStatePropertyTypeAnnotation = (
  propertyType: string | undefined,
  type: string | undefined,
): string => {
  // Use appropriate SwiftUI property wrappers
  switch (propertyType) {
    case 'reactive':
      // For reactive state, use @State for simple values
      // @Observable would be used for classes but requires Swift 5.9+/iOS 17+
      return `@State private var`;
    case 'normal':
      // For normal state, use @State for simple values
      return `@State private var`;
    default:
      // For non-reactive values, use a regular property
      return `var`;
  }
};

export const getEventHandlerName = (eventName: string): string => {
  switch (eventName) {
    case 'onClick':
      return 'onTapGesture';
    case 'onChange':
      return 'onChange';
    case 'onInput':
      return 'onEditingChanged';
    case 'onBlur':
      return 'onSubmit';
    case 'onFocus':
      return 'onEditingChanged';
    default:
      return eventName;
  }
};

export const needsScrollView = (json: MitosisNode): boolean => {
  // Check if overflow property indicates scrolling
  if (json.properties.style) {
    try {
      const styleObj = JSON.parse(json.properties.style);
      return (
        styleObj.overflow === 'auto' ||
        styleObj.overflow === 'scroll' ||
        styleObj.overflowY === 'auto' ||
        styleObj.overflowY === 'scroll' ||
        styleObj.overflowX === 'auto' ||
        styleObj.overflowX === 'scroll'
      );
    } catch (e) {
      // If style can't be parsed, check for overflow directly in the style string
      const styleStr = json.properties.style;
      return (
        styleStr.includes('overflow:auto') ||
        styleStr.includes('overflow:scroll') ||
        styleStr.includes('overflow-y:auto') ||
        styleStr.includes('overflow-y:scroll') ||
        styleStr.includes('overflow-x:auto') ||
        styleStr.includes('overflow-x:scroll')
      );
    }
  }
  return false;
};

export const isForEachBlock = (json: MitosisNode): boolean => {
  // Check if this is a ForEach binding using the bindings.each pattern
  return !!json.bindings.each?.code;
};

export const getForEachParams = (
  json: MitosisNode,
  processCode: (code: string) => string,
): {
  collection: string;
  itemName: string;
  indexName: string | null;
} => {
  if (!json.bindings.each?.code) {
    return { collection: '', itemName: 'item', indexName: null };
  }

  const eachCode = json.bindings.each.code;
  let itemName = 'item';
  let indexName = null;

  // Extract collection, item name, and index name from each binding
  try {
    // Parse expressions like: items.map(item => ...)
    // or items.map((item, index) => ...)
    const match = eachCode.match(/(\w+)\.map\(\s*(?:\()?([^,)]+)(?:,\s*([^)]+))?\)?/);

    if (match) {
      const collection = processCode(match[1]);
      itemName = match[2].trim();
      indexName = match[3]?.trim() || null;

      return { collection, itemName, indexName };
    }

    // Fallback to the whole code as collection if pattern doesn't match
    return {
      collection: processCode(eachCode),
      itemName,
      indexName,
    };
  } catch (e) {
    console.warn('Failed to parse each binding:', eachCode);
    return {
      collection: processCode(eachCode),
      itemName,
      indexName,
    };
  }
};

export const camelToSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

export const getBindingType = (key: string): string => {
  if (key.startsWith('bind:')) {
    return key.substring(5);
  }
  return key;
};

/**
 * Extract function signature information from JavaScript function code
 */
export const extractFunctionSignature = (
  code: string,
): {
  name: string;
  params: { name: string; type: string }[];
  returnType: string;
  body: string;
} => {
  // Default values
  let name = '';
  let params: { name: string; type: string }[] = [];
  let returnType = 'Void';
  let body = '';

  // Extract function name, parameters, and body
  const funcMatch = code.match(
    /(?:function\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)?\s*\(([^)]*)\)\s*(?:=>)?\s*(?:{([\s\S]*)}|(.*))/,
  );

  if (funcMatch) {
    name = funcMatch[1] || '';

    // Extract parameters
    const paramsStr = funcMatch[2].trim();
    if (paramsStr) {
      params = paramsStr.split(',').map((param) => {
        // Handle TypeScript-style parameter types if present
        const paramParts = param.trim().split(':');
        const paramName = paramParts[0].trim();
        const paramType = paramParts.length > 1 ? getSwiftType(paramParts[1].trim()) : 'Any';
        return { name: paramName, type: paramType };
      });
    }

    // Extract function body
    body = funcMatch[3] || funcMatch[4] || '';

    // Try to determine return type from TypeScript annotations or infer from return statements
    const returnTypeMatch = code.match(/\)\s*:\s*([^{]+)/);
    if (returnTypeMatch) {
      returnType = getSwiftType(returnTypeMatch[1].trim());
    } else if (body.includes('return')) {
      // Try to infer from return statements
      const returnValueMatch = body.match(/return\s+(["'].*["']|true|false|\d+|\d+\.\d+|\[.*\])/);
      if (returnValueMatch) {
        const returnValue = returnValueMatch[1];
        if (returnValue.startsWith('"') || returnValue.startsWith("'")) {
          returnType = 'String';
        } else if (returnValue === 'true' || returnValue === 'false') {
          returnType = 'Bool';
        } else if (returnValue.match(/^\d+$/)) {
          returnType = 'Int';
        } else if (returnValue.match(/^\d+\.\d+$/)) {
          returnType = 'Double';
        } else if (returnValue.startsWith('[')) {
          returnType = '[Any]';
        }
      }
    }
  }

  return { name, params, returnType, body };
};

/**
 * Convert JavaScript function code to Swift function syntax
 */
export const convertJsFunctionToSwift = (
  code: string,
  functionName?: string,
): { swiftCode: string; signature: string } => {
  // Extract the function signature
  const { name, params, returnType, body } = extractFunctionSignature(code);

  // Use provided name or extracted name
  const finalName = functionName || name || 'function';

  // Convert function body to Swift
  let swiftBody = body
    // Convert variable declarations
    .replace(/\bvar\s+(\w+)/g, 'var $1')
    .replace(/\blet\s+(\w+)/g, 'let $1')
    .replace(/\bconst\s+(\w+)/g, 'let $1')

    // Convert common array methods
    .replace(/\.push\(/g, '.append(')
    .replace(/\.map\(/g, '.map(')
    .replace(/\.filter\(/g, '.filter(')
    .replace(/\.includes\(/g, '.contains(')
    .replace(/\.indexOf\(/g, '.firstIndex(of: ')

    // Convert null/undefined checks
    .replace(/=== null/g, '== nil')
    .replace(/!== null/g, '!= nil')
    .replace(/=== undefined/g, '== nil')
    .replace(/!== undefined/g, '!= nil')

    // Convert console.log
    .replace(/console\.log\((.+?)\)/g, 'print($1)');

  // Create parameter list with Swift types
  const paramList = params.map((p) => `${p.name}: ${p.type}`).join(', ');

  // Build the Swift function signature
  const signature = `func ${finalName}(${paramList}) -> ${returnType}`;

  // Build the complete Swift function
  const swiftCode = `${signature} {\n  ${swiftBody}\n}`;

  return { swiftCode, signature };
};
