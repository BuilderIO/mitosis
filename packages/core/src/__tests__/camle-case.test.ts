import MyComponent from './data/map-camle-cased-attributes.raw?raw'
import { parseJsx } from '../parsers/jsx';
import { componentToSvelte } from '../generators/svelte';

describe('map camle cased', () => {
    test('map camle cased', () => {
        const component = parseJsx(MyComponent);
        const svelteComponent = componentToSvelte()({component})
        expect(svelteComponent).toMatchSnapshot();
    })
})