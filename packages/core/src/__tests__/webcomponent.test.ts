import { componentToCustomElement } from '../generators/html';
import { parseJsx } from '../parsers/jsx';

const stamped = require('./data/blocks/stamped-io.raw');

describe('webcomponent', () => {
  test('Stamped', () => {
    const component = parseJsx(stamped);
    const html = componentToCustomElement()({ component });
    expect(html).toMatchSnapshot();
  });
});
