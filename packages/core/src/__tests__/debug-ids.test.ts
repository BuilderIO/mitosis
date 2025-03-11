import { componentToMitosis } from '@/generators/mitosis';
import { runTestsForTarget } from './test-generator';

describe('Mitosis debug IDs', () => {
  runTestsForTarget({
    options: {
      format: 'legacy',
      debugIds: true,
    },
    target: 'mitosis',
    generator: componentToMitosis,
    only: ['debug-ids'],
  });
});
