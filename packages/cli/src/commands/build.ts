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
            const outPath = path.resolve(cwd, config.dest, target, filePath)
            if (
              filePath.endsWith('.lite.jsx') ||
              filePath.endsWith('.lite.tsx')
            ) {
              // TODO: nicer error handling
              let extension = '.ts'
              const fileContents = await fs.readFile(filePath, 'utf8')
              const parsed = parseJsx(fileContents)
              let output
              switch (target) {
                case 'react':
                  output = componentToReact(parsed)
                  extension = '.tsx'
                  break
                case 'vue':
                  output = componentToVue(parsed)
                  extension = '.vue'
                  break
                case 'angular':
                  output = componentToAngular(parsed)
                  break
                case 'svelte':
                  output = componentToSvelte(parsed)
                  extension = '.svelte'
                  break
                case 'builder':
                  output = JSON.stringify(componentToBuilder(parsed), null, 2)
                  extension = '.json'
                  break
                case 'solid':
                  output = componentToSolid(parsed)
                  extension = '.tsx'
                  break
                case 'html':
                  output = componentToHtml(parsed)
                  extension = '.html'
                  break
                case 'webcomponents':
                  output = componentToCustomElement(parsed)
                  break
                default:
                  throw new Error(`Unknown output target: "${target}:`)
              }
              await fs.outputFile(
                outPath.replace(/\.lite\.(j|t)sx$/, extension),
                output
              )
            } else {
              await fs.copy(cwd + '/' + filePath, outPath)
            }
          })
        )
      })
    )
  }
}

module.exports = command
