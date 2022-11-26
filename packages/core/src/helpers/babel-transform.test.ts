import { babelTransformCode } from './babel-transform';

const SPECS = [
  `
const symbol = symbol;

if (symbol) {
  getContent({
    apiKey: builderContext.apiKey!,
  }).then(response => {
    content = response;
  });
}
`,
];

describe('babelTransform', () => {
  SPECS.forEach((args, index) => {
    test(`Check #${index}`, () => {
      const output = babelTransformCode(args);
      expect(output).toMatchSnapshot();
    });
  });
});
