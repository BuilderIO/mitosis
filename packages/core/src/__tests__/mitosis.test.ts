import { componentToMitosis } from '@/generators/mitosis';
import { runTestsForTarget } from './test-generator';

describe('Mitosis, format: legacy', () => {
  runTestsForTarget({
    options: { format: 'legacy' },
    target: 'mitosis',
    generator: componentToMitosis,
  });
});

describe('Mitosis, format: legacy (native loops and conditionals)', () => {
  runTestsForTarget({
    options: { format: 'legacy', nativeLoops: true, nativeConditionals: true },
    target: 'mitosis',
    generator: componentToMitosis,
  });
});

describe('Mitosis, format: react', () => {
  runTestsForTarget({
    options: {
      format: 'react',
    },
    target: 'mitosis',
    generator: componentToMitosis,
  });
});
