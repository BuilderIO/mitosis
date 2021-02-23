import { GluegunCommand } from 'gluegun'

import * as core from '@jsx-lite/core'

const command: GluegunCommand = {
  name: 'jsx-lite',
  run: async (toolbox) => {
    const { parameters, strings, filesystem, print } = toolbox
    const opts = parameters.options

    // Flags
    let to = opts.t ?? opts.to

    // Positional Args
    const path = parameters.first

    let buffer: string

    if (path === '-' || !path) {
      buffer = await readStdin()
    } else if (path) {
      if (filesystem.exists(path) !== 'file') {
        print.error(`"${path}" is not a file`)
        process.exit(1)
      }
      buffer = filesystem.read(path)
    } else {
      print.printHelp(toolbox)
      process.exit(1)
    }

    to = strings.pascalCase(to)

    const fn = core[`componentTo${to}`]

    if (!fn) {
      console.error(`no matching output target for "${to}"`)
      process.exit(1)
    }

    try {
      const json = core.parseJsx(buffer)

      const output = fn(json)
      console.log(output)
    } catch (e) {
      console.log(e)
    }
  },
}

module.exports = command

async function readStdin() {
  const chunks = []

  await new Promise((res) => process.stdin
    .on('data', (data) => {
      return chunks.push(data)
    })
    .on('end', () => {
      return res(true)
    })
  )

  return Buffer.concat(chunks).toString('utf-8')
}
