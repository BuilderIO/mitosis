import dedent from 'dedent';
import { componentToBuilder } from '../generators/builder';
import { componentToJsxLite } from '../generators/jsx-lite';
import {
  builderContentToJsxLiteComponent,
  extractStateHook,
} from '../parsers/builder';
import { parseJsx } from '../parsers/jsx';

const stamped = require('./data/blocks/stamped-io.raw');
const customCode = require('./data/blocks/custom-code.raw');
const embed = require('./data/blocks/embed.raw');
const image = require('./data/blocks/image.raw');
const columns = require('./data/blocks/columns.raw');

describe('Builder', () => {
  test('extractStateHook', () => {
    const code = `useState({ foo: 'bar' }); alert('hi');`;
    expect(extractStateHook(code)).toEqual({
      code: `alert('hi');`,
      state: { foo: 'bar' },
    });

    const code2 = `Object.assign(state, { foo: 'bar' }); alert('hi');`;
    expect(extractStateHook(code)).toEqual({
      code: `alert('hi');`,
      state: { foo: 'bar' },
    });
  });

  test('Stamped', () => {
    const json = parseJsx(stamped);
    const builderJson = componentToBuilder(json);
    expect(builderJson).toMatchSnapshot();

    const backToJsxLite = builderContentToJsxLiteComponent(builderJson);
    const jsxLite = componentToJsxLite(backToJsxLite);
    expect(jsxLite).toMatchSnapshot();
  });

  test('CustomCode', () => {
    const json = parseJsx(customCode);
    const builderJson = componentToBuilder(json);
    expect(builderJson).toMatchSnapshot();

    const backToJsxLite = builderContentToJsxLiteComponent(builderJson);
    const jsxLite = componentToJsxLite(backToJsxLite);
    expect(jsxLite).toMatchSnapshot();
  });

  test('Embed', () => {
    const json = parseJsx(embed);
    const builderJson = componentToBuilder(json);
    expect(builderJson).toMatchSnapshot();

    const backToJsxLite = builderContentToJsxLiteComponent(builderJson);
    const jsxLite = componentToJsxLite(backToJsxLite);
    expect(jsxLite).toMatchSnapshot();
  });

  test('Image', () => {
    const json = parseJsx(image);
    const builderJson = componentToBuilder(json);
    expect(builderJson).toMatchSnapshot();

    const backToJsxLite = builderContentToJsxLiteComponent(builderJson);
    const jsxLite = componentToJsxLite(backToJsxLite);
    expect(jsxLite).toMatchSnapshot();
  });

  test('Columns', () => {
    const json = parseJsx(columns);
    const builderJson = componentToBuilder(json);
    expect(builderJson).toMatchSnapshot();

    const backToJsxLite = builderContentToJsxLiteComponent(builderJson);
    const jsxLite = componentToJsxLite(backToJsxLite);
    expect(jsxLite).toMatchSnapshot();
  });

  test('Regenerate Image', () => {
    const code = dedent`
      import { useState } from "@jsx-lite/core";
      import { Image } from "@builder.io/components";

      export default function MyComponent(props) {
        const state = useState({ people: ["Steve", "Sewell"] });
      
        return (
          <div
            css={{
              padding: "20px",
            }}
          >
            <Image
              image="hi"
              css={{
                display: "block",
              }}
            />
          </div>
        );
      }
    `;

    const json = parseJsx(code);
    const builderJson = componentToBuilder(json);
    const backToJsxLite = builderContentToJsxLiteComponent(builderJson);
    const jsxLite = componentToJsxLite(backToJsxLite);
    expect(jsxLite.trim()).toEqual(code.trim());
  });

  test('Regenerate Text', () => {
    const code = dedent`
      import { useState } from "@jsx-lite/core";

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
    const backToJsxLite = builderContentToJsxLiteComponent(builderJson);
    const jsxLite = componentToJsxLite(backToJsxLite);
    expect(jsxLite.trim()).toEqual(code.trim());
  });

  test('Regenerate loop', () => {
    const code = dedent`
      import { useState, For } from "@jsx-lite/core";

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
    const backToJsxLite = builderContentToJsxLiteComponent(builderJson);
    const jsxLite = componentToJsxLite(backToJsxLite);
    expect(jsxLite.trim()).toEqual(code.trim());
  });

  test('Regenerate custom Hero', () => {
    const code = dedent`
      import { Hero } from "@builder.io/components";

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
    const backToJsxLite = builderContentToJsxLiteComponent(builderJson);
    expect(backToJsxLite).toMatchSnapshot();
    const jsxLite = componentToJsxLite(backToJsxLite);
    expect(jsxLite.trim()).toEqual(code.trim());
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
    const backToJsxLite = builderContentToJsxLiteComponent(builderJson);
    expect(backToJsxLite).toMatchSnapshot();
    const jsxLite = componentToJsxLite(backToJsxLite);
    expect(jsxLite.trim()).toEqual(code.trim());
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
    const backToJsxLite = builderContentToJsxLiteComponent(builderJson);
    const jsxLite = componentToJsxLite(backToJsxLite);
    expect(jsxLite.trim()).toEqual(code.trim());
  });
});
