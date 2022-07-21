import { renderImport } from './render-imports';

describe('renderImport', () => {
  test('Adds correct extension to component import', () => {
    const data = [
      {
        imports: { RenderBlocks: 'default' },
        path: '../render-blocks.lite',
      },
    ];
    const output = renderImport({
      theImport: data[0],
      target: 'vue',
      asyncComponentImports: false,
    });
    expect(output).toMatchSnapshot();
  });

  test('Adds correctly a side-effect import', () => {
    const data = [
      {
        imports: {},
        path: '../render-blocks.scss',
      },
    ];
    const output = renderImport({
      theImport: data[0],
      target: 'react',
      asyncComponentImports: false,
    });
    expect(output).toEqual("import '../render-blocks.scss';");
  });
});
