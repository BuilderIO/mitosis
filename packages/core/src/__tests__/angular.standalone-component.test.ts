import { parseJsx } from '..';
import { componentToAngular } from '../generators/angular';
import { tryPrettierFormat } from 'src/helpers/try-prettier-format';
import basicExample from './data/basic.raw.tsx?raw';
import renderBlockExample from './data/blocks/render-block.raw.tsx?raw';
import subComponentExample from './data/sub-component.raw.tsx?raw';

const mockNgModule = (name: string, componentsUsed: string[]) =>
  tryPrettierFormat(
    `@NgModule({
  declarations: [${name}],
  imports: [CommonModule${
    componentsUsed.length ? ', ' + componentsUsed.map((comp) => `${comp}Module`).join(', ') : ''
  }],
  exports: [${name}],
})
export class ${name}Module {}`,
    'typescript',
  ).trim();

const mockStandaloneComponentMetadata = (name: string, componentsUsed: string[]) =>
  tryPrettierFormat(
    `
  standalone: true,
  imports: [CommonModule${
    componentsUsed.length ? ', ' + componentsUsed.map((comp) => `${comp}`).join(', ') : ''
  }],
})
export class ${name} {`,
    'typescript',
  ).trim();

describe('Angular standalone component', () => {
  test('Standalone option should prevent NgModule generation in basic components', () => {
    const basicNgModule = mockNgModule('MyBasicComponent', []);
    const standaloneComponentMetadata = mockStandaloneComponentMetadata('MyBasicComponent', []);
    const component = parseJsx(basicExample);

    const nonStandaloneComponent = componentToAngular({ standalone: false })({ component });
    expect(nonStandaloneComponent).toMatchSnapshot();
    expect(nonStandaloneComponent).toContain(basicNgModule);

    const standaloneComponent = componentToAngular({ standalone: true })({ component });
    expect(standaloneComponent).toMatchSnapshot();
    expect(standaloneComponent).not.toContain(basicNgModule);
    expect(standaloneComponent).toContain(standaloneComponentMetadata);
  });

  test('Standalone option should prevent NgModule generation when used whith sub-components', () => {
    const subComponentNgModule = mockNgModule('SubComponent', ['Foo']);
    const standaloneComponentMetadata = mockStandaloneComponentMetadata('SubComponent', ['Foo']);
    const component = parseJsx(subComponentExample);

    const nonStandaloneComponent = componentToAngular({ standalone: false })({ component });
    expect(nonStandaloneComponent).toMatchSnapshot();
    expect(nonStandaloneComponent).toContain(subComponentNgModule);

    const standaloneComponent = componentToAngular({ standalone: true })({ component });
    expect(standaloneComponent).toMatchSnapshot();
    expect(standaloneComponent).not.toContain(subComponentNgModule);
    expect(standaloneComponent).toContain(standaloneComponentMetadata);
  });

  test('Standalone option should prevent NgModule generation in complex components', () => {
    const renderBlockNgModule = mockNgModule('RenderBlock', [
      'RenderRepeatedBlock',
      'RenderBlock',
      'BlockStyles',
    ]);
    const standaloneComponentMetadata = mockStandaloneComponentMetadata('RenderBlock', [
      'RenderRepeatedBlock',
      'RenderBlock',
      'BlockStyles',
    ]);
    const component = parseJsx(renderBlockExample);

    const nonStandaloneComponent = componentToAngular({ standalone: false })({ component });
    expect(nonStandaloneComponent).toMatchSnapshot();
    expect(nonStandaloneComponent).toContain(renderBlockNgModule);

    const standaloneComponent = componentToAngular({ standalone: true })({ component });
    expect(standaloneComponent).toMatchSnapshot();
    expect(standaloneComponent).not.toContain(renderBlockNgModule);
    expect(standaloneComponent).toContain(standaloneComponentMetadata);
  });
});
