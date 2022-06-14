import { parseJsx } from '..';
import { componentToCustomElement } from '../generators/html';
import { getMultipleOnUpdateTests, getTestsForGenerator } from './shared';

const shadowDom = require('./data/blocks/shadow-dom.raw');

describe('webcomponent', () => {
  getTestsForGenerator(componentToCustomElement());
  getMultipleOnUpdateTests(componentToCustomElement());
  // These error
  // getFormBlockTests(componentToCustomElement());

  test('Shadow DOM', () => {
    const component = parseJsx(shadowDom);
    const html = componentToCustomElement()({ component });
    expect(html).toMatchSnapshot();
  });
});
