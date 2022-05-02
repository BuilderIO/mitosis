import {
  componentToReact,
  componentToReactNative,
  componentToSolid,
  componentToSwift,
  componentToVue,
  componentToHtml,
  componentToCustomElement,
  contextToReact,
  contextToSolid,
  contextToVue,
  contextToSvelte,
  MitosisComponent,
  parseContext,
  parseJsx,
  MitosisConfig,
  Target,
  Transpiler,
  componentToSvelte,
} from '@builder.io/mitosis';
import debug from 'debug';
import dedent from 'dedent';
import glob from 'fast-glob';
import { outputFile, pathExists, readFile, remove } from 'fs-extra';
import * as json5 from 'json5';
import { camelCase, kebabCase, last, upperFirst } from 'lodash';
import micromatch from 'micromatch';
import { getSimpleId } from './helpers/get-simple-id';
import { transpile } from './helpers/transpile';
import { transpileOptionalChaining } from './helpers/transpile-optional-chaining';
import { transpileSolidFile } from './helpers/transpile-solid-file';

const cwd = process.cwd();

const DEFAULT_CONFIG: Partial<MitosisConfig> = {
  targets: [],
  dest: 'output',
  files: 'src/*',
  overridesDir: 'overrides',
};

const DEFAULT_OPTIONS: MitosisConfig['options'] = {
  vue: {
    cssNamespace: () => getSimpleId(),
    namePrefix: (path) => (path.includes('/blocks/') ? 'builder' : undefined),
    builderRegister: true,
  },
};

export async function build(config?: MitosisConfig) {
  const options: MitosisConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    options: {
      ...DEFAULT_OPTIONS,
      ...config?.options,
      vue: {
        ...DEFAULT_OPTIONS.vue,
        ...config?.options?.vue,
      },
    },
  };

  await clean(options);

  const tsLiteFiles = await Promise.all(
    micromatch(await glob(options.files, { cwd }), `**/*.lite.tsx`).map(
      async (path) => {
        try {
          const parsed = parseJsx(await readFile(path, 'utf8'), {
            jsonHookNames: ['registerComponent'],
          });
          return {
            path,
            mitosisJson: parsed,
          };
        } catch (err) {
          console.error('Could not parse file:', path);
          throw err;
        }
      },
    ),
  );

  await Promise.all(
    options.targets.map(async (target) => {
      const jsFiles = await buildTsFiles({ target, options });
      await Promise.all([
        outputTsFiles(target, jsFiles, options),
        outputTsxLiteFiles(target, tsLiteFiles, options),
      ]);
      await outputOverrides(target, options);
    }),
  );

  console.info('Done!');
}

async function clean(options: MitosisConfig) {
  const files = await glob(`${options.dest}/*/${options.files}`);
  await Promise.all(
    files.map(async (file) => {
      await remove(file);
    }),
  );
}

async function outputOverrides(target: Target, options: MitosisConfig) {
  const kebabTarget = kebabCase(target);
  const outputDirPath = `${options.overridesDir}/${kebabTarget}`;
  const files = await glob([
    `${outputDirPath}/**/*`,
    `!${outputDirPath}/node_modules/**/*`,
  ]);
  await Promise.all(
    files.map(async (file) => {
      let contents = await readFile(file, 'utf8');

      const esbuildTranspile = file.match(/\.tsx?$/);
      if (esbuildTranspile) {
        contents = await transpile({ path: file, target });
      }

      const targetPaths = getTargetPaths(target);

      await Promise.all(
        targetPaths.map((targetPath) =>
          outputFile(
            file
              .replace(`${outputDirPath}`, `${options.dest}/${targetPath}`)
              .replace(/\.tsx?$/, '.js'),
            contents,
          ),
        ),
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
      return componentToVue(options.options.vue);
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
      // TO-DO: throw instead of `never`
      return null as never;
  }
};

const getFileExtensionForTarget = (target: Target) => {
  switch (target) {
    case 'vue':
      return '.vue';
    case 'swift':
      return '.swift';
    case 'svelte':
      return '.svelte';
    case 'solid':
      return '.jsx';
    default:
      return '.js';
  }
};

const replaceFileExtensionForTarget = ({
  target,
  path,
}: {
  target: Target;
  path: string;
}) => path.replace(/\.lite\.tsx$/, getFileExtensionForTarget(target));

/**
 * Transpiles and outputs Mitosis component files.
 */
async function outputTsxLiteFiles(
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
      debugTarget(
        `Success: transpiled ${path}. Output length: ${transpiled.length}`,
      );
    } catch (error) {
      debugTarget(`Failure: transpiled ${path}.`);
      debugTarget(error);
      return;
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
        transpiled = await transpile({ path, content: transpiled, target });
        const registerComponentHook = mitosisJson.meta.registerComponent;
        if (registerComponentHook) {
          transpiled = dedent`
          import { registerComponent } from '../functions/register-component';
          
          ${transpiled}
          
          registerComponent(${mitosisJson.name}, ${json5.stringify(
            registerComponentHook,
          )});
            `;
        }
        break;

      case 'vue':
        // TODO: transform to CJS (?)
        transpiled = transpileOptionalChaining(transpiled).replace(
          /\.lite(['"];)/g,
          '$1',
        );
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
  const targetPaths =
    target === 'vue' ? ['vue/nuxt2', 'vue/vue2', 'vue/vue3'] : [kebabTarget];

  return targetPaths;
}

/**
 * Outputs non-component files to the destination directory, without modifying them.
 */
async function outputTsFiles(
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
async function buildTsFiles({
  target,
  options,
}: {
  target: Target;
  options: MitosisConfig;
}) {
  const tsFiles = await glob(`src/**/*.ts`, {
    cwd: cwd,
  });

  return await Promise.all(
    tsFiles.map(async (path) => {
      let output: string;
      if (path.endsWith('.context.lite.ts')) {
        // 'foo/bar/my-thing.context.ts' -> 'MyThing'
        const name = upperFirst(camelCase(last(path.split('/')).split('.')[0]));
        const context = parseContext(await readFile(path, 'utf8'), { name });
        if (!context) {
          console.warn('Could not parse context from file', path);
        } else {
          switch (target) {
            case 'svelte':
              output = contextToSvelte(options.options.svelte)({ context });
              break;
            case 'vue':
              output = contextToVue(context);
              break;
            case 'solid':
              output = contextToSolid()({ context });
              break;
            case 'react':
            case 'reactNative':
              output = contextToReact()({ context });
              break;
            default:
              console.warn(
                'Context files are not supported for this target. Outputting no-op',
              );
              contextToVue(context);
          }
        }
        // we remove the `.lite` extension from the path for Context files.
        path = path.replace('.lite.ts', '.ts');
      }
      output = await transpile({ path, target, content: output });

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
