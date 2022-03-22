import { componentToHtml } from '../generators/html';
import { parseJsx } from '../parsers/jsx';

const stamped = require('./data/blocks/stamped-io.raw');
const shadowDom = require('./data/blocks/shadow-dom.raw');

describe('Html', () => {
  test('Stamped', () => {
    const component = parseJsx(stamped);
    const html = componentToHtml()({ component });
    expect(html).toMatchSnapshot();
  });
  test('Shadow DOM', () => {
    const component = parseJsx(shadowDom);
    const html = componentToHtml()({ component });
    expect(html).toMatchSnapshot();
  });
});
