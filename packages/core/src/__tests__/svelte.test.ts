import { contextToSvelte } from '../generators/context/svelte';
import { parseContext } from '../parsers/context';
import { componentToSvelte } from '../generators/svelte';
import { parseJsx } from '../parsers/jsx';

const onUpdate = require('./data/blocks/onUpdate.raw');
const multipleOUpdate = require('./data/blocks/multiple-onUpdate.raw');
const selfReferencingComponent = require('./data/blocks/self-referencing-component.raw');
const selfReferencingComponentWithChildren = require('./data/blocks/self-referencing-component-with-children.raw');
const builderRenderBlock = require('./data/blocks/builder-render-block.raw');
const rootShow = require('./data/blocks/rootShow.raw');
const simpleExample = require('./data/context/simple.context.lite');
const componentWithContext = require('./data/context/component-with-context.lite');
const renderBlock = require('./data/blocks/builder-render-block.raw');

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
  test('BuilderRenderBlock', () => {
    const component = parseJsx(builderRenderBlock);
    const output = componentToSvelte()({ component });
    expect(output).toMatchSnapshot();
  });
  test('rootShow', () => {
    const component = parseJsx(rootShow);
    const output = componentToSvelte()({ component });
    expect(output).toMatchSnapshot();
  });

  describe('Context', () => {
    test('Parse context', () => {
      const component = parseContext(simpleExample, { name: 'SimpleExample' });
      if (!component) {
        throw new Error(
          'No parseable context found for simple.context.lite.ts',
        );
      }
      expect(component).toMatchSnapshot();
      const context = contextToSvelte()({ context: component });
      expect(context).toMatchSnapshot();
    });

    test('Use and set context in components', () => {
      const component = parseJsx(componentWithContext);
      expect(component).toMatchSnapshot();
      const output = componentToSvelte()({ component });
      expect(output).toMatchSnapshot();
    });

    test('Use and set context in complex components', () => {
      const component = parseJsx(renderBlock);
      expect(component).toMatchSnapshot();
      const output = componentToSvelte()({ component });
      expect(output).toMatchSnapshot();
    });
  });
});
