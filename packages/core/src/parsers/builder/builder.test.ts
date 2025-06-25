import { componentToBuilder } from '@/generators/builder';
import { BuilderContent } from '@builder.io/sdk';
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
    expect(output.children[0].children[0].properties._text).toBe(
      'Hello  World. Welcome to section',
    );
    // Verify unpaired surrogates are removed
    expect(output.children[0].children[0].properties._text).not.toContain('\uD800');
    expect(output.children[0].children[0].properties._text).not.toContain('\uDFFF');
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
});
