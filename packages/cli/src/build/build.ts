import {
  componentToReact,
  componentToReactNative,
  componentToSolid,
  componentToSwift,
  componentToVue,
  componentToHtml,
  componentToCustomElement,
  MitosisComponent,
  parseJsx,
  MitosisConfig,
  Target,
  Transpiler,
  componentToSvelte,
  componentToAngular,
  VueVersion,
} from '@builder.io/mitosis';
import debug from 'debug';
import glob from 'fast-glob';
import { outputFile, pathExists, readFile, remove } from 'fs-extra';
import { kebabCase } from 'lodash';
import micromatch from 'micromatch';
import { getFileExtensionForTarget } from './helpers/extensions';
import { getSimpleId } from './helpers/get-simple-id';
import { transpile } from './helpers/transpile';
import { transpileOptionalChaining } from './helpers/transpile-optional-chaining';
import { transpileSolidFile } from './helpers/transpile-solid-file';
import { buildContextFile } from './helpers/context';

const cwd = process.cwd();

const DEFAULT_CONFIG: MitosisConfig = {
  targets: [],
  dest: 'output',
  files: 'src/*',
  overridesDir: 'overrides',
  options: {
    vue: {
      cssNamespace: () => getSimpleId(),
      namePrefix: (path) => (path.includes('/blocks/') ? 'builder' : undefined),
      vueVersion: { 2: true, 3: true },
    },
  },
};

const getOptions = (config?: MitosisConfig): MitosisConfig => ({
  ...DEFAULT_CONFIG,
  ...config,
  options: {
    ...DEFAULT_CONFIG.options,
    ...config?.options,
    vue: {
      ...DEFAULT_CONFIG.options?.vue,
      ...config?.options?.vue,
    },
  },
});

async function clean(options: MitosisConfig) {
  const files = await glob(`${options.dest}/**/*/${options.files}`);
  await Promise.all(
    files.map(async (file) => {
      await remove(file);
    }),
  );
}

const getMitosisComponentJSONs = async (options: MitosisConfig) => {
  return Promise.all(
    micromatch(await glob(options.files, { cwd }), `**/*.lite.tsx`).map(async (path) => {
      try {
        const parsed = parseJsx(await readFile(path, 'utf8'));
        return {
          path,
          mitosisJson: parsed,
        };
      } catch (err) {
        console.error('Could not parse file:', path);
        throw err;
      }
    }),
  );
};

/**
 * I need to iterate over the Mitosis Config and come out with a list of:
 *  - Target
 *  - Generator
 *  - targetPath
 *
 * Then, This information can be provided to a function that will build and output the files for each combo.
 */
interface TargetContext {
  target: Target;
  generator: Transpiler;
  outputPath: string;
}

interface TargetContextWithConfig extends TargetContext {
  options: MitosisConfig;
}

const getTargetContexts = (options: MitosisConfig) =>
  options.targets.reduce<TargetContext[]>(
    (acc, target) => [...acc, ...getContextsForTarget({ target, options })],
    [],
  );

const buildAndOutputNonComponentFiles = async (targetContext: TargetContextWithConfig) => {
  const jsFiles = await buildNonComponentFiles(targetContext);
  await outputNonComponentFiles({ ...targetContext, files: jsFiles });
};

export async function build(config?: MitosisConfig) {
  // merge default options
  const options = getOptions(config);

  // clean output directory
  await clean(options);

  // get all mitosis component JSONs
  const mitosisComponents = await getMitosisComponentJSONs(options);

  const targetContexts = getTargetContexts(options);

  await Promise.all(
    targetContexts.map(async (targetContext) => {
      const targetContextWithConfig: TargetContextWithConfig = { ...targetContext, options };
      await Promise.all([
        buildAndOutputNonComponentFiles(targetContextWithConfig),
        buildAndOutputComponentFiles({ ...targetContextWithConfig, files: mitosisComponents }),
      ]);
      await outputOverrides(targetContextWithConfig);
    }),
  );

  console.info('Done!');
}

