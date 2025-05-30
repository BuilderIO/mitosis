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
  test('ngmodule', () => {
    const angular = componentToAngular()({ component });
    expect(angular).toMatchInlineSnapshot(`
      "import { NgModule } from \\"@angular/core\\";
      import { CommonModule } from \\"@angular/common\\";

      import { Component } from \\"@angular/core\\";

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
      })
      export default class MyComponent {}

      @NgModule({
        declarations: [MyComponent],
        imports: [CommonModule, CustomComponentModule],
        exports: [MyComponent],
      })
      export class MyComponentModule {}
      "
    `);
  });
  test('standalone', () => {
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
