import { Toolbox } from 'gluegun/build/types/domain/toolbox';

export const getToolboxInfo = (toolbox: Toolbox): string => {
  return `
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
		
		- alpine
                - angular
                - builder
                - customComponent
                - html
                - liquid
                - lit
                - marko
                - mitosis
                - preact
                - qwik
                - react
                - reactNative
                - rsc
                - solid
                - stencil
                - svelte
                - swift
                - template
                - vue
	--from=<format>, -f=<format>
		Specify input format. <format> can be one of:		
		- mitosis
		- builder
		- svelte
	--list, -l
		List available output formats.
	--config=<file>, -c=<file>
		Specify config file. Defaults to 'mitosis.config.js'.
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
`.trim();
};
