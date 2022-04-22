import { componentToSvelte } from '../generators/svelte';
import { parseJsx } from '../parsers/jsx';

const onUpdate = require('./data/blocks/onUpdate.raw');
const multipleOUpdate = require('./data/blocks/multiple-onUpdate.raw');
const selfReferencingComponent = require('./data/blocks/self-referencing-component.raw');
const selfReferencingComponentWithChildren = require('./data/blocks/self-referencing-component-with-children.raw');

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

  test('selfReferencingComponentWithChildren', () => {
    const component = parseJsx(selfReferencingComponentWithChildren);
    const output = componentToSvelte()({ component });
    expect(output).toMatchSnapshot();
  });
});
