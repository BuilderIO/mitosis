import { parseJsx } from '..';
import { componentToCustomElement } from '../generators/html';
import { runTestsForTarget } from './test-generator';

import shadowDom from './data/blocks/shadow-dom.raw.tsx?raw';

describe('webcomponent', () => {
  const generator = componentToCustomElement;

  runTestsForTarget({ options: {}, target: 'webcomponent', generator });

  test('Shadow DOM', () => {
    const component = parseJsx(shadowDom);
    const html = generator()({ component });
    expect(html).toMatchSnapshot();
  });
});