/**
 * TO-DO: can this be removed?
 */
async function outputOverrides({ target, options, outputPath }: TargetContextWithConfig) {
  const kebabTarget = kebabCase(target);
  const targetOverrides = `${options.overridesDir}/${kebabTarget}`;

  // get all outputted files
  const overrideFileNames = await glob([
    `${targetOverrides}/**/*`,
    `!${targetOverrides}/node_modules/**/*`,
  ]);
  await Promise.all(
    overrideFileNames.map(async (overrideFileName) => {
      let contents = await readFile(overrideFileName, 'utf8');

      // transpile `.tsx` files to `.js`
      const esbuildTranspile = overrideFileName.match(/\.tsx?$/);
      if (esbuildTranspile) {
        contents = await transpile({ path: overrideFileName, target, options });
      }

      const newFile = overrideFileName
        // replace any reference to the overrides directory with the target directory
        // e.g. `overrides/react/components/Button.tsx` -> `output/react/components/Button.tsx`
        .replace(`${targetOverrides}`, `${options.dest}/${outputPath}`)
        // replace `.tsx` references with `.js`
        .replace(/\.tsx?$/, '.js');

      await outputFile(newFile, contents);
    }),
  );
}

const getContextsForTarget = ({
  target,
  options,
}: {
  target: Target;
  options: MitosisConfig;
}): TargetContext[] => {
  switch (target) {
    case 'customElement':
      return [
        {
          generator: componentToCustomElement(options.options.customElement),
          outputPath: getTargetPath({ target }),
          target,
        },
      ];
    case 'html':
      return [
        {
          generator: componentToHtml(options.options.html),
          outputPath: getTargetPath({ target }),
          target,
        },
      ];
    case 'reactNative':
      return [
        {
          generator: componentToReactNative({ stateType: 'useState' }),
          outputPath: getTargetPath({ target }),
          target,
        },
      ];
    case 'vue':
      const { vueVersion, ...vueOptions } = options.options.vue;
      return [
        ...(vueVersion['2']
          ? [
              {
                target,
                outputPath: getTargetPath({ target, vueVersion: '2' }),
                generator: componentToVue({ ...vueOptions, vueVersion: '2' }),
              },
            ]
          : []),
        ...(vueVersion['3']
          ? [
              {
                target,
                outputPath: getTargetPath({ target, vueVersion: '3' }),
                generator: componentToVue({ ...vueOptions, vueVersion: '3' }),
              },
            ]
          : []),
      ];
    case 'angular':
      return [
        {
          generator: componentToAngular(options.options.angular),
          outputPath: getTargetPath({ target }),
          target,
        },
      ];
    case 'react':
      return [
        {
          generator: componentToReact(options.options.react),
          outputPath: getTargetPath({ target }),
          target,
        },
      ];
    case 'swift':
      return [
        {
          generator: componentToSwift(options.options.swift),
          outputPath: getTargetPath({ target }),
          target,
        },
      ];
    case 'solid':
      return [
        {
          generator: componentToSolid(options.options.solid),
          outputPath: getTargetPath({ target }),
          target,
        },
      ];
    case 'webcomponent':
      return [
        {
          generator: componentToCustomElement(options.options.webcomponent),
          outputPath: getTargetPath({ target }),
          target,
        },
      ];
    case 'svelte':
      return [
        {
          generator: componentToSvelte(options.options.svelte),
          outputPath: getTargetPath({ target }),
          target,
        },
      ];
    default:
      throw new Error('CLI does not yet support target: ' + target);
  }
};

const replaceFileExtensionForTarget = ({ target, path }: { target: Target; path: string }) =>
  path.replace(/\.lite\.tsx$/, getFileExtensionForTarget(target));

/**
 * Transpiles and outputs Mitosis component files.
 */
