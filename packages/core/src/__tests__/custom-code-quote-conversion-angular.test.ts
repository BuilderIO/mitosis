import { BuilderElement } from '@builder.io/sdk';
import { componentToAngular } from '../generators/angular';
import { blockToAngular } from '../generators/angular/blocks';
import { createMitosisNode } from '../helpers/create-mitosis-node';
import { builderElementToMitosisNode } from '../parsers/builder';
import { compileAwayBuilderComponents } from '../plugins/compile-away-builder-components';
import { MitosisComponent } from '../types/mitosis-component';

describe('CustomCode component with double quotes in Angular', () => {
  test('should properly convert double quotes when transforming from Builder to Angular', () => {
    // Create a Builder CustomCode element with HTML containing double quotes
    const builderElement: BuilderElement = {
      '@type': '@builder.io/sdk:Element',
      '@version': 2,
      id: 'builder-8e8834315d504381ad92024148b9a924',
      component: {
        name: 'Custom Code',
        options: {
          code: '<link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">\n            <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>\n            <script src="https://unpkg.com/@tailwindcss/browser@4"></script>',
        },
      },
    };

    // Step 1: Convert Builder element to Mitosis node
    const mitosisNode = builderElementToMitosisNode(builderElement, {
      includeBuilderExtras: true,
      preserveTextBlocks: true,
    });

    // Step 2: Create a Mitosis component containing the node
    const mitosisComponent: MitosisComponent = {
      '@type': '@builder.io/mitosis/component',
      name: 'TestComponent',
      meta: {},
      imports: [],
      exports: {},
      state: {},
      refs: {},
      hooks: {
        onMount: [],
        onEvent: [],
      },
      context: {
        get: {},
        set: {},
      },
      props: {},
      inputs: [],
      subComponents: [],
      children: [mitosisNode],
    };

    // Step 3: Apply the compileAwayBuilderComponents plugin to transform CustomCode
    const plugin = compileAwayBuilderComponents();
    const transformedComponent = { ...mitosisComponent };
    const pluginInstance = plugin();
    if (pluginInstance.json && pluginInstance.json.pre) {
      pluginInstance.json.pre(transformedComponent);
    }

    // Step 4: Generate Angular code
    const angularCode = componentToAngular({
      typescript: true,
    })({ component: transformedComponent });

    // Use toMatchInlineSnapshot instead of individual assertions
    expect(angularCode).toMatchInlineSnapshot();
  });

  // Adding a test specifically for innerHTML as a property
  test('should properly handle innerHTML as a direct property', () => {
    // HTML with double quotes that needs proper handling
    const htmlCode =
      '<div class="test-class" id="test-id"><p>Text with "quoted" content</p>' +
      '<script src="https://example.com/script.js"></script></div>';

    // Create a Mitosis node with innerHTML as a property directly
    const mitosisNode = createMitosisNode({
      name: 'div',
      properties: {
        innerHTML: htmlCode,
      },
    });

    const component: MitosisComponent = {
      '@type': '@builder.io/mitosis/component',
      name: 'InnerHTMLPropertyTest',
      meta: {},
      imports: [],
      exports: {},
      state: {},
      refs: {},
      hooks: {
        onMount: [],
        onEvent: [],
      },
      context: {
        get: {},
        set: {},
      },
      props: {},
      inputs: [],
      subComponents: [],
      children: [mitosisNode],
    };

    // Generate Angular template
    const template = blockToAngular({
      root: component,
      json: mitosisNode,
      options: { typescript: true },
      blockOptions: { sanitizeInnerHTML: false },
    });

    // Use toMatchInlineSnapshot instead of individual assertions
    expect(template).toMatchInlineSnapshot(
      "\"<div  [innerHTML]=\\\"sanitizer.bypassSecurityTrustHtml('<div class='test-class' id='test-id'><p>Text with 'quoted' content</p><script src='https://example.com/script.js'></script></div>')\\\" ></div>\"",
    );
  });
});
