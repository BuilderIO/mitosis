import { componentToBuilder } from '@/generators/builder';
import { componentToMitosis } from '@/generators/mitosis';
import { BuilderContent } from '@builder.io/sdk';
import { parseJsx } from '../jsx';
import { builderContentToMitosisComponent } from './builder';

describe('Unpaired Surrogates', () => {
  test('removes unpaired surrogates from Text component content', () => {
    const builderContent: BuilderContent = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            component: {
              name: 'Text',
              options: {
                text: `Hello \uD800 World. Welcome to \uDFFF section`,
              },
            },
          },
        ],
      },
    };

    const output = builderContentToMitosisComponent(builderContent);
    // Text should be cleaned of unpaired surrogates
    expect(output.children[0].properties.text).toBe('Hello  World. Welcome to section');
    // Verify unpaired surrogates are removed
    expect(output.children[0].properties.text).not.toContain('\uD800');
    expect(output.children[0].properties.text).not.toContain('\uDFFF');
  });

  test('should handle builder component with/without a colon in the name', () => {
    const builderContent: BuilderContent = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            component: {
              name: 'Text:123',
              options: {
                text: 'Hello World',
              },
            },
          },
          {
            '@type': '@builder.io/sdk:Element' as const,
            component: {
              name: 'Text123',
              options: {
                text: 'Hello World',
              },
            },
          },
        ],
      },
    };

    const component = builderContentToMitosisComponent(builderContent);
    expect(component.children[0].name).toBe('Text123');
    expect(component.children[1].name).toBe('Text123');
    const backToBuilder = componentToBuilder()({ component });
    expect(backToBuilder?.data?.blocks?.[0]?.component?.name).toBe('Text:123');
    expect(backToBuilder?.data?.blocks?.[1]?.component?.name).toBe('Text123');
  });

  test('should handle builder content -> mitosis json -> mitosis jsx -> mitosis json -> builder content', () => {
    const builderContent: BuilderContent = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            component: {
              name: 'Text:123',
              options: {
                text: 'Hello World',
              },
            },
          },
        ],
      },
    };

    // Convert Builder JSON to Mitosis JSON
    const mitosisCmp = builderContentToMitosisComponent(builderContent);
    expect(mitosisCmp.children[0].name).toBe('Text123');
    expect(mitosisCmp.children[0].properties['data-builder-originalName']).toBe('Text:123');

    // Convert Mitosis JSON to Mitosis JSX
    const mitosisJsx = componentToMitosis()({ component: mitosisCmp });
    expect(mitosisJsx).toMatchInlineSnapshot(`
      "import { Text123 } from \\"@components\\";

      export default function MyComponent(props) {
        return <Text123 text=\\"Hello World\\" data-builder-originalName=\\"Text:123\\" />;
      }
      "
    `);

    // Convert back Mitosis JSX to Mitosis JSON
    const backToMitosisCmp = parseJsx(mitosisJsx);
    expect(backToMitosisCmp.children[0].name).toBe('Text123');
    expect(backToMitosisCmp.children[0].properties['data-builder-originalName']).toBe('Text:123');

    // Convert back Mitosis JSON to Builder JSON
    const backToBuilder = componentToBuilder()({ component: backToMitosisCmp });
    expect(backToBuilder?.data?.blocks?.[0]?.component?.name).toBe('Text:123');
    expect(backToBuilder?.data?.blocks?.[0]?.component?.options).not.toHaveProperty(
      'data-builder-originalName',
    );
  });

  test('should handle component names starting with numbers', () => {
    const builderContent: BuilderContent = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            component: {
              name: '123Button',
              options: {
                text: 'Click Me',
              },
            },
          },
        ],
      },
    };

    // Convert Builder JSON to Mitosis JSON
    const mitosisCmp = builderContentToMitosisComponent(builderContent);
    expect(mitosisCmp.children[0].name).toBe('T123Button');
    expect(mitosisCmp.children[0].properties['data-builder-originalName']).toBe('123Button');

    // Convert Mitosis JSON to Mitosis JSX
    const mitosisJsx = componentToMitosis()({ component: mitosisCmp });
    expect(mitosisJsx).toMatchInlineSnapshot(`
      "import { T123Button } from \\"@components\\";

      export default function MyComponent(props) {
        return <T123Button text=\\"Click Me\\" data-builder-originalName=\\"123Button\\" />;
      }
      "
    `);

    // Convert back Mitosis JSX to Mitosis JSON
    const backToMitosisCmp = parseJsx(mitosisJsx);
    expect(backToMitosisCmp.children[0].name).toBe('T123Button');
    expect(backToMitosisCmp.children[0].properties['data-builder-originalName']).toBe('123Button');

    // Convert back Mitosis JSON to Builder JSON
    const backToBuilder = componentToBuilder()({ component: backToMitosisCmp });
    expect(backToBuilder?.data?.blocks?.[0]?.component?.name).toBe('123Button');
    expect(backToBuilder?.data?.blocks?.[0]?.component?.options).not.toHaveProperty(
      'data-builder-originalName',
    );
  });
});
