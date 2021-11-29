import dedent from 'dedent';
import * as fs from 'fs';
import { componentToBuilder } from '../generators/builder';
import { componentToMitosis } from '../generators/mitosis';
import { componentToHtml } from '../generators/html';
import {
  builderContentToMitosisComponent,
  extractStateHook,
} from '../parsers/builder';
import { parseJsx } from '../parsers/jsx';
import { compileAwayBuilderComponents } from '../plugins/compile-away-builder-components';
import { componentToReact } from '..';

/**
 * Load a file using nodejs resolution as a string.
 */
function fixture(path: string): string {
  const localpath = require.resolve(path);
  return fs.readFileSync(localpath, { encoding: 'utf-8' });
}

const stamped = fixture('./data/blocks/stamped-io.raw');
const customCode = fixture('./data/blocks/custom-code.raw');
const embed = fixture('./data/blocks/embed.raw');
const image = fixture('./data/blocks/image.raw');
const columns = fixture('./data/blocks/columns.raw');
const lazyLoadSection = JSON.parse(
  fixture('./data/builder/lazy-load-section.json'),
);

describe('Builder', () => {
  test('extractStateHook', () => {
    const code = `useState({ foo: 'bar' }); alert('hi');`;
    expect(extractStateHook(code)).toEqual({
      code: `alert('hi');`,
      state: { foo: 'bar' },
    });

    expect(extractStateHook(code)).toEqual({
      code: `alert('hi');`,
      state: { foo: 'bar' },
    });
  });

  test('Stamped', () => {
    const json = parseJsx(stamped);
    const builderJson = componentToBuilder(json);
    expect(builderJson).toMatchSnapshot();

    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis(backToMitosis);
    expect(mitosis).toMatchSnapshot();
  });

  test('CustomCode', () => {
    const json = parseJsx(customCode);
    const builderJson = componentToBuilder(json);
    expect(builderJson).toMatchSnapshot();

    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis(backToMitosis);
    expect(mitosis).toMatchSnapshot();
  });

  test('Embed', () => {
    const json = parseJsx(embed);
    const builderJson = componentToBuilder(json);
    expect(builderJson).toMatchSnapshot();

    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis(backToMitosis);
    expect(mitosis).toMatchSnapshot();
  });

  test('Image', () => {
    const json = parseJsx(image);
    const builderJson = componentToBuilder(json);
    expect(builderJson).toMatchSnapshot();

    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis(backToMitosis);
    expect(mitosis).toMatchSnapshot();
  });

  test('Columns', () => {
    const json = parseJsx(columns);
    const builderJson = componentToBuilder(json);
    expect(builderJson).toMatchSnapshot();

    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis(backToMitosis);
    expect(mitosis).toMatchSnapshot();
  });

  test('Section', async () => {
    const mitosisComponent = builderContentToMitosisComponent(lazyLoadSection);

    const html = await componentToHtml(mitosisComponent, {
      plugins: [compileAwayBuilderComponents()],
    });

    expect(html).toMatchSnapshot();
  });

  test('Regenerate Image', () => {
    const code = dedent`
      import { useState } from "@builder.io/mitosis";
      import { Image } from "@components";

      export default function MyComponent(props) {
        const state = useState({ people: ["Steve", "Sewell"] });

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

    const json = parseJsx(code);
    const builderJson = componentToBuilder(json);
    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis(backToMitosis, {
      format: 'legacy',
    });
    expect(mitosis.trim()).toEqual(code.trim());
    const react = componentToReact(json, {
      plugins: [compileAwayBuilderComponents()],
    });
    expect(react).toMatchSnapshot();
  });

  test('Regenerate Text', () => {
    const code = dedent`
      import { useState } from "@builder.io/mitosis";

      export default function MyComponent(props) {
        const state = useState({ people: ["Steve", "Sewell"] });

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

    const json = parseJsx(code);
    const builderJson = componentToBuilder(json);
    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis(backToMitosis, {
      format: 'legacy',
    });
    expect(mitosis.trim()).toEqual(code.trim());
  });

  test('Regenerate loop', () => {
    const code = dedent`
      import { useState, For } from "@builder.io/mitosis";

      export default function MyComponent(props) {
        const state = useState({ people: ["Steve", "Sewell"] });

        return (
          <For each={state.people}>
            {(person, index) => (
              <div
                key={person}
                css={{
                  padding: "10px 0",
                }}
              >
                {person}
              </div>
            )}
          </For>
        );
      }
    `;

    const json = parseJsx(code);
    const builderJson = componentToBuilder(json);
    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis(backToMitosis, {
      format: 'legacy',
    });
    expect(mitosis.trim()).toEqual(code.trim());
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

    const json = parseJsx(code);
    expect(json).toMatchSnapshot();
    const builderJson = componentToBuilder(json);
    expect(builderJson).toMatchSnapshot();
    const backToMitosis = builderContentToMitosisComponent(builderJson);
    expect(backToMitosis).toMatchSnapshot();
    const mitosis = componentToMitosis(backToMitosis, {
      format: 'legacy',
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

    const json = parseJsx(code);
    expect(json).toMatchSnapshot();
    const builderJson = componentToBuilder(json);
    expect(builderJson).toMatchSnapshot();
    const backToMitosis = builderContentToMitosisComponent(builderJson);
    expect(backToMitosis).toMatchSnapshot();
    const mitosis = componentToMitosis(backToMitosis, {
      format: 'legacy',
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

    const json = parseJsx(code);
    const builderJson = componentToBuilder(json);
    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis(backToMitosis, {
      format: 'legacy',
    });
    expect(mitosis.trim()).toEqual(code.trim());
  });
});
