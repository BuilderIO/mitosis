import { build } from 'gluegun';
import { Toolbox } from 'gluegun/build/types/domain/toolbox';

const help = (toolbox: Toolbox) =>
  toolbox.print.info(
    // TODO: break docs up by command
    `
mitosis command line component processor [version ${toolbox.meta.version()}]

USAGE
	mitosis compile --to=<format> [options] [files]
	mitosis compile -t=<format> [options] [files]

	If no [input-files] are specified or when [files] is "-", input
	is read from standard input.

EXAMPLES
	mitosis compile -t react component.tsx
	mitosis compile -t react < component.tsx
	cat component.tsx | mitosis compile -t html -
	mitosis compile -t react --out-dir build -- src/**/*.tsx

OPTIONS
	--to=<format>, -t=<format>
		Specify output format. <format> can be one of:
		
		- reactNative
		- solid
		- vue
		- react
		- template
		- html
		- customElement
		- mitosis
		- builder
		- swift
		- svelte
		- liquid
		- angular
	--from=<format>, -f=<format>
		Specify input format. <format> can be one of:
		
		- mitosis
		- builder
		- liquid
	--list, -l
		List available output formats.

OUTPUT OPTIONS
	--out=<file>, -o=<file>
		Emit output to a single file
	--out-dir=<dir>
		Redirect output structure to <dir>. Files written to <dir> preserve
		their structure relative to the current directory.

		For example, given a directory structure like

		└── src
		   ├── a.tsx
		   ├── b.tsx
		   └── c.tsx

		The command "mitosis compile -t react --out-dir lib -- src/*.tsx" would
		produce a structure like:

		├── src
		│  ├── a.tsx
		│  ├── b.tsx
		│  └── c.tsx
		└── lib
		   └── src
		      ├── a.tsx
		      ├── b.tsx
		      └── c.tsx

	--dry-run, -n
		Perform a trial run with no changes made.
	--force
		Overwrite existing files.
	--header=<string>
		Add a preamble to the document. Useful if you want to include a
		license or an import statement. Header will be ignored if the
		output is JSON.
	--builder-components
		Compiled output should will include builder components where
		available. Useful if you're outputing mitosis that will run
		in Builder.

GENERATOR OPTIONS
	--format=<format>
	--prefix=<prefix>
	--includeIds=<include_ids>
	--styles=<library_or_method>
	--state=<library_or_method>
`.trim(),
  );

/**
 * Create the cli and kick it off
 */
async function run(argv: any) {
  // create a CLI runtime
  const cli = build()
    .brand('mitosis')
    .src(__dirname)
    .plugins('./node_modules', { matching: 'mitosis-*', hidden: true })
    .help(help) // provides default for help, h, --help, -h
    .version() // provides default for version, v, --version, -v
    // enable the following method if you'd like to skip loading one of these core extensions
    // this can improve performance if they're not necessary for your project:
    .exclude([])
    .create();
  // and run it
  const toolbox = await cli.run(argv);

  // send it back (for testing, mostly)
  return toolbox;
}

module.exports = { run };
