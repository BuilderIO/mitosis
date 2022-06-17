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

const buildAndOutputNonComponentFiles = async ({
  options,
  target,
}: {
  target: Target;
  options: MitosisConfig;
}) => {
  const jsFiles = await buildNonComponentFiles({ target, options });
  await outputNonComponentFiles(target, jsFiles, options);
};

export async function build(config?: MitosisConfig) {
  // merge default options
  const options = getOptions(config);

  // clean output directory
  await clean(options);

  // get all mitosis component JSONs
  const mitosisComponents = await getMitosisComponentJSONs(options);

  await Promise.all(
    options.targets.map(async (target) => {
      await Promise.all([
        buildAndOutputNonComponentFiles({ target, options }),
        buildAndOutputComponentFiles(target, mitosisComponents, options),
      ]);
      await outputOverrides(target, options);
    }),
  );

  console.info('Done!');
}

/**
 * TO-DO: can this be removed?
 */
async function outputOverrides(target: Target, options: MitosisConfig) {
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

      const targetPaths = getTargetPaths(target);

      await Promise.all(
        targetPaths.map((targetPath) => {
          const newFile = overrideFileName
            // replace any reference to the overrides directory with the target directory
            // e.g. `overrides/react/components/Button.tsx` -> `output/react/components/Button.tsx`
            .replace(`${targetOverrides}`, `${options.dest}/${targetPath}`)
            // replace `.tsx` references with `.js`
            .replace(/\.tsx?$/, '.js');

          return outputFile(newFile, contents);
        }),
      );
    }),
  );
}

const getTranspilerForTarget = ({
  target,
  options,
}: {
  target: Target;
  options: MitosisConfig;
}): Transpiler => {
  switch (target) {
    case 'customElement':
      return componentToCustomElement(options.options.customElement);
    case 'html':
      return componentToHtml(options.options.html);
    case 'reactNative':
      return componentToReactNative({ stateType: 'useState' });
    case 'vue':
      const { vueVersion, ...vueOptions } = options.options.vue;
      return componentToVue({ ...vueOptions, vueVersion: 2 });
    case 'angular':
      return componentToAngular(options.options.angular);
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
    default:
      throw new Error('CLI does not yet support target: ' + target);
  }
};

const replaceFileExtensionForTarget = ({ target, path }: { target: Target; path: string }) =>
  path.replace(/\.lite\.tsx$/, getFileExtensionForTarget(target));

/**
 * Transpiles and outputs Mitosis component files.
 */
async function buildAndOutputComponentFiles(
  target: Target,
  files: { path: string; mitosisJson: MitosisComponent }[],
  options: MitosisConfig,
) {
  const kebabTarget = kebabCase(target);
  const debugTarget = debug(`mitosis:${target}`);
  const transpiler = getTranspilerForTarget({ options, target });
  const output = files.map(async ({ path, mitosisJson }) => {
    const outputFilePath = replaceFileExtensionForTarget({
      target,
      path,
    });

    // try to find override file
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
      transpiled = overrideFile ?? transpiler({ path, component: mitosisJson });
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

    const outputDir = `${options.dest}/${kebabTarget}`;

    // output files
    switch (target) {
      case 'vue':
        // Nuxt
        await outputFile(`${outputDir}/nuxt2/${outputFilePath}`, transpiled);
        break;

      default:
        await Promise.all([
          // this is the default output
          outputFile(`${outputDir}/${outputFilePath}`, transpiled),
          // output generated component file, before it is minified and transpiled into JS.
          // we skip these targets because the files would be invalid.
          ...(target === 'swift' || target === 'svelte'
            ? []
            : [outputFile(`${outputDir}/${path}`, original)]),
        ]);
        break;
    }
  });
  await Promise.all(output);
}

function getTargetPaths(target: Target) {
  const kebabTarget = kebabCase(target);
  const targetPaths = target === 'vue' ? ['vue/nuxt2', 'vue/vue2', 'vue/vue3'] : [kebabTarget];

  return targetPaths;
}

/**
 * Outputs non-component files to the destination directory, without modifying them.
 */
async function outputNonComponentFiles(
  target: Target,
  files: { path: string; output: string }[],
  options: MitosisConfig,
) {
  const targetPaths = getTargetPaths(target);
  const output = [];
  for (const targetPath of targetPaths) {
    output.push(
      ...files.map(({ path, output }) => {
        return outputFile(
          `${options.dest}/${targetPath}/${path.replace(/\.tsx?$/, '.js')}`,
          output,
        );
      }),
    );
  }
  await Promise.all(output);
}

/**
 * Transpiles all non-component files, including Context files.
 */
async function buildNonComponentFiles({
  target,
  options,
}: {
  target: Target;
  options: MitosisConfig;
}) {
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
