import { componentToBuilder } from '@/generators/builder';
import { componentToMitosis } from '@/generators/mitosis';
import { builderContentToMitosisComponent } from '@/parsers/builder';
import { parseJsx } from '@/parsers/jsx';
import { describe, test } from 'vitest';
import { dedent } from '@/helpers/dedent';

describe('Builder Personalization Container/Variants', () => {
  test('Snapshot PersonalizedContainer', () => {
    const code = dedent`
      import { PersonalizationContainer, Variant } from "@components";
  
      export default function MyComponent(props) {
        return (
          <PersonalizationContainer>
            <Variant
              name="variant1"
              startDate="2024-01-01"
              query={{
                property: "urlPath",
                operation: "is",
                value: "/home",
              }}
            >
              <div>Home</div>
              <div>Div</div>
            </Variant>
            <PersonalizationOption
              name="2"
              query={[
                {
                  property: "favoriteColor",
                  operation: "is",
                  value: ["red", "blue"],
                },
              ]}
            >
              <>Red</>
            </PersonalizationOption>
            <Variant>
              <div>Default</div>
            </Variant>
            <div>More tree</div>
  
          </PersonalizationContainer>
        );
      }
    `;
  
    const component = parseJsx(code);
    const builderJson = componentToBuilder()({ component });
    expect(builderJson.data?.blocks?.[0]).toMatchSnapshot();
  
    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis({
        format: 'legacy',
      })({
      component: backToMitosis,
    });
    expect(mitosis.trim()).toMatchInlineSnapshot(`
      "import { PersonalizationContainer, Variant, Fragment } from \\"@components\\";

      export default function MyComponent(props) {
        return (
          <PersonalizationContainer>
            <Variant
              name=\\"variant1\\"
              startDate=\\"2024-01-01\\"
              query={[
                {
                  property: \\"urlPath\\",
                  operation: \\"is\\",
                  value: \\"/home\\",
                },
              ]}
            >
              <div>Home</div>
              <div>Div</div>
            </Variant>
            <Variant
              name=\\"2\\"
              query={[
                {
                  property: \\"favoriteColor\\",
                  operation: \\"is\\",
                  value: [\\"red\\", \\"blue\\"],
                },
              ]}
            >
              <Fragment>Red</Fragment>
            </Variant>
            <Variant default=\\"\\">
              <div>Default</div>
              <div>More tree</div>
            </Variant>
          </PersonalizationContainer>
        );
      }"
    `);
  });
  
  test('Regenerate PersonalizedContainer', () => {
    const code = dedent`
      import { PersonalizationContainer, Variant } from "@components";
  
      export default function MyComponent(props) {
        return (
          <PersonalizationContainer>
            <Variant
              name="2"
              startDate="2024-01-01"
              endDate="2024-01-31"
              query={[
                {
                  property: "favoriteColor",
                  operation: "is",
                  value: "red",
                },
              ]}
            >
              <div>Red</div>
            </Variant>
            <Variant default="">
              <div>Default</div>
            </Variant>
          </PersonalizationContainer>
        );
      }
    `;
  
    const component = parseJsx(code);
    const builderJson = componentToBuilder()({ component });
    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis({
        format: 'legacy',
      })({
      component: backToMitosis,
    });
    expect(mitosis.trim()).toEqual(code.trim());
  });
  
  test('do not generate empty variant expression', () => {
    const builderJson = {
      "@type": "@builder.io/sdk:Element" as const,
      "@version": 2,
      "id": "builder-a12265b5892b4d6e8e37873369218409",
      "component": {
        "name": "PersonalizationContainer",
        "options": {
          "variants": []
        }
      }
    }
    const backToMitosis = builderContentToMitosisComponent({ data: { blocks: [builderJson] } });    
    const mitosis = componentToMitosis()({
      component: backToMitosis,
    });
    expect(mitosis).toMatchInlineSnapshot(`
      "import { PersonalizationContainer, Variant } from \\"@components\\";

      export default function MyComponent(props) {
        return (
          <PersonalizationContainer variants={}>
            <Variant default=\\"\\" />
          </PersonalizationContainer>
        );
      }
      "
    `);
  });
});
