import {
  componentToAngular,
  componentToCustomElement,
  componentToHtml,
  componentToMarko,
  componentToPreact,
  componentToLit,
  componentToQwik,
  componentToReact,
  componentToRsc,
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
  TranspilerGenerator,
} from '@builder.io/mitosis';
import debug from 'debug';
import glob from 'fast-glob';
import { flow, pipe } from 'fp-ts/lib/function';
import { outputFile, pathExists, readFile, remove } from 'fs-extra';
import { kebabCase } from 'lodash';
import micromatch from 'micromatch';
import { fastClone } from '../helpers/fast-clone';
import { generateContextFile } from './helpers/context';
import { getFileExtensionForTarget } from './helpers/extensions';
import { transformImports, transpile } from './helpers/transpile';
import { transpileSolidFile } from './helpers/transpile-solid-file';

const cwd = process.cwd();

/**
 * This provides the default path for a target's contents, both in the input and output directories.
 */
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

const DEFAULT_CONFIG: Partial<MitosisConfig> = {
  targets: [],
  dest: 'output',
  files: 'src/*',
  overridesDir: 'overrides',
  extension: 'lite.tsx',
  getTargetPath,
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

type ParsedMitosisJson = {
  path: string;
  typescriptMitosisJson: MitosisComponent;
  javascriptMitosisJson: MitosisComponent;
};

const getRequiredParsers = (
  options: MitosisConfig,
): { javascript: boolean; typescript: boolean } => {
  const targetsOptions = Object.values(options.options);

  const targetsRequiringTypeScript = targetsOptions.filter((option) => option.typescript).length;
  const needsTypeScript = targetsRequiringTypeScript > 0;

  /**
   * We use 2 ways to check if the user requires a JS output:
   * - either there are fewer `options[target].typescript === true` than there are items in `targets`
   * - either there are fewer `options[target].typescript === true` than there are items in `options.options`
   *
   * The reason for checking in multiple ways is if there is a mismatch between the number of targets in the `targets`
   * array compared to the configurations in `options.options`.
   */
  const needsJavaScript =
    options.targets.length > targetsRequiringTypeScript ||
    targetsOptions.length > targetsRequiringTypeScript;

  return {
    typescript: needsTypeScript,
    javascript: needsJavaScript,
  };
};

const getMitosisComponentJSONs = async (options: MitosisConfig): Promise<ParsedMitosisJson[]> => {
  const requiredParses = getRequiredParsers(options);
  return Promise.all(
    micromatch(await glob(options.files, { cwd }), `**/*.${options.extension}`).map(
      async (path): Promise<ParsedMitosisJson> => {
        try {
          const file = await readFile(path, 'utf8');
          let typescriptMitosisJson: ParsedMitosisJson['typescriptMitosisJson'];
          let javascriptMitosisJson: ParsedMitosisJson['javascriptMitosisJson'];
          if (requiredParses.typescript && requiredParses.javascript) {
            typescriptMitosisJson = options.parser
              ? await options.parser(file, path)
              : parseJsx(file, { typescript: true });
            javascriptMitosisJson = options.parser
              ? await options.parser(file, path)
              : parseJsx(file, { typescript: false });
          } else {
            const singleParse = options.parser
              ? await options.parser(file, path)
              : parseJsx(file, { typescript: requiredParses.typescript });

            // technically only one of these will be used, but we set both to simplify things types-wise.
            typescriptMitosisJson = singleParse;
            javascriptMitosisJson = singleParse;
          }

          return {
            path,
            typescriptMitosisJson,
            javascriptMitosisJson,
          };
        } catch (err) {
          console.error('Could not parse file:', path);
          throw err;
        }
      },
    ),
  );
};

interface TargetContext {
  target: Target;
  generator: TranspilerGenerator<MitosisConfig['options'][Target]>;
  outputPath: string;
}

interface TargetContextWithConfig extends TargetContext {
  options: MitosisConfig;
}

const getTargetContexts = (options: MitosisConfig) =>
  options.targets.map(
    (target): TargetContext => ({
      target,
      generator: getGeneratorForTarget({ target }),
      outputPath: options.getTargetPath({ target }),
    }),
  );

const buildAndOutputNonComponentFiles = async (targetContext: TargetContextWithConfig) => {
  const files = await buildNonComponentFiles(targetContext);
  await outputNonComponentFiles({ ...targetContext, files });
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

      await Promise.all([
        buildAndOutputNonComponentFiles({ ...targetContext, options }),
        buildAndOutputComponentFiles({ ...targetContext, options, files }),
      ]);
    }),
  );

  console.info('Done!');
}

const getGeneratorForTarget = ({ target }: { target: Target }): TargetContext['generator'] => {
  switch (target) {
    case 'customElement':
      return componentToCustomElement;
    case 'html':
      return componentToHtml;
    case 'reactNative':
      return componentToReactNative;
    case 'vue2':
      return componentToVue2;
    case 'vue':
      console.log('Targeting Vue: defaulting to vue v3');
    case 'vue3':
      return componentToVue3;
    case 'angular':
      return componentToAngular;
    case 'react':
      return componentToReact;
    case 'swift':
      return componentToSwift;
    case 'solid':
      return componentToSolid;
    case 'webcomponent':
      return componentToCustomElement;
    case 'svelte':
      return componentToSvelte;
    case 'qwik':
      return componentToQwik;
    case 'marko':
      return componentToMarko;
    case 'preact':
      return componentToPreact;
    case 'rsc':
      return componentToRsc;
    case 'lit':
      return componentToLit;
    default:
      throw new Error('CLI does not yet support target: ' + target);
  }
};

