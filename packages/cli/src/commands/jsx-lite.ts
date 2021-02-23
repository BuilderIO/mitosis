import { GluegunCommand } from 'gluegun'

import * as core from '@jsx-lite/core'

const command: GluegunCommand = {
  name: 'jsx-lite',
  run: async toolbox => {
    const { parameters, strings, filesystem, print } = toolbox

    let buffer: string

    const path = parameters.first

    if (path === '-' || !path) {
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

      buffer = Buffer.concat(chunks).toString('utf-8')
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

    const opts = parameters.options

    let to = opts.t ?? opts.to

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
  }
}

module.exports = command
