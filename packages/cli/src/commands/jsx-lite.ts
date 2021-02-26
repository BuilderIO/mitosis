import * as core from '@jsx-lite/core'
import { GluegunCommand } from 'gluegun'
import { Toolbox } from 'gluegun/build/types/domain/toolbox'
import { join } from 'path'
import { inspect } from 'util'

const command: GluegunCommand = {
  name: 'jsx-lite',
  run: async toolbox => {
    const { parameters, strings, filesystem, print } = toolbox
    const opts = parameters.options

    if (opts.l ?? opts.list ?? false) {
      return listTargets(toolbox)
    }

    // Flags and aliases
    let to = opts.t ?? opts.to
    let out = opts.o ?? opts.out
    let force = opts.force ?? false
    let dryRun = opts.dryRun ?? opts.n ?? false
    let outDir = opts.outDir

    // Positional Args
    const paths = parameters.array

    // Flag pre-processing
    to = strings.pascalCase(to)

    // Flag configuration state
    const isStdin = parameters.first === '-' || paths.length === 0

    // Input validations

    // Validate that "--to" is supported
    const transformFunc = core[`componentTo${to}`]
    if (!transformFunc) {
      console.error(`no matching output target for "${to}"`)
      process.exit(1)
    }

    if (out && paths.length > 1) {
      console.error(
        `--out doesn't support multiple input files, did you mean --outDir?`
      )
      process.exit(1)
    }

    async function* readFiles() {
      if (isStdin) {
        return { data: readStdin() }
      }
      for (const path of paths) {
        if (filesystem.exists(path) !== 'file') {
          print.error(`"${path}" is not a file`)
          process.exit(1)
        }
        const data = filesystem.read(path)
        yield { path, data }
      }
    }

    for await (const { data, path } of readFiles()) {
      let output: string

      if (outDir) {
        out = join(outDir, path)
      }

      // Validate that "--out" file doesn't already exist
      if (force === false && out && filesystem.exists(out) === 'file') {
        print.error(
          `${out} already exists. Use --force if you want to overwrite existing files.`
        )
        process.exit(1)
      }

      try {
        const json = core.parseJsx(data)
        output = transformFunc(json)
      } catch (e) {
        print.divider()
        print.info('Error:')
        print.error(e)
        print.divider()
        print.info(`Path: ${path}`)
        print.divider()
        print.info('Input text:')
        print.info(inspect(data, true, 10, true))
      }

      if (!out) {
        console.log(output)
        continue
      }

      print.info(out)

      if (!dryRun) {
        filesystem.write(out, output)
      }
    }
  }
}

module.exports = command

/**
 * List all targets (args to --to). This could be moved to it's own command at
 * some point depending on the desired API.
 */
function listTargets({ strings }: Toolbox) {
  for (const prop of Object.getOwnPropertyNames(core)) {
    const match = prop.match('^componentTo(.+)$')
    if (match) {
      const name = match[1]
      console.log(strings.camelCase(name))
    }
  }
  return
}

async function readStdin() {
  const chunks = []

  await new Promise(res =>
    process.stdin
      .on('data', data => {
        return chunks.push(data)
      })
      .on('end', () => {
        return res(true)
      })
  )

  return Buffer.concat(chunks).toString('utf-8')
}
