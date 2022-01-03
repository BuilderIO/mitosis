import { componentToHtml } from '../generators/html';
import { parseJsx } from '../parsers/jsx';

const stamped = require('./data/blocks/stamped-io.raw');

describe('Html', () => {
  test('Stamped', () => {
    const component = parseJsx(stamped);
    const html = componentToHtml()({ component });
    expect(html).toMatchSnapshot();
  });
});
