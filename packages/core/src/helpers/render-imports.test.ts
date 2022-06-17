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
    expect(output).toBe(
      "import  RenderBlocks,  {  }  from '../render-blocks.vue';",
    );
  });
});
