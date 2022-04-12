import {
  componentToReact,
  componentToReactNative,
  componentToSolid,
  componentToSwift,
  componentToVue,
  componentToHtml,
  componentToCustomElement,
  contextToReact,
  contextToVue,
  MitosisComponent,
  parseContext,
  parseJsx,
  MitosisConfig,
  Target,
  Transpiler,
  componentToSvelte,
} from '@builder.io/mitosis';
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
      const jsFiles = await buildTsFiles(target);
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
      return componentToReact();
    case 'swift':
      return componentToSwift();
    case 'solid':
      return componentToSolid();
    case 'webcomponent':
      return componentToCustomElement(options.options.webcomponent);
    case 'svelte':
      return componentToSvelte();
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
  const output = files.map(async ({ path, mitosisJson }) => {
    const outputDir = `${options.dest}/${kebabTarget}`;

    const outputFilePath = replaceFileExtensionForTarget({
      target,
      path,
    });

    // get override file
    const overrideFilePath = `${options.overridesDir}/${kebabTarget}/${outputFilePath}`;
    const overrideFile = (await pathExists(overrideFilePath))
      ? await readFile(overrideFilePath, 'utf8')
      : null;

    let transpiled =
      overrideFile ??
      getTranspilerForTarget({ options, target })({
        path,
        component: mitosisJson,
      });

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
    }

    // output file
    switch (target) {
      case 'vue':
        // Nuxt
        await outputFile(
          `${outputDir}/nuxt2/${outputFilePath}`,
          // TODO: transform to CJS (?)
          transpileOptionalChaining(transpiled).replace(/\.lite(['"];)/g, '$1'),
        );
        break;

      default:
        await Promise.all([
          // this is the default output
          outputFile(
            `${options.dest}/${kebabTarget}/${outputFilePath}`,
            transpiled,
          ),
          // additional output for swift target
          ...(target === 'swift'
            ? []
            : [
                outputFile(
                  `${options.dest}/${kebabTarget}/${path.replace(
                    /\.original\.jsx$/,
                    '.js',
                  )}`,
                  original,
                ),
              ]),
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
async function buildTsFiles(target: Target, options?: MitosisConfig) {
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
          if (target === 'vue') {
            output = contextToVue(context);
          } else {
            output = contextToReact()({ context });
          }
        }
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