async function buildAndOutputComponentFiles({
  target,
  files,
  options,
  generator,
  outputPath,
}: TargetContextWithConfig & {
  files: { path: string; mitosisJson: MitosisComponent }[];
}) {
  const debugTarget = debug(`mitosis:${target}`);
  const output = files.map(async ({ path, mitosisJson }) => {
    const outputFilePath = replaceFileExtensionForTarget({ target, path });

    // try to find override file
    const kebabTarget = kebabCase(target);
    const overrideFilePath = `${options.overridesDir}/${kebabTarget}/${outputFilePath}`;
    const overrideFile = (await pathExists(overrideFilePath))
      ? await readFile(overrideFilePath, 'utf8')
      : null;

    debugTarget(`transpiling ${path}...`);
    let transpiled = '';

    if (overrideFile) {
      debugTarget(`override exists for ${path}: ${!!overrideFile}`);
    }
    try {
      transpiled = overrideFile ?? generator({ path, component: mitosisJson });
      debugTarget(`Success: transpiled ${path}. Output length: ${transpiled.length}`);
    } catch (error) {
      debugTarget(`Failure: transpiled ${path}.`);
      debugTarget(error);
      throw error;
    }

    const original = transpiled;

    // perform additional transpilation steps per-target
    // TO-DO: it makes no sense for there to be this kind of logic here. Move it to the transpiler.
    switch (target) {
      case 'solid':
        transpiled = await transpileSolidFile({
          contents: transpiled,
          path,
          mitosisComponent: mitosisJson,
        });
        break;
      case 'reactNative':
      case 'react':
        transpiled = await transpile({
          path,
          content: transpiled,
          target,
          options,
        });
        break;
      case 'vue':
        // TODO: transform to CJS (?)
        transpiled = transpileOptionalChaining(transpiled).replace(/\.lite(['"];)/g, '$1');
    }

    const outputDir = `${options.dest}/${outputPath}`;

    await Promise.all([
      // this is the default output
      outputFile(`${outputDir}/${outputFilePath}`, transpiled),
      // output generated component file, before it is minified and transpiled into JS.
      // we skip these targets because the files would be invalid.
      ...(target === 'swift' || target === 'svelte'
        ? []
        : [outputFile(`${outputDir}/${path}`, original)]),
    ]);
  });
  await Promise.all(output);
}

const getTargetPath = ({
  target,
  vueVersion,
}: {
  target: Target;
  vueVersion?: VueVersion;
}): string => {
  switch (target) {
    case 'vue':
      if (vueVersion === '3') {
        return 'vue/vue3';
      } else {
        return 'vue/vue2';
      }
    default:
      return kebabCase(target);
  }
};

/**
 * Outputs non-component files to the destination directory, without modifying them.
 */
async function outputNonComponentFiles({
  files,
  options,
  outputPath,
}: TargetContext & {
  files: { path: string; output: string }[];
  options: MitosisConfig;
}) {
  await Promise.all(
    files.map(({ path, output }) =>
      outputFile(`${options.dest}/${outputPath}/${path.replace(/\.tsx?$/, '.js')}`, output),
    ),
  );
}

/**
 * Transpiles all non-component files, including Context files.
 */
async function buildNonComponentFiles({ target, options }: TargetContextWithConfig) {
  const tsFiles = await glob(`src/**/*.ts`, { cwd });

  return await Promise.all(
    tsFiles.map(async (path) => {
      let output: string;
      if (path.endsWith('.context.lite.ts')) {
        output = await buildContextFile({ path, options, target });
        // we remove the `.lite` extension from the path for Context files.
        path = path.replace('.lite.ts', '.ts');
      }
      output = await transpile({
        path,
        target,
        content: output,
        options,
      });

      return {
        path,
        output,
      };
    }),
  );
}

if (require.main === module) {
  build().catch(console.error);
}
