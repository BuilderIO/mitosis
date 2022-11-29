import { componentToAngular } from '../generators/angular';
import { runTestsForTarget } from './shared';
import { parseJsx } from "@builder.io/mitosis";

import outputEventBindingExample from './data/output-event-bindings.raw.tsx?raw';

describe('Angular', () => {
  runTestsForTarget({ options: {}, target: 'angular', generator: componentToAngular });
  runTestsForTarget({
    options: {
      standalone: true,
    },
    target: 'angular',
    generator: componentToAngular,
  });

  test('Output event bindings properly formatted', () => {
    const component = parseJsx(outputEventBindingExample);
    expect(component).toMatchSnapshot();
    const angularComponent = componentToAngular()({ component });
    expect(angularComponent).toMatchSnapshot();
  });
});
