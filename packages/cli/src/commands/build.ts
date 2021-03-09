import path from 'path'
import { GluegunCommand } from 'gluegun'
import { getJsxLiteConfig } from '../helpers/get-jsx-lite-config'
import globby from 'globby'
import fs from 'fs-extra'
import {
  componentToAngular,
  componentToBuilder,
  componentToCustomElement,
  componentToHtml,
  componentToReact,
  componentToSolid,
  componentToSvelte,
  componentToVue,
  parseJsx
} from '@jsx-lite/core'

const command: GluegunCommand = {
  name: 'build',
  alias: 'b',
  run: async toolbox => {
    const config = {
      targets: [],
      dest: 'dist',
      files: 'src/*',
      ...getJsxLiteConfig()
    }
    const cwd = process.cwd()

    const tree = await globby(config.files)
    await Promise.all(
      config.targets.map(async target => {
        await Promise.all(
          tree.map(async filePath => {
            const outPath = path.resolve(process.cwd(), config.dest, filePath)
            if (
              filePath.endsWith('.lite.jsx') ||
              filePath.endsWith('.lite.tsx')
            ) {
              // TODO: nicer error handling
              const fileContents = await fs.readFile(filePath, 'utf8')
              const parsed = parseJsx(fileContents)
              let output
              switch (target) {
                case 'react':
                  output = componentToReact(parsed)
                  break
                case 'vue':
                  output = componentToVue(parsed)
                  break
                case 'angular':
                  output = componentToAngular(parsed)
                  break
                case 'svelte':
                  output = componentToSvelte(parsed)
                  break
                case 'builder':
                  output = componentToBuilder(parsed)
                  break
                case 'solid':
                  output = componentToSolid(parsed)
                  break
                case 'html':
                  output = componentToHtml(parsed)
                  break
                case 'webcomponents':
                  output = componentToCustomElement(parsed)
                  break
                default:
                  throw new Error(`Unknown output target: "${target}:`)
              }
              await fs.writeFile(outPath, output)
            } else {
              await fs.copyFile(process.cwd() + '/' + filePath, outPath)
            }
          })
        )
      })
    )
  }
}

module.exports = command
