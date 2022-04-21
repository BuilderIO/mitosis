import { componentToSvelte } from '../generators/svelte';
import { parseJsx } from '../parsers/jsx';

const onUpdate = require('./data/blocks/onUpdate.raw');
const multipleOUpdate = require('./data/blocks/multiple-onUpdate.raw');
const selfReferencingComponent = require('./data/blocks/self-referencing-component.raw');

describe('Svelte', () => {
  test('onUpdate', () => {
    const component = parseJsx(onUpdate);
    const output = componentToSvelte()({ component });
    expect(output).toMatchSnapshot();
  });

  test('multipleOnUpdate', () => {
    const component = parseJsx(multipleOUpdate);
    const output = componentToSvelte()({ component });
    expect(output).toMatchSnapshot();
  });

  test('selfReferencingComponent', () => {
    const component = parseJsx(selfReferencingComponent);
    const output = componentToSvelte()({ component });
    expect(output).toMatchSnapshot();
  });
});
