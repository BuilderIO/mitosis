import { MitosisConfig, Target } from '@builder.io/mitosis';
import { fastClone } from '../helpers/fast-clone';
import {
  getMitosisComponentJSONs,
  getOptions,
  getTargetContexts,
  buildAndOutputNonComponentFiles,
  buildAndOutputComponentFiles,
} from './build';
import { checkIsMitosisComponentFilePath } from './helpers/inputs-extensions';

export async function dev({ config, path }: { config: MitosisConfig; path: string }) {
  const options = getOptions(config);
  // if it's a component
  if (checkIsMitosisComponentFilePath(path)) {
    // get all mitosis component JSONs
    const mitosisComponents = await getMitosisComponentJSONs(options, [path]);

    const targetContexts = getTargetContexts(options);

    const generated: { target: Target; components: number; files: number }[] = [];

    await Promise.all(
      targetContexts.map(async (targetContext) => {
        // clone mitosis JSONs for each target, so we can modify them in each generator without affecting future runs.
        // each generator also clones the JSON before manipulating it, but this is an extra safety measure.
        const files = fastClone(mitosisComponents);

        const x = await buildAndOutputComponentFiles({ ...targetContext, options, files });

        generated.push({
          target: targetContext.target,
          components: x.length,
          files: 0,
        });
      }),
    );

    return generated;
  }
  // it's a non component file
  else {
    const targetContexts = getTargetContexts(options);

    const generated: { target: Target; components: number; files: number }[] = await Promise.all(
      targetContexts.map(async (targetContext) => {
        return {
          files: (await buildAndOutputNonComponentFiles({ ...targetContext, options })).length,
          components: 0,
          target: targetContext.target,
        };
      }),
    );
    return generated;
  }
}
