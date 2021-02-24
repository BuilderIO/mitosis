import globby from 'globby';
import fs from 'fs-extra-promise';
import { componentToAngular } from '../../src/generators/angular';
import { componentToReact } from '../../src/generators/react';
import { componentToVue } from '../../src/generators/vue';
import { componentToHtml } from '../../src/generators/html';
import { componentToSvelte } from '../../src/generators/svelte';
import { componentToSolid } from '../../src/generators/solid';
import { parseJsx } from '../../src/parsers/jsx';

export const generateFiles = async () => {
  const files = await globby('integration/jsx-lite/**.lite.tsx');
  await Promise.all(
    files.map(async (file) => {
      const content = await fs.readFileAsync(file, 'utf8');
      const json = parseJsx(content);

      const filePath = file
        .replace('integration/jsx-lite/', '')
        .split('.')
        .shift();

      // Angular
      const angularCode = componentToAngular(json);
      await fs.outputFileAsync(
        `integration/frameworks/angular/src/app/${filePath}.ts`,
        angularCode,
      );

      // Next
      const reactCode = componentToReact(json, {
        stylesType: 'styled-jsx',
        stateType: 'useState',
      });
      await fs.outputFileAsync(
        `integration/frameworks/next-js/pages/${filePath}.jsx`,
        reactCode,
      );

      // Vue
      const vueCode = componentToVue(json);
      await fs.outputFileAsync(
        `integration/frameworks/nuxt/pages/${filePath}.vue`,
        vueCode,
      );

      // HTML
      const htmlCode = componentToHtml(json);
      await fs.outputFileAsync(
        `integration/frameworks/html/public/${filePath}.html`,
        htmlCode,
      );

      // Svelte
      const svelteCode = componentToSvelte(json);
      await fs.outputFileAsync(
        `integration/frameworks/sapper/src/routes/${filePath}.svelte`,
        svelteCode,
      );

      // Solid
      const solidCode = componentToSolid(json);
      await fs.outputFileAsync(
        `integration/frameworks/solid/examples/shared/src/components/${filePath}.js`,
        solidCode,
      );
    }),
  );
};

if (require.main === module) {
  generateFiles();
}
