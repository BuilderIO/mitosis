import globby from 'globby';
import fs from 'fs-extra-promise';
import { componentToAngular } from '../../src/generators/angular';
import { componentToReact } from '../../src/generators/react';
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
      const reactCode = componentToReact(json);
      await fs.outputFileAsync(
        `integration/frameworks/next-js/pages/${filePath}.ts`,
        reactCode,
      );
    }),
  );
};

if (require.main === module) {
  generateFiles();
}
