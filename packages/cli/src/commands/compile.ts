import {
  builderContentToMitosisComponent,
  compileAwayBuilderComponents,
  GeneratorOptions,
  MitosisComponent,
  parseJsx,
  Plugin,
  Target,
  targets,
} from '@builder.io/mitosis';
import { GluegunCommand } from 'gluegun';
import { join } from 'path';
import { UnionToIntersection } from '../types';
import { getMitosisConfig } from '../helpers/get-mitosis-config';
import { flow } from 'fp-ts/lib/function';

type GeneratorOpts = GeneratorOptions[Target];

type AllGeneratorOption = UnionToIntersection<GeneratorOpts>;
// The only purpose this really serves is to ensure I provide a flag API
// for ever generator's option.
type AllGeneratorOptionKeys = keyof AllGeneratorOption;

const command: GluegunCommand = {
  name: 'compile',
  alias: 'c',
  run: async (toolbox) => {
    const { parameters, strings, filesystem, print } = toolbox;
    const opts = parameters.options;

    if (opts.l ?? opts.list ?? false) {
      return listTargets();
    }

    // config file
    const configRelPath = opts.config ?? opts.c;
    // Flags and aliases
    const from_ = strings.camelCase(opts.f ?? opts.from ?? 'mitosis');
    const to = strings.camelCase(opts.t ?? opts.to);
    let out = opts.o ?? opts.out;
    const force = opts.force ?? false;
    const dryRun = opts.dryRun ?? opts.n ?? false;
    const outDir = opts.outDir;

    const header = opts.header;

    const plugins: Plugin[] = [];

    if (!opts.builderComponents) {
      plugins.push(compileAwayBuilderComponents());
    }

    const mitosisConfig = getMitosisConfig(configRelPath);
    const generatorOptions = mitosisConfig?.options?.[to as keyof GeneratorOptions];

    const generatorOpts = {
      ...generatorOptions,
      prettier: opts.prettier ?? true,
      plugins: [...plugins, ...(generatorOptions?.plugins || [])],
      format: opts.format,
      prefix: opts.prefix,
      includeIds: opts.includeIds,
      stylesType: opts.styles,
      stateType: opts.state,
      type: opts.type,
      cssNamespace: opts.cssNamespace,
    } as any as Partial<{ [K in AllGeneratorOptionKeys]: any }>;

    // Positional Args
    const paths = parameters.array || [];

    // Flag configuration state
    const isStdin = parameters.first === '-' || paths.length === 0;

    // Input validations

    // Validate that "--to" is supported
    if (!isTarget(to)) {
      console.error(`no matching output target for "${to}"`);
      process.exit(1);
    }

    const generator = targets[to];

    if (out && paths.length > 1) {
      console.error(`--out doesn't support multiple input files, did you mean --outDir?`);
      process.exit(1);
    }

    async function* readFiles() {
      if (isStdin) {
        const data = await readStdin();
        yield { data };
      }
      for (const path of paths) {
        if (filesystem.exists(path) !== 'file') {
          print.error(`"${path}" is not a file`);
          process.exit(1);
        }
        const data = filesystem.read(path);
        yield { path, data };
      }
    }

    for await (const { data, path } of readFiles()) {
      if (outDir) {
        out = join(outDir, path!);
      }

      // Validate that "--out" file doesn't already exist
      if (force === false && out && filesystem.exists(out) === 'file') {
        print.error(`${out} already exists. Use --force if you want to overwrite existing files.`);
        process.exit(1);
      }

      try {
        let json: MitosisComponent;

        switch (from_) {
          case 'mitosis':
            json = parseJsx(data!, { typescript: generatorOpts.typescript });
            break;

          case 'builder':
            json = builderContentToMitosisComponent(JSON.parse(data!));
            break;

          default:
            print.error(`${from_} is not a valid input type`);
            process.exit(1);
        }

        // TODO validate generator options
        const outputFiles = generator(generatorOpts as any)({ component: json, path });

        const withHeader = (str: string | object) => {
          return header && !isJSON(str) ? `${header}\n${str}` : str;
        };
        const prettyPrint = (str: string | object): string => {
          return isJSON(str) ? JSON.stringify(str, null, 2) : str;
        };
        const formattedOutput = flow(withHeader, prettyPrint);

        outputFiles.map((output) => {
          if (!out) {
            console.log(formattedOutput(output.content));
            return;
          }

          print.info(out);

          if (!dryRun) {
            filesystem.write(out, formattedOutput(output.content));
          }
        });
      } catch (e) {
        print.divider();
        print.info(`Path: ${path}`);
        print.divider();
        print.info('Error:');
        print.error(e);
        process.exit(1);
      }
    }
  },
};

module.exports = command;

/**
 * List all targets (args to --to). This could be moved to it's own command at
 * some point depending on the desired API.
 */
function listTargets() {
  for (const prop of Object.keys(targets)) {
    console.log(prop);
  }
  return;
}

function isTarget(term: string): term is Target {
  return typeof targets[term as keyof typeof targets] !== 'undefined';
}

function isJSON(obj: any): obj is object {
  return typeof obj === 'object';
}

async function readStdin() {
  const chunks: Buffer[] = [];

  await new Promise((res) =>
    process.stdin
      .on('data', (data) => {
        return chunks.push(data);
      })
      .on('end', () => {
        return res(true);
      }),
  );

  return Buffer.concat(chunks).toString('utf-8');
}
