import { parseJsx } from '..';
import { componentToCustomElement } from '../generators/html';
import { runTestsForTarget } from './shared';

const shadowDom = require('./data/blocks/shadow-dom.raw');

describe('webcomponent', () => {
  const generator = componentToCustomElement();

  runTestsForTarget('webcomponent', generator);

  test('Shadow DOM', () => {
    const component = parseJsx(shadowDom);
    const html = generator({ component });
    expect(html).toMatchSnapshot();
  });
});
