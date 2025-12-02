import { componentToBuilder } from '@/generators/builder';
import { componentToHtml } from '@/generators/html';
import { componentToMitosis } from '@/generators/mitosis';
import { ToMitosisOptions } from '@/generators/mitosis/types';
import { componentToReact } from '@/generators/react';
import { componentToVue } from '@/generators/vue';
import { dedent } from '@/helpers/dedent';
import {
  builderContentToMitosisComponent,
  builderElementToMitosisNode,
  extractStateHook,
} from '@/parsers/builder';
import { parseJsx } from '@/parsers/jsx';
import { compileAwayBuilderComponents } from '@/plugins/compile-away-builder-components';
import { BuilderContent } from '@builder.io/sdk';

import { componentToAngular } from '@/generators/angular';
import {
  compileAwayBuilderComponentsFromTree,
  components as compileAwayComponents,
} from '@/plugins/compile-away-builder-components';
import { MitosisComponent } from '@/types/mitosis-component';
import { get } from 'lodash';
import columns from '../data/blocks/columns.raw.tsx?raw';
import customCode from '../data/blocks/custom-code.raw.tsx?raw';
import embed from '../data/blocks/embed.raw.tsx?raw';
import image from '../data/blocks/image.raw.tsx?raw';
import indexInFor from '../data/blocks/index-in-for.raw.tsx?raw';
import stamped from '../data/blocks/stamped-io.raw.tsx?raw';
import booleanContent from '../data/builder/boolean.json?raw';
import customComponentSlotPropertyContent from '../data/builder/custom-component-slot-property.json?raw';
import customComponentTags from '../data/builder/custom-component-tags.json?raw';
import lazyLoadSection from '../data/builder/lazy-load-section.json?raw';
import localization from '../data/builder/localization.json?raw';
import slotsContent from '../data/builder/slots.json?raw';
import slots2Content from '../data/builder/slots2.json?raw';
import symbolBasic from '../data/builder/symbol-basic.json?raw';
import symbolMultiple from '../data/builder/symbol-multiple.json?raw';
import symbolWithInputs from '../data/builder/symbol-with-inputs.json?raw';
import symbolWithNamedEntry from '../data/builder/symbol-with-named-entry.json?raw';
import tagNameContent from '../data/builder/tag-name.json?raw';
import textBindings from '../data/builder/text-bindings.json?raw';
import advancedFor from '../data/for/advanced-for.raw.tsx?raw';
import asyncBindings from '../data/ref/basic-ref-assignment.raw.tsx?raw';
import show from '../data/show/show-expressions.raw.tsx?raw';

const mitosisOptions: ToMitosisOptions = {
  format: 'legacy',
};

