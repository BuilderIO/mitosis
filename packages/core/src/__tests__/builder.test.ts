import { componentToReact, ToMitosisOptions } from '..';
import { componentToBuilder } from '../generators/builder';
import { componentToHtml } from '../generators/html';
import { componentToMitosis } from '../generators/mitosis';
import { dedent } from '../helpers/dedent';
import { builderContentToMitosisComponent, extractStateHook } from '../parsers/builder';
import { parseJsx } from '../parsers/jsx';
import { compileAwayBuilderComponents } from '../plugins/compile-away-builder-components';

import { BuilderContent } from '@builder.io/sdk';
import columns from './data/blocks/columns.raw.tsx?raw';
import customCode from './data/blocks/custom-code.raw.tsx?raw';
import embed from './data/blocks/embed.raw.tsx?raw';
import image from './data/blocks/image.raw.tsx?raw';
import stamped from './data/blocks/stamped-io.raw.tsx?raw';
import booleanContent from './data/builder/boolean.json?raw';
import customComponentSlotPropertyContent from './data/builder/custom-component-slot-property.json?raw';
import lazyLoadSection from './data/builder/lazy-load-section.json?raw';
import slotsContent from './data/builder/slots.json?raw';
import slots2Content from './data/builder/slots2.json?raw';

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

  test('CustomCode', () => {
    const component = parseJsx(customCode);
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
    const mitosis = componentToMitosis(mitosisOptions)({
      component: backToMitosis,
    });
    expect(mitosis.trim()).toEqual(code.trim());
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

  test('binding', () => {
    const component = builderContentToMitosisComponent(bindingJson as any as BuilderContent);
    expect(component).toMatchSnapshot();
    const mitosis = componentToMitosis(mitosisOptions)({
      component,
    });
    expect(mitosis).toMatchSnapshot();
  });

  test.only('preserve cssCode when converting', () => {
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