/**
 * Output generated component file, before it is minified and transpiled into JS.
 */
const checkShouldOutputTypeScript = ({
  target,
  options,
}: {
  target: Target;
  options: MitosisConfig;
}): boolean => {
  return !!options.options[target]?.typescript;
};

const replaceFileExtensionForTarget = ({
  target,
  path,
  options,
}: {
  target: Target;
  path: string;
  options: MitosisConfig;
}) => {
  let regex = new RegExp(`.${options.extension}$`);
  return path.replace(regex, getFileExtensionForTarget({ type: 'filename', target, options }));
};

/**
 * Transpiles and outputs Mitosis component files.
 */
async function buildAndOutputComponentFiles({
  target,
  files,
  options,
  generator,
  outputPath,
}: TargetContextWithConfig & { files: ParsedMitosisJson[] }) {
  const debugTarget = debug(`mitosis:${target}`);
  const shouldOutputTypescript = checkShouldOutputTypeScript({ options, target });

  const output = files.map(async ({ path, typescriptMitosisJson, javascriptMitosisJson }) => {
    const outputFilePath = replaceFileExtensionForTarget({ target, path, options });

    /**
     * Try to find override file.
     * NOTE: we use the default `getTargetPath` even if a user-provided alternative is given. That's because the
     * user-provided alternative is only for the output path, not the override input path.
     */
    const overrideFilePath = `${options.overridesDir}/${getTargetPath({ target })}/${path}`;
    const overrideFile = (await pathExists(overrideFilePath))
      ? await readFile(overrideFilePath, 'utf8')
      : null;

    debugTarget(`transpiling ${path}...`);
    let transpiled = '';

    if (overrideFile) {
      debugTarget(`override exists for ${path}: ${!!overrideFile}`);
    }
    try {
      const component = shouldOutputTypescript ? typescriptMitosisJson : javascriptMitosisJson;

      transpiled = overrideFile ?? generator(options.options[target])({ path, component });
      debugTarget(`Success: transpiled ${path}. Output length: ${transpiled.length}`);
    } catch (error) {
      debugTarget(`Failure: transpiled ${path}.`);
      debugTarget(error);
      throw error;
    }

    // perform additional transpilation steps per-target when outputting JS
    if (!shouldOutputTypescript) {
      // TO-DO: it makes no sense for there to be this kind of logic here. Move it to the transpiler.
      switch (target) {
        case 'solid':
          transpiled = await transpileSolidFile({
            contents: transpiled,
            path,
          });
          break;
        case 'reactNative':
        case 'preact':
        case 'rsc':
        case 'react':
          transpiled = await transpile({
            path,
            content: transpiled,
            target,
            options,
          });
          break;
      }
    }

    const outputDir = `${options.dest}/${outputPath}`;

    await outputFile(`${outputDir}/${outputFilePath}`, transpiled);
  });
  await Promise.all(output);
}

const getNonComponentFileExtension = flow(checkShouldOutputTypeScript, (shouldOutputTypeScript) =>
  shouldOutputTypeScript ? '.ts' : '.js',
);

/**
 * Outputs non-component files to the destination directory, without modifying them.
 */
const outputNonComponentFiles = async ({
  files,
  options,
  outputPath,
  target,
}: TargetContext & {
  files: { path: string; output: string }[];
  options: MitosisConfig;
}) => {
  const extension = getNonComponentFileExtension({ target, options });
  const folderPath = `${options.dest}/${outputPath}`;
  await Promise.all(
    files.map(({ path, output }) =>
      outputFile(`${folderPath}/${path.replace(/\.tsx?$/, extension)}`, output),
    ),
  );
};

async function buildContextFile({
  target,
  options,
  path,
}: TargetContextWithConfig & { path: string }) {
  let output = await generateContextFile({ path, options, target });

  // transpile to JS if necessary
  if (!checkShouldOutputTypeScript({ target, options })) {
    output = await transpile({
      path,
      target,
      content: output,
      options,
    });
  }

  // we remove the `.lite` extension from the path for Context files.
  path = path.replace('.lite.ts', '.ts');

  return {
    path,
    output,
  };
}

/**
 * Transpiles all non-component files, including Context files.
 */
async function buildNonComponentFiles(args: TargetContextWithConfig) {
  const { target, options } = args;
  const nonComponentFiles = (await glob(options.files, { cwd })).filter(
    (file) => file.endsWith('.ts') || file.endsWith('.js'),
  );

  return await Promise.all(
    nonComponentFiles.map(async (path): Promise<{ path: string; output: string }> => {
      /**
       * Try to find override file.
       * NOTE: we use the default `getTargetPath` even if a user-provided alternative is given. That's because the
       * user-provided alternative is only for the output path, not the override input path.
       */
      const overrideFilePath = `${options.overridesDir}/${getTargetPath({ target })}/${path}`;

      const overrideFile = (await pathExists(overrideFilePath))
        ? await readFile(overrideFilePath, 'utf8')
        : null;

      if (overrideFile) {
        const output = checkShouldOutputTypeScript({ target, options })
          ? transformImports(target, options)(overrideFile)
          : await transpile({ path, target, content: overrideFile, options });

        return { output, path };
      }

      const isContextFile = path.endsWith('.context.lite.ts');
      if (isContextFile) {
        return buildContextFile({ ...args, path });
      }

      const output = checkShouldOutputTypeScript({ target, options })
        ? pipe(await readFile(path, 'utf8'), transformImports(target, options))
        : await transpile({ path, target, options });

      return { output, path };
    }),
  );
}

if (require.main === module) {
  build().catch(console.error);
}
