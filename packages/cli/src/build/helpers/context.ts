import {
  contextToReact,
  contextToSolid,
  contextToSvelte,
  contextToVue,
  MitosisConfig,
  parseContext,
  Target,
} from '@builder.io/mitosis';
import { readFile } from 'fs-extra';
import { upperFirst, camelCase, last } from 'lodash';

export const buildContextFile = async ({
  path,
  options,
  target,
}: {
  path: string;
  options: MitosisConfig;
  target: Target;
}) => {
  // 'foo/bar/my-thing.context.ts' -> 'MyThing'
  const name = upperFirst(camelCase(last(path.split('/')).split('.')[0]));
  const context = parseContext(await readFile(path, 'utf8'), { name });
  if (!context) {
    console.warn('Could not parse context from file', path);
  } else {
    switch (target) {
      case 'svelte':
        return contextToSvelte(options.options.svelte)({ context });
      case 'vue':
        return contextToVue(context);
      case 'solid':
        return contextToSolid()({ context });
      case 'react':
      case 'reactNative':
        return contextToReact()({ context });
      default:
        console.warn('Context files are not supported for this target. Outputting no-op');
        return contextToVue(context);
    }
  }
};
