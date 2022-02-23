import { componentToSvelte } from '../generators/svelte';
import { parseJsx } from '../parsers/jsx';

const onUpdate = require('./data/blocks/onUpdate.raw');

describe('Svelte', () => {
  test('onUpdate', () => {
    const component = parseJsx(onUpdate);
    const output = componentToSvelte()({ component });
    expect(output).toMatchSnapshot();
  });
});
