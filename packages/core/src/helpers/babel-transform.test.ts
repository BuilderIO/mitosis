import { babelTransformCode } from './babel-transform';

test('babelTransform', () => {
  const code = `
const symbol = symbol;

if (symbol) {
  getContent({
    apiKey: builderContext.apiKey!,
  }).then(response => {
    content = response;
  });
}
`;

  expect(babelTransformCode(code)).toMatchSnapshot();
});
