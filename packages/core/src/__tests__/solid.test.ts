import { componentToSolid } from '../generators/solid';
import { runTestsForTarget } from './shared';

describe('Solid', () => {
  runTestsForTarget('solid', componentToSolid());
  runTestsForTarget(
    'solid',
    componentToSolid({
      stylesType: 'style-tag',
    }),
  );
});
