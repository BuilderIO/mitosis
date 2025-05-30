import { componentToAngular } from '../generators/angular';
const component = {
  '@type': '@builder.io/mitosis/component' as const,
  children: [
    {
      '@type': '@builder.io/mitosis/node' as const,
      bindings: {},
      children: [],
      meta: {},
      name: 'CustomComponent',
      properties: {
        $tagName: 'input',
        placeholder: 'placeholder text',
      },
      scope: {},
      slots: {},
    },
  ],
  context: {
    get: {},
    set: {},
  },
  exports: {},
  hooks: {
    onEvent: [],
    onMount: [],
  },
  imports: [],
  inputs: [],
  meta: {
    useMetadata: {
      httpRequests: undefined,
    },
  },
  name: 'MyComponent',
  refs: {},
  state: {},
  subComponents: [],
};

describe('Angular tag name output', () => {
  test('self closing tags are handled correctly', () => {
    // ngmodule and standalone have the same code path here
    const angular = componentToAngular({ standalone: true })({ component });
    expect(angular).toMatchInlineSnapshot(`
      "import { Component } from \\"@angular/core\\";

      import { CommonModule } from \\"@angular/common\\";

      @Component({
        selector: \\"my-component\\",
        template: \`
          <input placeholder=\\"placeholder text\\" />
        \`,
        styles: [
          \`
            :host {
              display: contents;
            }
          \`,
        ],
        standalone: true,
        imports: [CommonModule, CustomComponent],
      })
      export default class MyComponent {}
      "
    `);
  });
});
