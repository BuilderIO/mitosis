import path from 'path'
import chalk from 'chalk'
import { GluegunCommand } from 'gluegun'
import { getJsxLiteConfig } from '../helpers/get-jsx-lite-config'
import globby from 'globby'
import fs from 'fs-extra'
import {
  componentToAngular,
  componentToBuilder,
  componentToCustomElement,
  componentToHtml,
  componentToQoot,
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
                case 'qoot':
                  const info = componentToQoot(parsed)
                  for (const file of info.files) {
                    let path = file.path
                    if (config.mapFile) {
                      const info = await config.mapFile({
                        content: output,
                        target,
                        path: path
                      })
                      output = info.content
                      if (info.path !== filePath) {
                        path = info.path
                      } else {
                        path = outPath
                      }
                    } else {
                      path = outPath.replace(/\.lite\.(j|t)sx$/, extension)
                    }

                    console.info(chalk.green('Generated:', path))
                    await fs.outputFile(path, output)
                    return
                  }
                  break
                default:
                  throw new Error(`Unknown output target: "${target}:`)
              }

              let path = filePath
              if (config.mapFile) {
                const info = await config.mapFile({
                  content: output,
                  target,
                  path: filePath
                })
                output = info.content
                if (info.path !== filePath) {
                  path = info.path
                } else {
                  path = outPath
                }
              } else {
                path = outPath.replace(/\.lite\.(j|t)sx$/, extension)
              }

              console.info(chalk.green('Generated:', path))
              await fs.outputFile(path, output)
            } else {
              let path = filePath
              let output = await fs.readFile(filePath, 'utf8')
              if (config.mapFile) {
                const info = await config.mapFile({
                  content: output,
                  target,
                  path: filePath
                })
                output = info.content
                if (info.path !== filePath) {
                  path = info.path
                } else {
                  path = outPath
                }
                await fs.outputFile(path, output)
                return
              }

              console.info(chalk.green('Generated:', path))
              await fs.copy(cwd + '/' + filePath, outPath)
            }
          })
        )
      })
    )
  }
}

module.exports = command
