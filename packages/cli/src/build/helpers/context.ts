import {
  contextToReact,
  contextToRsc,
  contextToSolid,
  contextToSvelte,
  contextToVue,
  contextToQwik,
  MitosisConfig,
  parseContext,
  Target,
} from '@builder.io/mitosis';
import { readFile } from 'fs-extra';
import { upperFirst, camelCase, last } from 'lodash';

export const generateContextFile = async ({
  path,
  options,
  target,
}: {
  path: string;
  options: MitosisConfig;
  target: Target;
}) => {
  // 'foo/bar/my-thing.context.ts' -> 'MyThing'
  const name = upperFirst(camelCase(last(path.split('/'))?.split('.')[0]));
  const context = parseContext(await readFile(path, 'utf8'), { name });
  if (!context) {
    console.warn('Could not parse context from file', path);
  } else {
    switch (target) {
      case 'svelte':
        return contextToSvelte(options.options.svelte)({ context });
      case 'vue':
      case 'vue2':
      case 'vue3':
        return contextToVue(options.options[target])({ context });
      case 'solid':
        return contextToSolid()({ context });
      case 'react':
      case 'preact':
      case 'reactNative':
        return contextToReact()({ context });
      case 'rsc':
        return contextToRsc()({ context });
      case 'qwik':
        return contextToQwik()({ context });
      default:
        console.warn('Context files are not supported for this target. Outputting no-op');
        return `
        // Noop file
        export default {};
      `;
    }
  }
};
