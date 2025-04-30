import { describe } from 'vitest';
import { componentToSwift } from '..';
import { runTestsForTarget } from './test-generator';

describe('swift', () => {
  const generator = componentToSwift;

  runTestsForTarget({
    options: {},
    target: 'swift',
    generator,
  });
});
