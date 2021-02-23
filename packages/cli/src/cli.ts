import { build } from 'gluegun'
import { Toolbox } from 'gluegun/build/types/domain/toolbox'

const help = (toolbox: Toolbox) =>
  toolbox.print.info(
    `
jsx-lite command line component processor [version ${toolbox.meta.version()}]

USAGE
	jsx-lite --to=<format> [input-file]
	jsx-lite -t=<format> [input-file]

	If no [input-file] is is specified or when [input-file] is "-", input
	is read from standard input.

EXAMPLES
	jsx-lite -t react component.tsx
	jsx-lite -t react < component.tsx
	cat component.tsx | jsx-lite -t html -

OPTIONS
	--to=<format>,	-t=<format>
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
      'package-manager',
    ])
    .create()
  // and run it
  const toolbox = await cli.run(argv)

  // send it back (for testing, mostly)
  return toolbox
}

module.exports = { run }
