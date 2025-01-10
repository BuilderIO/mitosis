import {
  BaseTranspilerOptions,
  MitosisComponent,
  MitosisConfig,
  MitosisPlugin,
  OutputFiles,
  ParseMitosisOptions,
  Target,
  TargetContext,
  checkIsMitosisComponentFilePath,
  checkIsSvelteComponentFilePath,
  checkShouldOutputTypeScript,
  createTypescriptProject,
  mapSignalTypeInTSFile,
  parseJsx,
  parseSvelte,
  removeMitosisImport,
  renameComponentFile,
  targets,
} from '@builder.io/mitosis';
import debug from 'debug';
import { flow, pipe } from 'fp-ts/lib/function';
import { outputFile, pathExists, pathExistsSync, readFile, remove } from 'fs-extra';
import { kebabCase } from 'lodash';
import { fastClone } from '../helpers/fast-clone';
import { generateContextFile } from './helpers/context';
import { getFiles } from './helpers/files';
import { getOverrideFile } from './helpers/overrides';
import { transformImports, transpile, transpileIfNecessary } from './helpers/transpile';

const cwd = process.cwd();

/**
 * This provides the default path for a target's contents, both in the input and output directories.
 */
const getTargetPath = ({ target }: { target: Target }): string => {
  switch (target) {
    default:
      return kebabCase(target);
  }
};

export const sortPlugins = (plugins?: MitosisPlugin[]): MitosisPlugin[] => {
  if (!plugins) return [];

  return plugins.sort((a: MitosisPlugin, b: MitosisPlugin) => (a().order || 0) - (b().order || 0));
};

const DEFAULT_CONFIG = {
  targets: [],
  dest: 'output',
  files: 'src/*',
  overridesDir: 'overrides',
  getTargetPath,
  options: {},
} satisfies Partial<MitosisConfig>;

const getOptions = (config?: MitosisConfig): MitosisConfig => {
  const newConfig: MitosisConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    options: {
      ...DEFAULT_CONFIG.options,
      ...config?.options,
    },
    generators: Object.assign(targets, config?.generators),
  };

  for (const target of newConfig.targets || []) {
    /**
     * Apply common options to all targets
     */
    if (newConfig.commonOptions) {
      newConfig.options[target] = {
        ...newConfig.commonOptions,
        ...newConfig.options[target],
        plugins: [
          ...(newConfig.commonOptions?.plugins || []),
          ...(newConfig.options[target]?.plugins || []),
        ],
      } as any;
    }
    const targetConfig: any = newConfig.options[target];
    const plugins: MitosisPlugin[] | undefined = targetConfig?.plugins;
    newConfig.options[target] = { ...targetConfig, plugins: sortPlugins(plugins) };
  }

  return newConfig;
};

