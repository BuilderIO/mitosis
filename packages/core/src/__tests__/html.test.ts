import { componentToHtml } from '../generators/html';
import { parseJsx } from '../parsers/jsx';

const stamped = require('./data/blocks/stamped-io.raw');

describe('Html', () => {
  test('Stamped', () => {
    const json = parseJsx(stamped);
    const html = componentToHtml(json);
    expect(html).toMatchSnapshot();
  });
});
