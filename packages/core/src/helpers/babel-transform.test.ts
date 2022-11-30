import { babelTransformCode, babelTransformExpression } from './babel-transform';

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
  `state.tortilla === 'Plain'`,
  `state.tortilla = event.target.value`,
];

describe('babelTransform', () => {
  SPECS.forEach((args, index) => {
    test(`Check #${index}`, () => {
      const output = babelTransformCode(args);
      expect(output).toMatchSnapshot();
    });
  });
});

describe('babelTransformExpression', () => {
  SPECS.forEach((args, index) => {
    test(`Check #${index}`, () => {
      const output = babelTransformExpression(args, {});
      expect(output).toMatchSnapshot();
    });
  });
});
