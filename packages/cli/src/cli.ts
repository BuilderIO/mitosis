import { build } from 'gluegun'
import { Toolbox } from 'gluegun/build/types/domain/toolbox'

const help = (toolbox: Toolbox) =>
  toolbox.print.info(
    `
jsx-lite command line component processor [version ${toolbox.meta.version()}]

USAGE
	jsx-lite --to=<format> [options] [files]
	jsx-lite -t=<format> [options] [files]

	If no [input-files] are specified or when [files] is "-", input
	is read from standard input.

EXAMPLES
	jsx-lite -t react component.tsx
	jsx-lite -t react < component.tsx
	cat component.tsx | jsx-lite -t html -
	jsx-lite -t react --out-dir build -- src/**/*.tsx

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
		- jsxLite
		- builder
		- swift
		- svelte
		- liquid
		- angular
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

		The command "jsx-lite -t react --out-dir lib -- src/*.tsx" would
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
`.trim()
  )

/**
 * Create the cli and kick it off
 */
async function run(argv: any) {
  // create a CLI runtime
  const cli = build()
    .brand('jsx-lite')
    .src(__dirname)
    .plugins('./node_modules', { matching: 'jsx-lite-*', hidden: true })
    .help(help) // provides default for help, h, --help, -h
    .version() // provides default for version, v, --version, -v
    // enable the following method if you'd like to skip loading one of these core extensions
    // this can improve performance if they're not necessary for your project:
    .exclude([
      // 'meta',
      // 'print',
      // 'filesystem',
      // 'semver',
      // 'system',
      'http',
      'template',
      'patching',
      'package-manager'
    ])
    .create()
  // and run it
  const toolbox = await cli.run(argv)

  // send it back (for testing, mostly)
  return toolbox
}

module.exports = { run }
