import * as fs from 'fs';
import { componentToBuilder } from '../generators/builder';
import { componentToMitosis } from '../generators/mitosis';
import { componentToHtml } from '../generators/html';
import {
  builderContentToMitosisComponent,
  extractStateHook,
} from '../parsers/builder';
import { parseJsx } from '../parsers/jsx';
import { compileAwayBuilderComponents } from '../plugins/compile-away-builder-components';
import { componentToReact, ToMitosisOptions } from '..';

/**
 * Load a file using nodejs resolution as a string.
 */
function fixture(path: string): string {
  const localpath = require.resolve(path);
  return fs.readFileSync(localpath, { encoding: 'utf-8' });
}

const stamped = fixture('./data/blocks/stamped-io.raw');
const customCode = fixture('./data/blocks/custom-code.raw');
const embed = fixture('./data/blocks/embed.raw');
const image = fixture('./data/blocks/image.raw');
const columns = fixture('./data/blocks/columns.raw');
const lazyLoadSection = JSON.parse(
  fixture('./data/builder/lazy-load-section.json'),
);

const regenImage = fixture('./data/builder/regen-image.tsx');
const regenText = fixture('./data/builder/regen-text.tsx');
const regenLoop = fixture('./data/builder/regen-loop.tsx');
const regenHero = fixture('./data/builder/regen-hero.tsx');
const regenFragment = fixture('./data/builder/regen-fragment.tsx');
const regenSpanText = fixture('./data/builder/regen-span-text.tsx');

const mitosisOptions: ToMitosisOptions = {
  format: 'legacy',
};

describe('Builder', () => {
  test('extractStateHook', () => {
    const code = `useState({ foo: 'bar' }); alert('hi');`;
    expect(extractStateHook(code)).toEqual({
      code: `alert('hi');`,
      state: { foo: 'bar' },
    });

    expect(extractStateHook(code)).toEqual({
      code: `alert('hi');`,
      state: { foo: 'bar' },
    });
  });

  test('Stamped', () => {
    const component = parseJsx(stamped);
    const builderJson = componentToBuilder()({ component });
    expect(builderJson).toMatchSnapshot();

    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis()({ component: backToMitosis });
    expect(mitosis).toMatchSnapshot();
  });

  test('CustomCode', () => {
    const component = parseJsx(customCode);
    const builderJson = componentToBuilder()({ component });
    expect(builderJson).toMatchSnapshot();

    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis()({ component: backToMitosis });
    expect(mitosis).toMatchSnapshot();
  });

  test('Embed', () => {
    const component = parseJsx(embed);
    const builderJson = componentToBuilder()({ component });
    expect(builderJson).toMatchSnapshot();

    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis()({ component: backToMitosis });
    expect(mitosis).toMatchSnapshot();
  });

  test('Image', () => {
    const component = parseJsx(image);
    const builderJson = componentToBuilder()({ component });
    expect(builderJson).toMatchSnapshot();

    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis()({ component: backToMitosis });
    expect(mitosis).toMatchSnapshot();
  });

  test('Columns', () => {
    const component = parseJsx(columns);
    const builderJson = componentToBuilder()({ component });
    expect(builderJson).toMatchSnapshot();

    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis()({ component: backToMitosis });
    expect(mitosis).toMatchSnapshot();
  });

  test('Section', async () => {
    const component = builderContentToMitosisComponent(lazyLoadSection);

    const html = await componentToHtml({
      plugins: [compileAwayBuilderComponents()],
    })({ component });

    expect(html).toMatchSnapshot();
  });

  test('Regenerate Image', () => {
    const component = parseJsx(regenImage);
    const builderJson = componentToBuilder()({ component });
    expect(builderJson).toMatchSnapshot();

    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis(mitosisOptions)({
      component: backToMitosis,
    });
    expect(mitosis.trim()).toMatchSnapshot();
    const react = componentToReact({
      plugins: [compileAwayBuilderComponents()],
    })({ component });
    expect(react).toMatchSnapshot();
  });

  test('Regenerate Text', () => {
    const component = parseJsx(regenText);
    const builderJson = componentToBuilder()({ component });
    expect(builderJson).toMatchSnapshot();

    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis(mitosisOptions)({
      component: backToMitosis,
    });
    expect(mitosis.trim()).toMatchSnapshot();
  });

  test('Regenerate loop', () => {
    const component = parseJsx(regenLoop);
    const builderJson = componentToBuilder()({ component });
    expect(builderJson).toMatchSnapshot();

    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis(mitosisOptions)({
      component: backToMitosis,
    });
    expect(mitosis.trim()).toMatchSnapshot();
  });

  test('Regenerate custom Hero', () => {
    const component = parseJsx(regenHero);
    expect(component).toMatchSnapshot();

    const builderJson = componentToBuilder()({ component });
    expect(builderJson).toMatchSnapshot();
    const backToMitosis = builderContentToMitosisComponent(builderJson);
    expect(backToMitosis).toMatchSnapshot();
    const mitosis = componentToMitosis(mitosisOptions)({
      component: backToMitosis,
    });
    expect(mitosis.trim()).toMatchSnapshot();
  });

  // TODO: fix divs and CoreFragment - need to find way to reproduce
  test.skip('Regenerate fragments', () => {
    const component = parseJsx(regenFragment);
    expect(component).toMatchSnapshot();

    const builderJson = componentToBuilder()({ component });
    expect(builderJson).toMatchSnapshot();
    const backToMitosis = builderContentToMitosisComponent(builderJson);
    expect(backToMitosis).toMatchSnapshot();
    const mitosis = componentToMitosis(mitosisOptions)({
      component: backToMitosis,
    });
    expect(mitosis.trim()).toMatchSnapshot();
  });

  // TODO: get passing, don't add extra divs. or at least use spans instead so don't break layout
  test.skip('Regenerate span text', () => {
    const component = parseJsx(regenSpanText);
    const builderJson = componentToBuilder()({ component });
    expect(builderJson).toMatchSnapshot();

    const backToMitosis = builderContentToMitosisComponent(builderJson);
    const mitosis = componentToMitosis(mitosisOptions)({
      component: backToMitosis,
    });
    expect(mitosis.trim()).toMatchSnapshot();
  });
});