describe('Builder', () => {
  test('extractStateHook', () => {
    const code = `useState({ foo: 'bar' }); alert('hi');`;
    expect(extractStateHook(code)).matchSnapshot();
  });

  test('Stamped', () => {
    const component = parseJsx(stamped);
    const builderJson = componentToBuilder()({ component });
    expect(builderJson).toMatchSnapshot();

    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis()({ component: backToMitosis });
    expect(mitosis).toMatchSnapshot();
  });

  test('Show', () => {
    const component = parseJsx(show);
    const builderJson = componentToBuilder()({ component });
    expect(builderJson).toMatchSnapshot();

    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis()({ component: backToMitosis });
    expect(mitosis).toMatchSnapshot();
  });

  test('Advanced For', () => {
    const component = parseJsx(advancedFor);
    const builderJson = componentToBuilder()({ component });
    expect(builderJson).toMatchSnapshot();

    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis()({ component: backToMitosis });
    expect(mitosis).toMatchSnapshot();
  });

  test('CustomCode', () => {
    const component = parseJsx(customCode);
    const builderJson = componentToBuilder()({ component });
    expect(builderJson).toMatchSnapshot();

    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis()({ component: backToMitosis });
    expect(mitosis).toMatchSnapshot();
  });

  test('async bindings', () => {
    const component = parseJsx(asyncBindings);
    const builderJson = componentToBuilder()({ component });
    expect(builderJson).toMatchSnapshot();

    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis()({ component: backToMitosis });
    expect(mitosis).toMatchSnapshot();
  });

  test('Embed', () => {
    const component = parseJsx(embed);
    const builderJson = componentToBuilder()({ component });
    expect(builderJson).toMatchSnapshot();

    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis()({ component: backToMitosis });
    expect(mitosis).toMatchSnapshot();
  });

  test('Index inside For', () => {
    const component = parseJsx(indexInFor);
    const builderJson = componentToBuilder()({ component });
    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis()({ component: backToMitosis });
    expect(mitosis).toMatchSnapshot();
  });

  test('Image', () => {
    const component = parseJsx(image);
    const builderJson = componentToBuilder()({ component });
    expect(builderJson).toMatchSnapshot();

    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis()({ component: backToMitosis });
    expect(mitosis).toMatchSnapshot();
  });

  test('Columns', () => {
    const component = parseJsx(columns);
    const builderJson = componentToBuilder()({ component });
    expect(builderJson).toMatchSnapshot();

    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis()({ component: backToMitosis });
    expect(mitosis).toMatchSnapshot();
  });

  test('Section', async () => {
    const component = builderContentToMitosisComponent(JSON.parse(lazyLoadSection));

    const html = await componentToHtml({
      plugins: [compileAwayBuilderComponents()],
    })({ component });

    expect(html).toMatchSnapshot();
  });

  test('Text with bindings', async () => {
    const originalBuilder = JSON.parse(textBindings);
    const component = builderContentToMitosisComponent(originalBuilder);
    const mitosisJsx = componentToMitosis()({ component });

    expect(component).toMatchSnapshot();
    expect(mitosisJsx).toMatchSnapshot();

    const backToBuilder = componentToBuilder()({ component });
    expect(backToBuilder).toMatchSnapshot();
  });

  test('Custom Component Tags in Angular', async () => {
    const originalBuilder = JSON.parse(customComponentTags);
    const component = builderContentToMitosisComponent(originalBuilder, {
      includeMeta: true,
    });
    const angularJsx = componentToAngular()({ component });

    expect(angularJsx).toMatchSnapshot();
  });

  test('Regenerate Image', () => {
    const code = dedent`
      import { useStore } from "@builder.io/mitosis";
      import { Image } from "@components";

      export default function MyComponent(props) {
        const state = useStore({ people: ["Steve", "Sewell"] });

        return (
          <div
            css={{
              padding: "20px",
            }}
          >
            <Image
              image="https://cdn.builder.io/api/v1/image/foobar"
              sizes="100vw"
              backgroundSize="contain"
              css={{
                marignTop: "50px",
                display: "block",
              }}
            />
          </div>
        );
      }
    `;

    const component = parseJsx(code);
    const builderJson = componentToBuilder()({ component });
    const backToMitosis = builderContentToMitosisComponent(builderJson);
    expect(backToMitosis.state).toEqual(component.state);
    const mitosis = componentToMitosis(mitosisOptions)({
      component: backToMitosis,
    });
    expect(mitosis.trim()).toEqual(code.trim());
    const react = componentToReact({
      plugins: [compileAwayBuilderComponents()],
    })({ component });
    expect(react).toMatchSnapshot();
  });

  test('Regenerate Text', () => {
    const code = dedent`
      import { useStore } from "@builder.io/mitosis";

      export default function MyComponent(props) {
        const state = useStore({ people: ["Steve", "Sewell"] });

        return (
          <div
            css={{
              padding: "20px",
            }}
          >
            <h2
              css={{
                marginBottom: "20px",
              }}
            >
              Hello!
            </h2>
          </div>
        );
      }
    `;

    const component = parseJsx(code);
    const builderJson = componentToBuilder()({ component });
    const backToMitosis = builderContentToMitosisComponent(builderJson);

    compileAwayBuilderComponentsFromTree(backToMitosis, compileAwayComponents);

    const mitosis = componentToMitosis(mitosisOptions)({
      component: backToMitosis,
    });
    expect(mitosis.trim()).toEqual(code.trim());
  });

  test('Fragment', () => {
    const code = dedent`
      import { useStore } from "@builder.io/mitosis";

      export default function MyComponent(props) {
        const state = useStore({ people: ["Steve", "Sewell"] });

        return (
          <Fragment>
            Hello!
          </Fragment>
        );
      }
    `;

    const component = parseJsx(code);
    const builderJson = componentToBuilder()({ component });
    expect(builderJson).toMatchSnapshot();
  });

  test('Regenerate loop', () => {
    const code = dedent`
      import { useStore, For } from "@builder.io/mitosis";

      export default function MyComponent(props) {
        const state = useStore({ people: ["Steve", "Sewell"] });

        onMount(() => {
          state.people.push("John");
        });

        return (
          <For each={state.people}>
            {(person, index) => (
              <div
                key={person}
                css={{
                  padding: "10px 0",
                }}
              >
                <span>{person}</span>
                <span>{index}</span>
              </div>
            )}
          </For>
        );
      }
    `;

    const component = parseJsx(code);
    const builderJson = componentToBuilder()({ component });
    const backToMitosis = builderContentToMitosisComponent(builderJson);
    compileAwayBuilderComponentsFromTree(backToMitosis, compileAwayComponents);
    const mitosis = componentToMitosis(mitosisOptions)({
      component: backToMitosis,
    });
    expect(mitosis.trim()).toEqual(code.trim());
  });

  test('Regenerate loop with Text node when using CSS', () => {
    const builderJson: BuilderContent = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            repeat: {
              collection: 'state.submenusItem.menuItems',
            },
            id: 'builder-ID',
            class: 'class-id',
            component: {
              name: 'Text',
              options: {
                text: 'text-content',
              },
            },
            responsiveStyles: {
              large: {
                padding: '2px',
              },
            },
          },
        ],
      },
    } as BuilderContent;
    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis(mitosisOptions)({
      component: backToMitosis,
    });
    expect(mitosis.trim()).toMatchSnapshot();
  });

  test('No srcset for SVG', async () => {
    const builderJson: BuilderContent = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element',
            component: {
              name: 'Image',
              options: {
                image: 'https://cdn.builder.io/api/v1/image/dummy.svg',
                noWebp: true,
              },
            },
          },
        ],
      },
    } as BuilderContent;
    const component = builderContentToMitosisComponent(builderJson);
    const html = await componentToHtml({
      plugins: [compileAwayBuilderComponents()],
    })({ component });
    expect(html).toMatchSnapshot();
  });

  test('Valid Custom Code', async () => {
    const builderJson: BuilderContent = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element',
            component: {
              name: 'CustomCode',
              options: {
                code: `<svg width="200" height="200"></svg>`,
              },
            },
          },
        ],
      },
    } as BuilderContent;
    const component = builderContentToMitosisComponent(builderJson);

    const vue = componentToVue({
      plugins: [compileAwayBuilderComponents()],
    })({ component });
    expect(vue).toMatchSnapshot();

    const react = componentToReact({
      plugins: [compileAwayBuilderComponents()],
    })({ component });
    expect(react).toMatchSnapshot();
  });

  test('Regenerate custom Hero', () => {
    const code = dedent`
      import { Hero } from "@components";

      export default function MyComponent(props) {
        return (
          <Hero
            title="Your Title Here"
            image="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F52dcecf48f9c48cc8ddd8f81fec63236"
            buttonLink="https://example.com"
            buttonText="Click"
            multiBinding={{
              hello: state.message,
            }}
            height={400}
            css={{
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              position: "relative",
              flexShrink: "0",
              boxSizing: "border-box",
              marginTop: "200px",
            }}
          />
        );
      }
    `;

    const component = parseJsx(code);
    expect(component).toMatchSnapshot();
    const builderJson = componentToBuilder()({ component });
    expect(builderJson).toMatchSnapshot();
    const backToMitosis = builderContentToMitosisComponent(builderJson);
    expect(backToMitosis).toMatchSnapshot();
    const mitosis = componentToMitosis(mitosisOptions)({
      component: backToMitosis,
    });
    expect(mitosis.trim()).toEqual(code.trim());
  });

  // TODO: fix divs and CoreFragment - need to find way to reproduce
  test.skip('Regenerate fragments', () => {
    const code = dedent`
      export default function MyComponent(props) {
        return (
          <>
            Hello world

            <>
              <Fragment>Hi</Fragment>
            </>
          </>
        );
      }
    `;

    const component = parseJsx(code);
    expect(component).toMatchSnapshot();
    const builderJson = componentToBuilder()({ component });
    expect(builderJson).toMatchSnapshot();
    const backToMitosis = builderContentToMitosisComponent(builderJson);
    expect(backToMitosis).toMatchSnapshot();
    const mitosis = componentToMitosis(mitosisOptions)({
      component: backToMitosis,
    });
    expect(mitosis.trim()).toEqual(code.trim());
  });

  // TODO: get passing, don't add extra divs. or at least use spans instead so don't break layout
  test.skip('Regenerate span text', () => {
    const code = dedent`
      export default function MyComponent(props) {
        return (
          <div
            css={{
              display: "block",
            }}
          >
            Hi there
            <span
              css={{
                color: "red",
              }}
            >
              Hello world
            </span>
          </div>
        );
      }
    `;

    const component = parseJsx(code);
    const builderJson = componentToBuilder()({ component });
    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis(mitosisOptions)({
      component: backToMitosis,
    });
    expect(mitosis.trim()).toEqual(code.trim());
  });

  test('slots', async () => {
    const component = builderContentToMitosisComponent(JSON.parse(slotsContent));

    const out = await componentToReact({
      plugins: [compileAwayBuilderComponents()],
    })({ component });

    expect(component).toMatchSnapshot();
    expect(out).toMatchSnapshot();
  });

  test('slots2', async () => {
    const component = builderContentToMitosisComponent(JSON.parse(slots2Content));

    const out = await componentToReact({
      plugins: [compileAwayBuilderComponents()],
    })({ component });

    expect(component).toMatchSnapshot();
    expect(out).toMatchSnapshot();
  });

  test('customComponentSlotProperty', async () => {
    const component = builderContentToMitosisComponent(
      JSON.parse(customComponentSlotPropertyContent),
    );

    const out = await componentToReact({
      plugins: [compileAwayBuilderComponents()],
    })({ component });

    expect(component).toMatchSnapshot();
    expect(out).toMatchSnapshot();
  });

  test('booleans', async () => {
    const component = builderContentToMitosisComponent(JSON.parse(booleanContent));

    const out = await componentToReact({
      plugins: [compileAwayBuilderComponents()],
    })({ component });

    expect(component).toMatchSnapshot();
    expect(out).toMatchSnapshot();
  });

  test('tagName', async () => {
    const component = builderContentToMitosisComponent(JSON.parse(tagNameContent));
    expect(component).toMatchInlineSnapshot(`
      {
        "@type": "@builder.io/mitosis/component",
        "children": [
          {
            "@type": "@builder.io/mitosis/node",
            "bindings": {
              "num": {
                "bindingType": "expression",
                "code": "10",
                "type": "single",
              },
            },
            "children": [
              {
                "@type": "@builder.io/mitosis/node",
                "bindings": {},
                "children": [],
                "meta": {},
                "name": "CounterComponent",
                "properties": {
                  "$tagName": "counter",
                },
                "scope": {},
                "slots": {},
              },
            ],
            "meta": {},
            "name": "ProgressBar",
            "properties": {
              "$name": "ProgressBar",
              "$tagName": "progress-bar",
            },
            "scope": {},
            "slots": {},
          },
        ],
        "context": {
          "get": {},
          "set": {},
        },
        "exports": {},
        "hooks": {
          "onEvent": [],
          "onMount": [],
        },
        "imports": [],
        "inputs": undefined,
        "meta": {
          "useMetadata": {
            "httpRequests": undefined,
          },
        },
        "name": "MyComponent",
        "refs": {},
        "state": {},
        "subComponents": [],
      }
    `);

    const react = await componentToReact({})({ component });
    const vue = await componentToVue({})({ component });
    const angular = await componentToAngular({})({ component });

    expect(react).toMatchInlineSnapshot(`
      "import * as React from \\"react\\";

      function MyComponent(props) {
        return (
          <ProgressBar num={10}>
            <CounterComponent />
          </ProgressBar>
        );
      }

      export default MyComponent;
      "
    `);

    expect(vue).toMatchInlineSnapshot(`
      "<template>
        <progress-bar :num=\\"10\\"><counter></counter></progress-bar>
      </template>

      <script>
      import { defineComponent } from \\"vue\\";

      export default defineComponent({
        name: \\"my-component\\",
      });
      </script>"
    `);

    expect(angular).toMatchInlineSnapshot(`
      "import { NgModule } from \\"@angular/core\\";
      import { CommonModule } from \\"@angular/common\\";

      import { Component } from \\"@angular/core\\";

      @Component({
        selector: \\"my-component\\",
        template: \` <progress-bar [num]=\\"10\\"><counter></counter></progress-bar> \`,
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
        imports: [CommonModule, ProgressBarModule, CounterComponentModule],
        exports: [MyComponent],
      })
      export class MyComponentModule {}
      "
    `);
  });

  test('bindings', () => {
    const component = builderContentToMitosisComponent(bindingJson as any as BuilderContent);
    expect(component).toMatchSnapshot();
    const mitosis = componentToMitosis(mitosisOptions)({
      component,
    });
    expect(mitosis).toMatchSnapshot();
  });

  test('localization', () => {
    const originalBuilder = JSON.parse(localization);
    const component = builderContentToMitosisComponent(originalBuilder);
    const mitosisJsx = componentToMitosis()({ component });
    expect(component).toMatchSnapshot();
    expect(mitosisJsx).toMatchSnapshot();

    const backToBuilder = componentToBuilder()({ component });
    expect(backToBuilder).toMatchSnapshot();
  });

  test('null values', () => {
    const component = builderElementToMitosisNode(
      {
        '@type': '@builder.io/sdk:Element' as const,
        '@version': 2,
        id: 'builder-170e19cac58e4c28998d443a9dce80b8',
        component: {
          name: 'CustomText',
          options: {
            text: 'hello',
            text2: null,
          },
        },
        properties: {
          href: '',
        },
      },
      {},
    );

    expect(component).toMatchSnapshot();
  });

  test('preserve cssCode when converting', () => {
    const builderJson: BuilderContent = {
      data: {
        cssCode: dedent`
        .foo {
          background: green;
        }

        .bar {
          font-weight: bold;
        }
      `,
        blocks: [],
      },
    };
    const builderToMitosis = builderContentToMitosisComponent(builderJson);
    expect(builderToMitosis.meta.cssCode).toMatchSnapshot();

    const mitosisToBuilder = componentToBuilder()({ component: builderToMitosis })!;
    expect(mitosisToBuilder.data!.cssCode).toMatchSnapshot();

    const jsx = componentToMitosis(mitosisOptions)({
      component: builderToMitosis,
    });
    expect(jsx).toMatchSnapshot();

    const jsxToMitosis = parseJsx(jsx);
    expect(jsxToMitosis.style).toMatchSnapshot();
  });

  test('do not strip falsey style values', () => {
    const content = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            responsiveStyles: {
              large: {
                background: 'blue',
                zIndex: '0',
              },
            },
            children: [
              {
                '@type': '@builder.io/sdk:Element' as const,
                component: {
                  name: 'Text',
                  options: {
                    text: 'AI Explained',
                  },
                },
              },
            ],
          },
        ],
      },
    };

    const mitosisJson = builderContentToMitosisComponent(content);

    expect(mitosisJson.children[0].bindings).toMatchInlineSnapshot(`
      {
        "css": {
          "bindingType": "expression",
          "code": "{\\"background\\":\\"blue\\",\\"zIndex\\":\\"0\\"}",
          "type": "single",
        },
      }
    `);
  });

  test('do not generate empty expression for width on Column', () => {
    const content = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            component: {
              name: 'Columns',
              options: {
                columns: [{ blocks: [] }, { blocks: [], width: 50 }],
              },
            },
          },
        ],
      },
    };

    const mitosisJson = builderContentToMitosisComponent(content);

    const mitosis = componentToMitosis(mitosisOptions)({
      component: mitosisJson,
    });

    expect(mitosis).toMatchInlineSnapshot(`
      "import { Columns, Column } from \\"@components\\";

      export default function MyComponent(props) {
        return (
          <Columns>
            <Column />
            <Column width={50} />
          </Columns>
        );
      }
      "
    `);
  });

  test('map Column widths', () => {
    const content = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            component: {
              name: 'Columns',
              options: {
                columns: [{ blocks: [], width: 50 }, { blocks: [] }],
              },
            },
          },
        ],
      },
    };

    const mitosisJson = builderContentToMitosisComponent(content);

    const backToBuilder = componentToBuilder()({ component: mitosisJson });
    expect(backToBuilder).toMatchInlineSnapshot(`
      {
        "data": {
          "blocks": [
            {
              "@type": "@builder.io/sdk:Element",
              "actions": {},
              "bindings": {},
              "children": [],
              "code": {
                "actions": {},
                "bindings": {},
              },
              "component": {
                "name": "Columns",
                "options": {
                  "columns": [
                    {
                      "blocks": [],
                      "width": 50,
                    },
                    {
                      "blocks": [],
                    },
                  ],
                },
              },
            },
          ],
          "jsCode": "",
          "tsCode": "",
        },
      }
    `);
  });

  test('nodes as props', () => {
    const content = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            component: {
              name: 'Foo',
              options: {
                prop: [
                  {
                    '@type': '@builder.io/sdk:Element' as const,
                    component: {
                      name: 'Bar',
                      options: {
                        hello: 'world',
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    };

    const mitosisJson = builderContentToMitosisComponent(content);
    expect(mitosisJson).toMatchSnapshot();
    const mitosis = componentToMitosis(mitosisOptions)({
      component: mitosisJson,
    });

    expect(mitosis).toMatchSnapshot();

    const builder = parseJsx(mitosis);
    expect(builder).toMatchSnapshot();
    const json = componentToBuilder()({ component: builder });
    expect(json).toMatchSnapshot();
    expect(json.data?.blocks?.[0]?.component?.name).toBe('Foo');
    expect(json.data?.blocks?.[0]?.component?.options?.prop?.[0]?.component?.options.hello).toBe(
      'world',
    );
  });

  test('preserve bound call expressions for styles', () => {
    const code = dedent`
    import { useStore } from "@builder.io/mitosis";
  
    export default function MyComponent(props) {
      const state = useStore({
        getStyles() {
          return {
            color: 'red'
          }
        }
      })
      return (
        <div style={state.getStyles()} />
      );
    }
  `;

    const component = parseJsx(code);

    expect(component.children[0]).toMatchInlineSnapshot(`
    {
      "@type": "@builder.io/mitosis/node",
      "bindings": {
        "style": {
          "bindingType": "expression",
          "code": "state.getStyles()",
          "type": "single",
        },
      },
      "children": [],
      "meta": {},
      "name": "div",
      "properties": {},
      "scope": {},
    }
  `);

    const builderJson = componentToBuilder()({ component });

    expect(builderJson.data!.blocks![0]).toMatchInlineSnapshot(`
    {
      "@type": "@builder.io/sdk:Element",
      "actions": {},
      "bindings": {
        "style": "state.getStyles()",
      },
      "children": [],
      "code": {
        "actions": {},
        "bindings": {},
      },
      "properties": {},
      "tagName": "div",
    }
  `);

    const backToMitosis = builderContentToMitosisComponent(builderJson);

    expect(backToMitosis.children[0]).toMatchInlineSnapshot(`
    {
      "@type": "@builder.io/mitosis/node",
      "bindings": {
        "style": {
          "bindingType": "expression",
          "code": "state.getStyles()",
          "type": "single",
        },
      },
      "children": [],
      "meta": {},
      "name": "div",
      "properties": {},
      "scope": {},
      "slots": {},
    }
  `);

    const mitosis = componentToMitosis(mitosisOptions)({
      component: backToMitosis,
    });
    expect(mitosis).toMatchInlineSnapshot(`
      "import { useStore } from \\"@builder.io/mitosis\\";

      export default function MyComponent(props) {
        const state = useStore({
          getStyles() {
            return {
              color: \\"red\\",
            };
          },
        });

        return <div style={state.getStyles()} />;
      }
      "
    `);
  });

  test('invalid style values are removed', () => {
    const code = dedent`  
    export default function MyComponent(props) {
      return (
        <div style={false} />
      );
    }
  `;

    const component = parseJsx(code);
    const builderJson = componentToBuilder()({ component });

    expect(builderJson.data!.blocks![0]).toMatchInlineSnapshot(`
      {
        "@type": "@builder.io/sdk:Element",
        "actions": {},
        "bindings": {},
        "children": [],
        "code": {
          "actions": {},
          "bindings": {},
        },
        "properties": {},
        "tagName": "div",
      }
    `);
  });

  test('drop unsupported bound styles to avoid crashes', () => {
    const jsx = `export default function MyComponent(props) {
      return (
        <div
          style={{
            fontSize: state.fontSize,
            '&:hover': {
              backgroundColor: state.foo === 1 ? "red" : "blue"
            }
          }}
        />
      );
    }`;

    const mitosis = parseJsx(jsx);

    const json = componentToBuilder()({ component: mitosis });
    expect(json).toMatchInlineSnapshot(`
      {
        "data": {
          "blocks": [
            {
              "@type": "@builder.io/sdk:Element",
              "actions": {},
              "bindings": {
                "style.fontSize": "state.fontSize",
              },
              "children": [],
              "code": {
                "actions": {},
                "bindings": {},
              },
              "properties": {},
              "tagName": "div",
            },
          ],
          "jsCode": "",
          "tsCode": "",
        },
      }
    `);
  });

  test('map custom component bindings', () => {
    const content = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            '@version': 2,
            component: {
              name: 'Header',
              options: {
                variant: 'h1',
                description: 'Collection description',
                actions: [
                  {
                    '@type': '@builder.io/sdk:Element',
                    '@version': 2,
                    component: {
                      name: 'Button',
                    },
                  },
                  {
                    '@type': '@builder.io/sdk:Element',
                    '@version': 2,
                    component: {
                      name: 'Button',
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    };

    const mitosis = builderContentToMitosisComponent(content);
    expect(mitosis.children).toMatchInlineSnapshot(`
      [
        {
          "@type": "@builder.io/mitosis/node",
          "bindings": {},
          "children": [],
          "meta": {},
          "name": "Header",
          "properties": {
            "$tagName": undefined,
            "description": "Collection description",
            "variant": "h1",
          },
          "scope": {},
          "slots": {
            "actions": [
              {
                "@type": "@builder.io/mitosis/node",
                "bindings": {},
                "children": [],
                "meta": {},
                "name": "Button",
                "properties": {},
                "scope": {},
                "slots": {},
              },
              {
                "@type": "@builder.io/mitosis/node",
                "bindings": {},
                "children": [],
                "meta": {},
                "name": "Button",
                "properties": {},
                "scope": {},
                "slots": {},
              },
            ],
          },
        },
      ]
    `);

    const jsx = componentToMitosis()({ component: mitosis });
    expect(jsx).toMatchInlineSnapshot(`
      "import { Header, Button } from \\"@components\\";

      export default function MyComponent(props) {
        return (
          <Header
            variant=\\"h1\\"
            description=\\"Collection description\\"
            actions={
              <>
                <Button />
                <Button />
              </>
            }
          />
        );
      }
      "
    `);

    const backToMitosis = parseJsx(jsx);
    expect(backToMitosis.children).toMatchInlineSnapshot(`
      [
        {
          "@type": "@builder.io/mitosis/node",
          "bindings": {
            "actions": {
              "bindingType": "expression",
              "code": "<>
                <Button />
                <Button />
              </>",
              "type": "single",
            },
          },
          "children": [],
          "meta": {},
          "name": "Header",
          "properties": {
            "description": "Collection description",
            "variant": "h1",
          },
          "scope": {},
          "slots": {
            "actions": [
              {
                "@type": "@builder.io/mitosis/node",
                "bindings": {},
                "children": [
                  {
                    "@type": "@builder.io/mitosis/node",
                    "bindings": {},
                    "children": [],
                    "meta": {},
                    "name": "Button",
                    "properties": {},
                    "scope": {},
                  },
                  {
                    "@type": "@builder.io/mitosis/node",
                    "bindings": {},
                    "children": [],
                    "meta": {},
                    "name": "Button",
                    "properties": {},
                    "scope": {},
                  },
                ],
                "meta": {},
                "name": "Fragment",
                "properties": {},
                "scope": {},
              },
            ],
          },
        },
      ]
    `);

    const json = componentToBuilder()({ component: backToMitosis });
    expect(json).toMatchInlineSnapshot(`
      {
        "data": {
          "blocks": [
            {
              "@type": "@builder.io/sdk:Element",
              "actions": {},
              "bindings": {},
              "children": [],
              "code": {
                "actions": {},
                "bindings": {},
              },
              "component": {
                "name": "Header",
                "options": {
                  "actions": [
                    {
                      "@type": "@builder.io/sdk:Element",
                      "actions": {},
                      "bindings": {},
                      "children": [
                        {
                          "@type": "@builder.io/sdk:Element",
                          "actions": {},
                          "bindings": {},
                          "children": [],
                          "code": {
                            "actions": {},
                            "bindings": {},
                          },
                          "component": {
                            "name": "Button",
                            "options": {},
                          },
                        },
                        {
                          "@type": "@builder.io/sdk:Element",
                          "actions": {},
                          "bindings": {},
                          "children": [],
                          "code": {
                            "actions": {},
                            "bindings": {},
                          },
                          "component": {
                            "name": "Button",
                            "options": {},
                          },
                        },
                      ],
                      "code": {
                        "actions": {},
                        "bindings": {},
                      },
                      "component": {
                        "name": "Core:Fragment",
                      },
                    },
                  ],
                  "description": "Collection description",
                  "variant": "h1",
                },
              },
            },
          ],
          "jsCode": "",
          "tsCode": "",
        },
      }
    `);
  });

  test('map each component option to either component.options or bindings but not both', () => {
    const jsx = `export default function MyComponent(props) {
      return (
        <Image aspectRatio={1} src={state.src} />
      );
    }`;

    const mitosis = parseJsx(jsx);

    const json = componentToBuilder()({ component: mitosis });
    expect(json).toMatchInlineSnapshot(`
      {
        "data": {
          "blocks": [
            {
              "@type": "@builder.io/sdk:Element",
              "actions": {},
              "bindings": {
                "component.options.src": "state.src",
              },
              "children": [],
              "code": {
                "actions": {},
                "bindings": {
                  "component.options.src": "state.src",
                },
              },
              "component": {
                "name": "Image",
                "options": {
                  "aspectRatio": 1,
                },
              },
            },
          ],
          "jsCode": "",
          "tsCode": "",
        },
      }
    `);
  });

  test('layerLocked property transfer', () => {
    const component = builderElementToMitosisNode(
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-test-layer-locked',
        layerLocked: true,
        layerName: 'test-layer',
        tagName: 'div',
        properties: {
          class: 'test-class',
        },
      } as any,
      {},
    );

    expect(component.properties['data-builder-layerLocked']).toBe('true');
    expect(component.properties.$name).toBe('test-layer');
    expect(component.properties.class).toBe('test-class');
  });

  test('layerLocked undefined does not add property', () => {
    const component = builderElementToMitosisNode(
      {
        '@type': '@builder.io/sdk:Element' as const,
        '@version': 2,
        id: 'builder-test-no-layer-locked',
        tagName: 'div',
      },
      {},
    );

    expect(component.properties['data-builder-layerLocked']).toBeUndefined();
  });

  test('layerLocked roundtrip conversion', () => {
    // Test Builder -> Mitosis -> Builder roundtrip
    const originalBuilder = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            '@version': 2,
            id: 'builder-test-roundtrip',
            layerLocked: true,
            layerName: 'test-layer',
            tagName: 'div',
            properties: {
              class: 'test-class',
            },
          },
        ],
      },
    };

    // Convert to Mitosis
    const mitosisComponent = builderContentToMitosisComponent(originalBuilder);

    // Verify Mitosis conversion
    expect(mitosisComponent.children[0].properties['data-builder-layerLocked']).toBe('true');
    expect(mitosisComponent.children[0].properties.$name).toBe('test-layer');

    // Convert back to Builder
    const backToBuilder = componentToBuilder()({ component: mitosisComponent });

    // Verify roundtrip conversion
    expect(backToBuilder.data?.blocks?.[0]?.layerLocked).toBe(true);
    expect(backToBuilder.data?.blocks?.[0]?.layerName).toBe('test-layer');
  });

  test('groupLocked property transfer', () => {
    const component = builderElementToMitosisNode(
      {
        '@type': '@builder.io/sdk:Element' as const,
        '@version': 2,
        id: 'builder-test-group-locked',
        groupLocked: true,
        layerName: 'test-layer',
        tagName: 'div',
        properties: {
          class: 'test-class',
        },
      },
      {},
    );

    expect(component.properties['data-builder-groupLocked']).toBe('true');
    expect(component.properties.$name).toBe('test-layer');
    expect(component.properties.class).toBe('test-class');
  });

  test('groupLocked undefined does not add property', () => {
    const component = builderElementToMitosisNode(
      {
        '@type': '@builder.io/sdk:Element' as const,
        '@version': 2,
        id: 'builder-test-no-group-locked',
        tagName: 'div',
      },
      {},
    );

    expect(component.properties['data-builder-groupLocked']).toBeUndefined();
  });

  test('groupLocked roundtrip conversion', () => {
    // Test Builder -> Mitosis -> Builder roundtrip
    const originalBuilder = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            '@version': 2,
            id: 'builder-test-group-roundtrip',
            groupLocked: true,
            layerName: 'test-layer',
            tagName: 'div',
            properties: {
              class: 'test-class',
            },
          },
        ],
      },
    };

    // Convert to Mitosis
    const mitosisComponent = builderContentToMitosisComponent(originalBuilder);

    // Verify Mitosis conversion
    expect(mitosisComponent.children[0].properties['data-builder-groupLocked']).toBe('true');
    expect(mitosisComponent.children[0].properties.$name).toBe('test-layer');

    // Convert back to Builder
    const backToBuilder = componentToBuilder()({ component: mitosisComponent });

    // Verify roundtrip conversion
    expect(backToBuilder.data?.blocks?.[0]?.groupLocked).toBe(true);
    expect(backToBuilder.data?.blocks?.[0]?.layerName).toBe('test-layer');
  });

  test('converts <For> loop to Builder format', () => {
    const mitosisComponent: MitosisComponent = {
      '@type': '@builder.io/mitosis/component' as const,
      imports: [],
      exports: {},
      inputs: [],
      meta: {},
      refs: {},
      state: {
        dataBuilderList1: {
          // Should not use this key
          type: 'property',
          code: '[1,2,3,4,5]',
          propertyType: 'normal',
        },
      },
      children: [
        {
          '@type': '@builder.io/mitosis/node',
          name: 'For',
          meta: {},
          scope: {},
          properties: {},
          bindings: {
            each: {
              code: '[1, 2, 3]',
              bindingType: 'expression',
              type: 'single',
            },
          },
          children: [
            {
              '@type': '@builder.io/mitosis/node',
              name: 'div',
              meta: {},
              scope: {},
              properties: {},
              bindings: {},
              children: [],
            },
          ],
        },
      ],
      context: {
        get: {},
        set: {},
      },
      subComponents: [],
      name: 'MyComponent',
      hooks: {
        onMount: [],
        onEvent: [],
      },
    };

    const builderJson = componentToBuilder()({ component: mitosisComponent });

    expect(builderJson).toMatchInlineSnapshot(`
      {
        "data": {
          "blocks": [
            {
              "@type": "@builder.io/sdk:Element",
              "children": [
                {
                  "@type": "@builder.io/sdk:Element",
                  "actions": {},
                  "bindings": {},
                  "children": [],
                  "code": {
                    "actions": {},
                    "bindings": {},
                  },
                  "properties": {},
                  "tagName": "div",
                },
              ],
              "component": {
                "name": "Core:Fragment",
              },
              "repeat": {
                "collection": "state.dataBuilderList2",
              },
            },
          ],
          "jsCode": "Object.assign(state, { dataBuilderList1: [1, 2, 3, 4, 5] });
      ",
          "state": {
            "dataBuilderList1": [
              1,
              2,
              3,
              4,
              5,
            ],
            "dataBuilderList2": [
              1,
              2,
              3,
            ],
          },
          "tsCode": "useStore({ dataBuilderList1: [1, 2, 3, 4, 5] });
      ",
        },
      }
    `);

    // Test roundtrip conversion
    const backToMitosis = builderContentToMitosisComponent(builderJson);
    expect(backToMitosis).toMatchInlineSnapshot(`
      {
        "@type": "@builder.io/mitosis/component",
        "children": [
          {
            "@type": "@builder.io/mitosis/node",
            "bindings": {
              "each": {
                "bindingType": "expression",
                "code": "state.dataBuilderList2",
                "type": "single",
              },
            },
            "children": [
              {
                "@type": "@builder.io/mitosis/node",
                "bindings": {},
                "children": [],
                "meta": {},
                "name": "div",
                "properties": {},
                "scope": {},
                "slots": {},
              },
            ],
            "meta": {},
            "name": "For",
            "properties": {},
            "scope": {
              "forName": "item",
            },
          },
        ],
        "context": {
          "get": {},
          "set": {},
        },
        "exports": {},
        "hooks": {
          "onEvent": [],
          "onMount": [],
        },
        "imports": [],
        "inputs": undefined,
        "meta": {
          "useMetadata": {
            "httpRequests": undefined,
          },
        },
        "name": "MyComponent",
        "refs": {},
        "state": {
          "dataBuilderList1": {
            "code": "[1, 2, 3, 4, 5]",
            "propertyType": "normal",
            "type": "property",
          },
          "dataBuilderList2": {
            "code": "[1,2,3]",
            "propertyType": "normal",
            "type": "property",
          },
        },
        "subComponents": [],
      }
    `);
  });

  test('converts mitosis component with state to builder json and back', () => {
    const mitosisComponent: MitosisComponent = {
      '@type': '@builder.io/mitosis/component',
      imports: [],
      exports: {},
      meta: {
        useMetadata: {},
      },
      refs: {},
      state: {
        dataBuilderList1: {
          type: 'property',
          code: '[1,2,3]',
          propertyType: 'normal',
        },
        stringValue: {
          type: 'property',
          code: 'hello',
          propertyType: 'normal',
        },
        numberValue: {
          type: 'property',
          code: '1',
          propertyType: 'normal',
        },
        booleanValue: {
          type: 'property',
          code: 'true',
          propertyType: 'normal',
        },
        nullValue: {
          type: 'property',
          code: 'null',
          propertyType: 'normal',
        },
        undefinedValue: {
          type: 'property',
          code: 'undefined',
          propertyType: 'normal',
        },
        fn: {
          code: 'function () {\n  console.log("fn");\n}',
          type: 'function',
        },
      },
      children: [
        {
          '@type': '@builder.io/mitosis/node',
          name: 'For',
          meta: {},
          scope: {
            forName: 'item',
          },
          properties: {},
          bindings: {
            each: {
              code: 'state.dataBuilderList1',
              bindingType: 'expression',
              type: 'single',
            },
          },
          children: [
            {
              '@type': '@builder.io/mitosis/node',
              name: 'div',
              meta: {},
              scope: {},
              properties: {},
              bindings: {},
              children: [
                {
                  '@type': '@builder.io/mitosis/node',
                  name: 'div',
                  meta: {},
                  scope: {},
                  properties: {
                    _text: 'Hello',
                  },
                  bindings: {},
                  children: [],
                },
              ],
              slots: {},
            },
          ],
        },
      ],
      context: {
        get: {},
        set: {},
      },
      inputs: [],
      subComponents: [],
      name: 'MyComponent',
      hooks: {
        onMount: [],
        onEvent: [],
      },
    };

    const builderJson = componentToBuilder()({ component: mitosisComponent });
    expect(builderJson).toMatchInlineSnapshot(`
      {
        "data": {
          "blocks": [
            {
              "@type": "@builder.io/sdk:Element",
              "children": [
                {
                  "@type": "@builder.io/sdk:Element",
                  "actions": {},
                  "bindings": {},
                  "children": [
                    {
                      "@type": "@builder.io/sdk:Element",
                      "bindings": {},
                      "component": {
                        "name": "Text",
                        "options": {
                          "text": "Hello",
                        },
                      },
                      "tagName": "span",
                    },
                  ],
                  "code": {
                    "actions": {},
                    "bindings": {},
                  },
                  "properties": {},
                  "tagName": "div",
                },
              ],
              "component": {
                "name": "Core:Fragment",
              },
              "repeat": {
                "collection": "state.dataBuilderList1",
                "itemName": "item",
              },
            },
          ],
          "jsCode": "Object.assign(state, {
        dataBuilderList1: [1, 2, 3],
        stringValue: hello,
        numberValue: 1,
        booleanValue: true,
        nullValue: null,
        undefinedValue: undefined,
        fn: function () {
          console.log(\\"fn\\");
        },
      });
      ",
          "state": {
            "booleanValue": true,
            "dataBuilderList1": [
              1,
              2,
              3,
            ],
            "nullValue": null,
            "numberValue": 1,
            "stringValue": "hello",
          },
          "tsCode": "useStore({
        dataBuilderList1: [1, 2, 3],
        stringValue: hello,
        numberValue: 1,
        booleanValue: true,
        nullValue: null,
        undefinedValue: undefined,
        fn: function () {
          console.log(\\"fn\\");
        },
      });
      ",
        },
      }
    `);

    const backToMitosis = builderContentToMitosisComponent(builderJson);
    expect(backToMitosis.children[0].name).toBe('For');
    expect(backToMitosis.children[0].bindings.each?.code).toBe('state.dataBuilderList1');
    expect(backToMitosis.state?.dataBuilderList1?.code).toBe('[1, 2, 3]');
    expect(backToMitosis.state?.fn?.code).toBe('function () {\n  console.log("fn");\n}');
    expect(backToMitosis.state?.stringValue?.code).toBe('hello');
    expect(backToMitosis.state?.numberValue?.code).toBe('1');
    expect(backToMitosis.state?.booleanValue?.code).toBe('true');
    expect(backToMitosis.state?.nullValue?.code).toBe('null');
    expect(backToMitosis.state?.undefinedValue?.code).toBe('undefined');
  });

  test('handles recursive component structure', () => {
    const mitosisComponent: MitosisComponent = {
      '@type': '@builder.io/mitosis/component' as const,
      imports: [],
      exports: {
        LocationTree: {
          code: 'function LocationTree(location) {\n  return <>\n      {location.child && <LocationTree location={location.child} />}\n    </>;\n}',
          isFunction: true,
          usedInLocal: false,
        },
      },
      inputs: [],
      meta: {},
      refs: {},
      state: {},
      children: [
        {
          '@type': '@builder.io/mitosis/node',
          name: 'LocationTree',
          meta: {},
          scope: {},
          properties: {},
          bindings: {},
          children: [],
        },
      ],
      context: {
        get: {},
        set: {},
      },
      subComponents: [
        {
          '@type': '@builder.io/mitosis/component',
          imports: [],
          exports: {},
          inputs: [],
          meta: {},
          refs: {},
          state: {},
          children: [
            {
              '@type': '@builder.io/mitosis/node',
              name: 'Fragment',
              meta: {},
              scope: {},
              properties: {},
              bindings: {},
              children: [
                {
                  '@type': '@builder.io/mitosis/node',
                  name: 'Show',
                  meta: {},
                  scope: {},
                  properties: {},
                  bindings: {
                    when: {
                      code: 'location.child',
                      bindingType: 'expression',
                      type: 'single',
                    },
                  },
                  children: [
                    {
                      '@type': '@builder.io/mitosis/node',
                      name: 'LocationTree',
                      meta: {},
                      scope: {},
                      properties: {},
                      bindings: {
                        location: {
                          code: 'location.child',
                          bindingType: 'expression',
                          type: 'single',
                        },
                      },
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
          context: {
            get: {},
            set: {},
          },
          subComponents: [],
          name: 'LocationTree',
          hooks: {
            onMount: [],
            onEvent: [],
          },
        },
      ],
      name: 'ExploreKaryakar',
      hooks: {
        onMount: [],
        onEvent: [],
      },
    };

    const builderJson = componentToBuilder({})({
      component: mitosisComponent,
    });
    expect(builderJson.data?.blocks?.[0]?.component?.name).toBe('LocationTree');
    let tempElement = builderJson.data?.blocks?.[0];
    for (let i = 0; i < 5; i++) {
      expect(tempElement?.component?.name).toBe('LocationTree');
      tempElement = get(
        tempElement,
        'component.options.symbol.content.data.blocks[0].children[0].children[0]',
      );
    }
    expect(tempElement).toBeUndefined();
    expect(builderJson).toMatchSnapshot();

    expect(() => builderContentToMitosisComponent(builderJson)).not.toThrow();
  });
});

const bindingJson = {
  data: {
    inputs: [
      {
        '@type': '@builder.io/core:Field',
        meta: {},
        name: 'text',
        type: 'text',
        defaultValue: 'Hello',
        required: false,
        subFields: [],
        helperText: '',
        autoFocus: false,
        simpleTextOnly: false,
        disallowRemove: false,
        broadcast: false,
        bubble: false,
        hideFromUI: false,
        hideFromFieldsEditor: false,
        showTemplatePicker: true,
        permissionsRequiredToEdit: '',
        advanced: false,
        copyOnAdd: true,
        onChange: '',
        showIf: '',
        mandatory: false,
        hidden: false,
        noPhotoPicker: false,
        model: '',
        supportsAiGeneration: false,
        defaultCollapsed: false,
      },
    ],
    cssCode: 'builder-component { max-width: none !important; }',
    blocks: [
      {
        component: {
          name: 'Button',
          options: {
            label: 'hello',
          },
        },
        code: {
          bindings: {
            'component.options.label': 'state.text',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-1e4cca42847b4712ae978bc679bf1d4a',
        meta: {
          id: '103:1952',
          type: 'COMPONENT',
          name: 'Frame 94',
          componentProperties: null,
          fromFigma: true,
          vcpImportId: 'vcp-635bba9daed9496f82e2b1009dff92a2',
        },
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            bindings: {
              'component.options.text': 'var _virtual_index=state.text;return _virtual_index',
            },
            code: { bindings: { 'component.options.text': 'state.text' } },
            layerName: 'Book an Appointment',
            id: 'builder-559bbc2a33124e8e843ddec300dcb5a9',
            meta: {
              id: '103:1951',
              type: 'TEXT',
              name: 'Book an Appointment',
              componentPropertyReferences: { characters: 'Text#103:0' },
            },
            component: { name: 'Text', options: { text: 'BUY NOW' } },
          },
        ],
        responsiveStyles: {
          large: {
            backgroundColor: 'rgba(0, 0, 0, 1)',
            display: 'flex',
            paddingLeft: '72px',
            paddingRight: '72px',
            paddingTop: '25px',
            paddingBottom: '25px',
            alignItems: 'start',
            gap: '10px',
            fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 1)',
            fontWeight: '700',
            textTransform: 'uppercase',
            justifyContent: 'start',
          },
        },
      },
    ],
  },
};

describe('Symbol Serialization', () => {
  test('Symbol with basic metadata', () => {
    const builderContent = JSON.parse(symbolBasic) as BuilderContent;
    const component = builderContentToMitosisComponent(builderContent);
    const mitosis = componentToMitosis(mitosisOptions)({ component });

    // Verify symbol name is sanitized and prefixed
    expect(component.children[0].name).toBe('SymbolBasicSymbol');
    expect(mitosis).toMatchSnapshot();
  });

  test('Symbol with entry name', () => {
    const builderContent = JSON.parse(symbolWithNamedEntry) as BuilderContent;
    const component = builderContentToMitosisComponent(builderContent);
    const mitosis = componentToMitosis(mitosisOptions)({ component });

    // Verify symbol name is sanitized and prefixed
    expect(component.children[0].name).toBe('SymbolHeaderNavigation');
    expect(mitosis).toMatchSnapshot();
  });

  test('Symbol with inputs as top-level props', () => {
    const builderContent = JSON.parse(symbolWithInputs) as BuilderContent;
    const component = builderContentToMitosisComponent(builderContent);
    const mitosis = componentToMitosis(mitosisOptions)({ component });

    // Verify inputs are top-level bindings
    const symbolNode = component.children[0];
    expect(symbolNode.name).toBe('SymbolButtonComponent');
    expect(symbolNode.bindings).toHaveProperty('buttonText');
    expect(symbolNode.bindings).toHaveProperty('variant');
    expect(symbolNode.bindings).toHaveProperty('isDisabled');
    expect(symbolNode.bindings).toHaveProperty('count');
    expect(symbolNode.bindings).toHaveProperty('config');
    expect(symbolNode.bindings.symbol).toBeDefined();

    // Verify symbol binding doesn't contain data anymore
    const symbolBinding = JSON.parse(symbolNode.bindings.symbol.code);
    expect(symbolBinding.data).toBeUndefined();

    expect(mitosis).toMatchSnapshot();
  });

  test('Multiple symbols with different names', () => {
    const builderContent = JSON.parse(symbolMultiple) as BuilderContent;
    const component = builderContentToMitosisComponent(builderContent);
    const mitosis = componentToMitosis(mitosisOptions)({ component });

    // Verify each symbol has unique name
    expect(component.children[0].name).toBe('SymbolPrimaryButton');
    expect(component.children[1].name).toBe('SymbolSecondaryButton');
    expect(component.children[2].name).toBe('SymbolFooterSection');

    // Verify inputs are extracted for each
    expect(component.children[0].bindings).toHaveProperty('text');
    expect(component.children[0].bindings).toHaveProperty('variant');
    expect(component.children[1].bindings).toHaveProperty('text');
    expect(component.children[1].bindings).toHaveProperty('variant');
    expect(component.children[2].bindings).toHaveProperty('copyrightText');
    expect(component.children[2].bindings).toHaveProperty('showSocialLinks');

    expect(mitosis).toMatchSnapshot();
  });

  test('Symbol roundtrip: Builder -> Mitosis -> Builder', () => {
    const original = JSON.parse(symbolWithInputs) as BuilderContent;
    const mitosisComponent = builderContentToMitosisComponent(original);
    const backToBuilder = componentToBuilder()({ component: mitosisComponent });

    // Verify the symbol structure is preserved
    const originalSymbol = original.data?.blocks?.[0];
    const roundtripSymbol = backToBuilder.data?.blocks?.[0];

    expect(roundtripSymbol?.component?.name).toBeDefined();
    expect(roundtripSymbol?.component?.options?.symbol).toBeDefined();
  });
});
