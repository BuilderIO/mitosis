import { MitosisConfig } from '@builder.io/mitosis';
import { fastClone } from '../helpers/fast-clone';
import {
  getMitosisComponentJSONs,
  getOptions,
  getTargetContexts,
  buildAndOutputNonComponentFiles,
  buildAndOutputComponentFiles,
} from './build';

export async function dev({ config, paths }: { config: MitosisConfig; paths: string[] }) {
  const options = getOptions(config);

  // get all mitosis component JSONs
  const mitosisComponents = await getMitosisComponentJSONs(options, paths);

  const targetContexts = getTargetContexts(options);

  await Promise.all(
    targetContexts.map(async (targetContext) => {
      // clone mitosis JSONs for each target, so we can modify them in each generator without affecting future runs.
      // each generator also clones the JSON before manipulating it, but this is an extra safety measure.
      const files = fastClone(mitosisComponents);

      const x = await Promise.all([
        buildAndOutputNonComponentFiles({ ...targetContext, options }),
        buildAndOutputComponentFiles({ ...targetContext, options, files }),
      ]);

      console.info(
        `Mitosis: ${targetContext.target}: generated ${x[1].length} components, ${x[0].length} regular files.`,
      );
    }),
  );

  console.info('Mitosis: generation completed.');
}
