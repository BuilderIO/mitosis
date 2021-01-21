import { componentToBuilder } from '../generators/builder';
import { componentToJsxLite } from '../generators/jsx-lite';
import { builderContentToJsxLiteComponent } from '../parsers/builder';
import { parseJsx } from '../parsers/jsx';

const stamped = require('./data/blocks/stamped-io.raw');
const customCode = require('./data/blocks/custom-code.raw');
const embed = require('./data/blocks/embed.raw');

describe('Builder', () => {
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
});