async function clean(options: MitosisConfig, target: Target) {
  const outputPattern = `${options.dest}/${options.getTargetPath({ target })}/${options.files}`;
  const oldFiles = getFiles({ files: outputPattern, exclude: options.exclude });

  const newFilenames = getFiles({ files: options.files, exclude: options.exclude })
    .map((path) =>
      checkIsMitosisComponentFilePath(path)
        ? renameComponentFile({ target, path, options })
        : path.endsWith('.js') || path.endsWith('.ts')
        ? getNonComponentOutputFileName({ target, path, options })
        : undefined,
    )
    .filter((x): x is string => Boolean(x));

  await Promise.all(
    oldFiles.map(async (oldFile) => {
      const fileExists = newFilenames.some((newFile) => oldFile.endsWith(newFile));

      /**
       * We only remove files that were removed from the input files.
       * Modified files will be overwritten, and new files will be created.
       */
      if (!fileExists) {
        await remove(oldFile);
      }
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

  const targetsRequiringTypeScript = targetsOptions.filter(
    (option: BaseTranspilerOptions) => option.typescript,
  ).length;
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

const parseJsxComponent = async ({
  options,
  path,
  file,
  tsProject,
}: {
  options: MitosisConfig;
  path: string;
  file: string;
  tsProject: ParseMitosisOptions['tsProject'];
}) => {
  const requiredParses = getRequiredParsers(options);
  let typescriptMitosisJson: ParsedMitosisJson['typescriptMitosisJson'];
  let javascriptMitosisJson: ParsedMitosisJson['javascriptMitosisJson'];

  const jsxArgs: ParseMitosisOptions = {
    ...options.parserOptions?.jsx,
    tsProject,
    filePath: path,
    typescript: false,
  };
  if (requiredParses.typescript && requiredParses.javascript) {
    typescriptMitosisJson = options.parser
      ? await options.parser(file, path)
      : parseJsx(file, { ...jsxArgs, typescript: true });
    javascriptMitosisJson = options.parser
      ? await options.parser(file, path)
      : parseJsx(file, { ...jsxArgs, typescript: false });
  } else {
    const singleParse = options.parser
      ? await options.parser(file, path)
      : parseJsx(file, { ...jsxArgs, typescript: requiredParses.typescript });

    // technically only one of these will be used, but we set both to simplify things types-wise.
    typescriptMitosisJson = singleParse;
    javascriptMitosisJson = singleParse;
  }

  const output: ParsedMitosisJson = {
    path,
    typescriptMitosisJson,
    javascriptMitosisJson,
  };
  return output;
};

const parseSvelteComponent = async ({ path, file }: { path: string; file: string }) => {
  const json = await parseSvelte(file, path);

  const output: ParsedMitosisJson = {
    path,
    typescriptMitosisJson: json,
    javascriptMitosisJson: json,
  };

  return output;
};

const findTsConfigFile = (options: MitosisConfig) => {
  const optionPath = options.parserOptions?.jsx?.tsConfigFilePath;

  if (optionPath && pathExistsSync(optionPath)) {
    return optionPath;
  }

  const defaultPath = [cwd, 'tsconfig.json'].join('/');

  if (pathExistsSync(defaultPath)) {
    return defaultPath;
  }

  return undefined;
};

const getMitosisComponentJSONs = async (options: MitosisConfig): Promise<ParsedMitosisJson[]> => {
  const paths = getFiles({ files: options.files, exclude: options.exclude }).filter(
    checkIsMitosisComponentFilePath,
  );

  const tsConfigFilePath = findTsConfigFile(options);

  const tsProject = tsConfigFilePath ? createTypescriptProject(tsConfigFilePath) : undefined;

  return Promise.all(
    paths.map(async (path) => {
      try {
        const file = await readFile(path, 'utf8');
        if (checkIsSvelteComponentFilePath(path)) {
          return await parseSvelteComponent({ path, file });
        } else {
          return await parseJsxComponent({ options, path, file, tsProject });
        }
      } catch (err) {
        console.error('Could not parse file:', path);
        throw err;
      }
    }),
  );
};

interface TargetContextWithConfig extends TargetContext {
  options: MitosisConfig;
}

const getTargetContexts = (options: MitosisConfig) =>
  options.targets.map(
    (target): TargetContext => ({
      target,
      generator: options.generators?.[target] as any,
      outputPath: options.getTargetPath({ target }),
    }),
  );

const buildAndOutputNonComponentFiles = async (targetContext: TargetContextWithConfig) => {
  const files = await buildNonComponentFiles(targetContext);
  return await outputNonComponentFiles({ ...targetContext, files });
};

export function runBuildPlugins(type: 'pre' | 'post', plugins: MitosisPlugin[]) {
  const debugTarget = debug(`mitosis:plugin:build:${type}`);

  return async (
    targetContext: TargetContext,
    files?: {
      componentFiles: OutputFiles[];
      nonComponentFiles: OutputFiles[];
    },
  ) => {
    for (let pluginFn of plugins) {
      const plugin = pluginFn();
      if (!plugin.build || !plugin.build[type]) continue;
      debugTarget(`before run ${plugin.name ?? 'build'} ${type} plugin...`);
      await plugin.build[type]?.(targetContext, files);
      debugTarget(`run ${plugin.name ?? 'build'} ${type}  plugin done`);
    }
  };
}

export async function build(config?: MitosisConfig) {
  // merge default options
  const options = getOptions(config);

  // get all mitosis component JSONs
  const mitosisComponents = await getMitosisComponentJSONs(options);

  const targetContexts: TargetContext[] = getTargetContexts(options);

  await Promise.all(
    targetContexts.map(async (targetContext) => {
      const plugins: MitosisPlugin[] = options?.options[targetContext.target]?.plugins ?? [];
      await runBuildPlugins('pre', plugins)(targetContext);
      // clean output directory
      await clean(options, targetContext.target);
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
      await runBuildPlugins('post', plugins)(targetContext, {
        componentFiles: x[1],
        nonComponentFiles: x[0],
      });
    }),
  );

  console.info('Mitosis: generation completed.');
}

/**
 * Transpiles and outputs Mitosis component files.
 */
async function buildAndOutputComponentFiles({
  target,
  files,
  options,
  generator,
  outputPath,
}: TargetContextWithConfig & { files: ParsedMitosisJson[] }): Promise<OutputFiles[]> {
  const debugTarget = debug(`mitosis:${target}`);
  const shouldOutputTypescript = checkShouldOutputTypeScript({ options, target });

  const output = files.map(async ({ path, typescriptMitosisJson, javascriptMitosisJson }) => {
    const outputFilePath = renameComponentFile({ target, path, options });

    /**
     * Try to find override file.
     * NOTE: we use the default `getTargetPath` even if a user-provided alternative is given. That's because the
     * user-provided alternative is only for the output path, not the override input path.
     */

    const overrideFilePath = `${options.overridesDir}/${getTargetPath({ target })}`;
    const overrideFile = await getOverrideFile({
      filename: outputFilePath,
      path: overrideFilePath,
      target,
    });

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

    transpiled = transformImports({ target, options })(transpiled);

    const outputDir = `${options.dest}/${outputPath}`;

    await outputFile(`${outputDir}/${outputFilePath}`, transpiled);
    return { outputDir, outputFilePath };
  });
  return await Promise.all(output);
}

const getNonComponentFileExtension = flow(checkShouldOutputTypeScript, (shouldOutputTypeScript) =>
  shouldOutputTypeScript ? '.ts' : '.js',
);

const getNonComponentOutputFileName = ({
  target,
  options,
  path,
}: {
  path: string;
  target: Target;
  options: MitosisConfig;
}) => path.replace(/\.tsx?$/, getNonComponentFileExtension({ target, options }));

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
}): Promise<OutputFiles[]> => {
  const outputDir = `${options.dest}/${outputPath}`;
  return await Promise.all(
    files.map(async ({ path, output }) => {
      const outputFilePath = getNonComponentOutputFileName({ options, path, target });
      await outputFile(`${outputDir}/${outputFilePath}`, output);
      return { outputDir, outputFilePath };
    }),
  );
};

async function buildContextFile({
  target,
  options,
  path,
}: TargetContextWithConfig & { path: string }) {
  let output = (await generateContextFile({ path, options, target })) || '';

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
  const nonComponentFiles = getFiles({ files: options.files, exclude: options.exclude }).filter(
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
        const output = pipe(
          await transpileIfNecessary({ path, target, content: overrideFile, options }),
          transformImports({ target, options }),
        );

        return { output, path };
      }

      const isContextFile = path.endsWith('.context.lite.ts');
      if (isContextFile) {
        return buildContextFile({ ...args, path });
      }

      const file = await readFile(path, 'utf8');

      const output = pipe(
        await transpileIfNecessary({ path, target, options, content: file }),
        transformImports({ target, options }),
        (code) => mapSignalTypeInTSFile({ code, target }),
        removeMitosisImport,
      );

      return { output, path };
    }),
  );
}

if (require.main === module) {
  build().catch(console.error);
}
