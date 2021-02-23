import { GluegunCommand } from 'gluegun'

import * as core from '@jsx-lite/core'

const command: GluegunCommand = {
  name: 'jsx-lite',
  run: async toolbox => {
    const { parameters, strings } = toolbox

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

    const buffer = Buffer.concat(chunks).toString('utf-8')

    if (typeof buffer !== 'string') {
      console.log('error: expected string')
      process.exit(1)
    }

    const opts = parameters.options

    let to = opts.t ?? opts.to

    to = strings.startCase(to)

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
