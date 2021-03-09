import dedent from 'dedent';
import { componentToBuilder } from '../generators/builder';
import { componentToJsxLite } from '../generators/jsx-lite';
import { builderContentToJsxLiteComponent } from '../parsers/builder';
import { parseJsx } from '../parsers/jsx';

describe('Builder', () => {
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
