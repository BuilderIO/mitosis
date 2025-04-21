import { MitosisComponent } from '@/types/mitosis-component';
import { MitosisNode } from '@/types/mitosis-node';
import {
  cssToSwiftUIModifiers,
  getBindingType,
  getEventHandlerName,
  getForEachParams,
  isForEachBlock,
  jsxElementToSwiftUIView,
  needsScrollView,
  stripStateAndProps,
} from './helpers';
import { ToSwiftOptions } from './types';

// Helper function to sanitize text content for SwiftUI
const sanitizeTextForSwift = (text: string): string => {
  if (!text) return '""';

  // Check if text contains newlines
  if (text.includes('\n')) {
    // Use triple quotes for multiline strings
    return `"""${text}"""`;
  }

  // Escape double quotes in the text
  return `"${text.replace(/"/g, '\\"')}"`;
};

export const blockToSwift = ({
  json,
  options,
  parentComponent,
}: {
  json: MitosisNode;
  options: ToSwiftOptions;
  parentComponent: MitosisComponent;
}): string => {
  if (json.properties._text) {
    return `Text(${sanitizeTextForSwift(json.properties._text)})`;
  }

  const tag = json.name;

  // For fragments, render children without a wrapper
  if (tag === 'Fragment') {
    return json.children
      .map((child) => blockToSwift({ json: child, options, parentComponent }))
      .join('\n');
  }

  // Process bindings and properties - use parentComponent here instead of json
  const processCode = stripStateAndProps({ json: parentComponent, options });

  // Handle ForEach blocks
  if (isForEachBlock(json)) {
    const { collection, itemName, indexName } = getForEachParams(json, processCode);
    const forEachContent = json.children
      .map((child) => blockToSwift({ json: child, options, parentComponent }))
      .join('\n');

    if (indexName) {
      return `ForEach(Array(zip(${collection}.indices, ${collection})), id: \\.0) { index, ${itemName} in\n${forEachContent}\n}`;
    } else {
      return `ForEach(${collection}, id: \\.self) { ${itemName} in\n${forEachContent}\n}`;
    }
  }

  // Determine the SwiftUI component name
  const component = jsxElementToSwiftUIView(tag);

  // Handle children
  const hasChildren = json.children && json.children.length > 0;

  // Handle event handlers
  const eventHandlers = Object.entries(json.bindings)
    .filter(([key]) => key.startsWith('on') && json.bindings[key]?.code)
    .map(([key, binding]) => {
      const swiftEventName = getEventHandlerName(key);
      return `.${swiftEventName}(${processCode(binding?.code || '')})`;
    });

  // Handle data bindings (like bind:value)
  const dataBindings = Object.entries(json.bindings)
    .filter(([key]) => key.startsWith('bind:') && json.bindings[key]?.code)
    .map(([key, binding]) => {
      const bindingType = getBindingType(key);
      const bindingValue = processCode(binding?.code || '');
      return { type: bindingType, value: bindingValue };
    });

  // Handle style properties
  const styleModifiers: string[] = [];
  if (json.bindings.style) {
    // Dynamic styles
    styleModifiers.push(`// Dynamic styles not fully implemented`);
    styleModifiers.push(`.modifier(/* Dynamic style handling needed here */)"`);
  } else if (json.properties.style) {
    // Static styles
    try {
      const styleObj = JSON.parse(json.properties.style);
      styleModifiers.push(...cssToSwiftUIModifiers(styleObj));
    } catch (e) {
      styleModifiers.push(`// Could not parse style: ${json.properties.style}`);
    }
  }

  // Check if we need a ScrollView
  const needsScroll = needsScrollView(json);

  // Conditional rendering
  let result = '';
  if (json.bindings.if?.code) {
    result += `if ${processCode(json.bindings.if.code)} {\n`;
  } else if (json.bindings.show?.code) {
    // In SwiftUI we can use opacity for show/hide
    styleModifiers.push(`.opacity(${processCode(json.bindings.show.code)} ? 1 : 0)`);
  }

  // Start building the component
  let componentCode = '';

  switch (component) {
    case 'Text':
      // Text components in SwiftUI need their content as a parameter
      let textContent = '';
      if (json.properties._text) {
        textContent = sanitizeTextForSwift(json.properties._text);
      } else if (json.bindings.innerHTML?.code) {
        // For dynamic content, we'll need to handle it as an expression
        textContent = processCode(json.bindings.innerHTML.code);
      } else {
        textContent = '""';
      }
      componentCode = `Text(${textContent})`;
      break;

    case 'Button':
      // Find the action from eventHandlers or create an empty one
      let buttonAction = '{}';
      const onClickHandler = eventHandlers.find((h) => h.includes('onTapGesture'));
      if (onClickHandler) {
        buttonAction = onClickHandler.replace('.onTapGesture(', '').replace(')', '');
        // Remove this handler from the list since we're using it directly
        eventHandlers.splice(eventHandlers.indexOf(onClickHandler), 1);
      }

      const buttonLabel = hasChildren
        ? json.children
            .map((child) => blockToSwift({ json: child, options, parentComponent }))
            .join('\n')
        : `Text("${json.properties._text || 'Button'}")`;

      componentCode = `Button(action: { ${buttonAction} }) {\n${buttonLabel}\n}`;
      break;

    case 'TextField':
      // TextField can have either bind:value or direct value binding
      let bindingExpression = '';

      // First check for explicit bind:value
      const textBinding = dataBindings.find((b) => b.type === 'value');

      // If not found, check for direct value binding
      const directValueBinding = json.bindings.value?.code
        ? processCode(json.bindings.value.code)
        : null;

      if (textBinding) {
        // Use the explicit binding from dataBindings
        bindingExpression = textBinding.value;
      } else if (directValueBinding) {
        // Use direct value binding
        bindingExpression = directValueBinding;
      }

      if (bindingExpression) {
        // Convert to SwiftUI binding syntax
        bindingExpression = bindingExpression.replace(/self\.(\w+)/g, '$$$1');

        // If it still doesn't start with $, add it
        if (!bindingExpression.startsWith('$')) {
          bindingExpression = `$${bindingExpression}`;
        }

        componentCode = `TextField("${
          json.properties.placeholder || ''
        }", text: ${bindingExpression})`;
      } else {
        // No binding found, use constant value
        componentCode = `TextField("${json.properties.placeholder || ''}", text: .constant("${
          json.properties.value || ''
        }"))`;
      }
      break;

    case 'Image':
      // Determine if using system image, URL, or asset
      if (json.properties.src?.startsWith('system-')) {
        // System image
        const systemName = json.properties.src.replace('system-', '');
        componentCode = `Image(systemName: "${systemName}")`;
      } else if (json.properties.src?.startsWith('http')) {
        // URL image (requires AsyncImage)
        componentCode = `AsyncImage(url: URL(string: "${json.properties.src}")!) { image in
          image.resizable()
        } placeholder: {
          ProgressView()
        }`;
      } else {
        // Asset image
        componentCode = `Image("${json.properties.src || 'placeholder'}")`;
      }

      if (json.properties.resizeMode) {
        componentCode += `.resizable().aspectRatio(contentMode: .${json.properties.resizeMode})`;
      } else if (!json.properties.src?.startsWith('http')) {
        // Add resizable for non-async images without specific mode
        componentCode += `.resizable().aspectRatio(contentMode: .fit)`;
      }
      break;

    case 'VStack':
    case 'HStack':
    case 'ZStack':
      // Stacks with children
      const alignment = json.properties.alignment || 'leading';
      const spacing = json.properties.spacing || '8';

      componentCode = `${component}(alignment: .${alignment}, spacing: ${spacing}) {\n`;
      if (hasChildren) {
        componentCode += json.children
          .map((child) => {
            return blockToSwift({ json: child, options, parentComponent });
          })
          .join('\n');
      }
      componentCode += '\n}';
      break;

    case 'List':
      // Lists in SwiftUI
      componentCode = `List {\n`;
      if (hasChildren) {
        componentCode += json.children
          .map((child) => {
            return blockToSwift({ json: child, options, parentComponent });
          })
          .join('\n');
      }
      componentCode += '\n}';
      break;

    case 'Picker':
      // Handle select element
      // Pickers in SwiftUI need a selection binding, a label, and content
      const selectBinding = dataBindings.find((b) => b.type === 'value');
      const selectionVar = selectBinding ? selectBinding.value : '.constant("")';

      // Create label from the "label" property or a default
      const pickerLabel = json.properties.label
        ? `Text("${json.properties.label}")`
        : 'Text("Select")';

      // Start building the picker
      componentCode = `Picker(selection: Binding(get: { ${selectionVar} }, set: { ${selectionVar} = $0 }), label: { ${pickerLabel} }) {`;

      // Add options as children
      if (hasChildren) {
        json.children.forEach((child) => {
          // For option elements, extract the value and text
          if (child.name?.toLowerCase() === 'option') {
            const optionValue = child.properties.value || '';
            const optionText = child.properties._text || optionValue;
            componentCode += `\nText("${optionText}").tag("${optionValue}")`;
          } else {
            // Handle non-option children (unusual but possible)
            componentCode += `\n${blockToSwift({ json: child, options, parentComponent })}`;
          }
        });
      }

      componentCode += '\n}';
      break;

    default:
      // Custom components or other SwiftUI views
      if (hasChildren) {
        componentCode = `${component} {\n`;
        componentCode += json.children
          .map((child) => {
            return blockToSwift({ json: child, options, parentComponent });
          })
          .join('\n');
        componentCode += '\n}';
      } else {
        componentCode = `${component}()`;
      }
  }

  // Apply modifiers
  styleModifiers.forEach((modifier) => {
    componentCode += `\n${modifier}`;
  });

  // Add event handlers that weren't specifically handled above
  eventHandlers
    .filter((handler) => !componentCode.includes(handler))
    .forEach((handler) => {
      componentCode += `\n${handler}`;
    });

  // Wrap with ScrollView if needed
  if (needsScroll) {
    componentCode = `ScrollView {\n${componentCode}\n}`;
  }

  // Close conditional rendering block if needed
  if (json.bindings.if?.code) {
    result += componentCode + '\n}';
  } else {
    result += componentCode;
  }

  return result;
};
