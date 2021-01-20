import { componentToBuilder } from '../generators/builder';
import { componentToJsxLite } from '../generators/jsx-lite';
import { builderContentToJsxLiteComponent } from '../parsers/builder';
import { parseJsx } from '../parsers/jsx';

const basic = require('./data/blocks/stamped-io.raw');

describe('Builder', () => {
  test('Stamped', () => {
    const json = parseJsx(basic);
    const builderJson = componentToBuilder(json);
    expect(builderJson).toMatchSnapshot();

    const backToJsxLite = builderContentToJsxLiteComponent(json);
    const jsxLite = componentToJsxLite(backToJsxLite);
    expect(jsxLite).toMatchSnapshot();
  });
});
