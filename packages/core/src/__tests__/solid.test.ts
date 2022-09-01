import { componentToSolid } from '../generators/solid';
import { runTestsForTarget } from './shared';

describe('Solid', () => {
  runTestsForTarget({ options: {}, target: 'solid', generator: componentToSolid });
  runTestsForTarget({
    options: { stylesType: 'style-tag' },
    target: 'solid',
    generator: componentToSolid,
  });
});
