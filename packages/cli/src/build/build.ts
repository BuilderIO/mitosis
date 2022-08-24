import {
  componentToAngular,
  componentToCustomElement,
  componentToHtml,
  componentToMarko,
  componentToPreact,
  componentToLit,
  componentToQwik,
  componentToReact,
  componentToMbox,
  componentToMboxModel,
  componentToReactNative,
  componentToSolid,
  componentToSvelte,
  componentToSwift,
  componentToVue2,
  componentToVue3,
  MitosisComponent,
  MitosisConfig,
  parseJsx,
  Target,
  Transpiler,
} from '@builder.io/mitosis';
import debug from 'debug';
import glob from 'fast-glob';
import { outputFile, pathExists, readFile, remove } from 'fs-extra';
import { kebabCase } from 'lodash';
import micromatch from 'micromatch';
import { fastClone } from '../helpers/fast-clone';
import { buildContextFile } from './helpers/context';
import { getFileExtensionForTarget } from './helpers/extensions';
import { transpile } from './helpers/transpile';
import { transpileSolidFile } from './helpers/transpile-solid-file';

const cwd = process.cwd();

const DEFAULT_CONFIG: Partial<MitosisConfig> = {
  targets: [],
  dest: 'output',
  files: 'src/*',
  overridesDir: 'overrides',
};

const getOptions = (config?: MitosisConfig): MitosisConfig => ({
  ...DEFAULT_CONFIG,
  ...config,
  options: {
    ...DEFAULT_CONFIG.options,
    ...config?.options,
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

interface TargetContext {
  target: Target;
  generator: Transpiler;
  outputPath: string;
}

interface TargetContextWithConfig extends TargetContext {
  options: MitosisConfig;
}

const getTargetContexts = (options: MitosisConfig) =>
  options.targets.map(
    (target): TargetContext => ({
      target,
      generator: getGeneratorForTarget({ target, options }),
      outputPath: getTargetPath({ target }),
    }),
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
      // clone mitosis JSONs for each target, so we can modify them in each generator without affecting future runs.
      // each generator also clones the JSON before manipulating it, but this is an extra safety measure.
      const files = fastClone(mitosisComponents);

      const targetContextWithConfig: TargetContextWithConfig = { ...targetContext, options };

      await Promise.all([
        buildAndOutputNonComponentFiles(targetContextWithConfig),
        buildAndOutputComponentFiles({ ...targetContextWithConfig, files }),
      ]);
      await outputOverrides(targetContextWithConfig);
    }),
  );

  console.info('Done!');
}

async function outputOverrides({ target, options, outputPath }: TargetContextWithConfig) {
  const targetOverrides = `${options.overridesDir}/${outputPath}`;

  // get all overrides files
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

const getGeneratorForTarget = ({
  target,
  options,
}: {
  target: Target;
  options: MitosisConfig;
}): TargetContext['generator'] => {
  switch (target) {
    case 'customElement':
      return componentToCustomElement(options.options.customElement);
    case 'html':
      return componentToHtml(options.options.html);
    case 'reactNative':
      return componentToReactNative({ stateType: 'useState' });
    case 'vue2':
      return componentToVue2(options.options.vue2);
    case 'vue':
      console.log('Targeting Vue: defaulting to vue v3');
    case 'vue3':
      return componentToVue3(options.options.vue3);
    case 'angular':
      return componentToAngular(options.options.angular);
    case 'mbox':
      return componentToMbox(options.options.mbox);
    case 'mbox':
      return componentToMboxModel(options.options.mboxModel);
    case 'react':
      return componentToReact(options.options.react);
    case 'swift':
      return componentToSwift(options.options.swift);
    case 'solid':
      return componentToSolid(options.options.solid);
    case 'webcomponent':
      return componentToCustomElement(options.options.webcomponent);
    case 'svelte':
      return componentToSvelte(options.options.svelte);
    case 'qwik':
      return componentToQwik(options.options.qwik);
    case 'marko':
      return componentToMarko(options.options.marko);
    case 'preact':
      return componentToPreact(options.options.preact);
    case 'lit':
      return componentToLit(options.options.lit);
    default:
      throw new Error('CLI does not yet support target: ' + target);
  }
};

/**
 * Output generated component file, before it is minified and transpiled into JS.
 */
const shouldOutputOriginalGeneratedFile = ({
  target,
  options,
}: {
  target: Target;
  options: MitosisConfig;
}): boolean => {
  const languages = options.options[target]?.transpiler?.languages;
  if (languages?.includes('ts')) {
    return true;
  } else {
    return false;
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

    // try to find override component file
    const overrideFilePath = `${options.overridesDir}/${outputPath}/${outputFilePath}`;
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
      case 'preact':
      case 'react':
        transpiled = await transpile({
          path,
          content: transpiled,
          target,
          options,
        });
        break;
      case 'vue':
      case 'vue2':
      case 'vue3':
        break;
    }

    const outputDir = `${options.dest}/${outputPath}`;

    await Promise.all([
      // this is the default output
      outputFile(`${outputDir}/${outputFilePath}`, transpiled),
      ...(shouldOutputOriginalGeneratedFile({ target, options })
        ? [outputFile(`${outputDir}/${path}`, original)]
        : []),
    ]);
  });
  await Promise.all(output);
}

const getTargetPath = ({ target }: { target: Target }): string => {
  switch (target) {
    case 'vue2':
      return 'vue/vue2';
    case 'vue':
    case 'vue3':
      return 'vue/vue3';
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
  const tsFiles = (await glob(options.files, { cwd })).filter(
    (file) => file.endsWith('.ts') || file.endsWith('.js'),
  );

  return await Promise.all(
    tsFiles.map(async (path) => {
      let output: string;
      if (path.endsWith('.context.lite.ts')) {
        output = await buildContextFile({ path, options, target });
        // we remove the `.lite` extension from the path for Context files.
        path = path.replace('.lite.ts', '.ts');
      }
      if (!shouldOutputOriginalGeneratedFile({ target, options })) {
        output = await transpile({
          path,
          target,
          content: output,
          options,
        });
      } else {
        output = await readFile(path, 'utf8');
      }

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
