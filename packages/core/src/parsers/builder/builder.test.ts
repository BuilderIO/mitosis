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
    expect(output.children[0].properties.text).toBe('Hello  World. Welcome to section');
    // Verify unpaired surrogates are removed
    expect(output.children[0].properties.text).not.toContain('\uD800');
    expect(output.children[0].properties.text).not.toContain('\uDFFF');
  });
});
