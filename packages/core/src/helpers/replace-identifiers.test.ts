import { replaceIdentifiers } from './replace-identifiers';

type Spec = Parameters<typeof replaceIdentifiers>[0];

const TEST_SPECS: Spec[] = [
  {
    from: 'props',
    to: '$slots',
    code: 'props.slotName',
  },
];

describe('replaceIdentifiers', () => {
  TEST_SPECS.forEach((args, index) => {
    test(`Check #${index}`, () => {
      const output = replaceIdentifiers(args);
      expect(output).toMatchSnapshot();
    });
  });
});
