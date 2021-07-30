import {
  componentToReact,
  componentToReactNative,
  componentToSolid,
  componentToVue,
  contextToReact,
  MitosisComponent,
  parseContext,
  parseJsx
} from '@builder.io/mitosis'
import { outputFile, readFile, remove } from 'fs-extra'
import { compileVueFile } from './helpers/compile-vue-file'
import { transpile } from './helpers/transpile'
import dedent from 'dedent'
import * as json5 from 'json5'
import { transpileSolidFile } from './helpers/transpile-solid-file'
import glob from 'fast-glob'
import { MitosisConfig, Target } from '../types/mitosis-config'
import { kebabCase, upperFirst, camelCase, last } from 'lodash'
import micromatch from 'micromatch'

const cwd = process.cwd()

export async function build(config?: MitosisConfig) {
  const options: MitosisConfig = {
    targets: [],
    dest: 'output',
    files: 'src/*',
    overridesDir: 'overrides',
    ...config
  }

  await clean(options)

  const tsLiteFiles = await Promise.all(
    micromatch(await glob(options.files, { cwd }), `**/*.lite.tsx`).map(
      async path => {
        try {
          const parsed = parseJsx(await readFile(path, 'utf8'), {
            jsonHookNames: ['registerComponent']
          })
          return {
            path,
            mitosisJson: parsed
          }
        } catch (err) {
          console.error('Could not parse file:', path)
          throw err
        }
      }
    )
  )

  await Promise.all(
    options.targets.map(async target => {
      const jsFiles = await buildTsFiles(target)
      await Promise.all([
        outputTsFiles(target, jsFiles, options),
        outputTsxLiteFiles(target, tsLiteFiles, options)
      ])
      await outputOverrides(target, options)
    })
  )
}

async function clean(options: MitosisConfig) {
  const files = await glob(`${options.dest}/*/${options.files}`)
  await Promise.all(
    files.map(async file => {
      await remove(file)
    })
  )
}

async function outputOverrides(target: Target, options: MitosisConfig) {
  const kebabTarget = kebabCase(target)
  const files = await glob([
    `${options.overridesDir}/${kebabTarget}/**/*`,
    `!${options.overridesDir}/${kebabTarget}/node_modules/**/*`
  ])
  await Promise.all(
    files.map(async file => {
      let contents = await readFile(file, 'utf8')

      const esbuildTranspile = file.match(/\.tsx?$/)
      if (esbuildTranspile) {
        contents = await transpile({ path: file, target })
      }

      await outputFile(
        file
          .replace(`${options.overridesDir}/`, `${options.dest}/`)
          .replace(/\.tsx?$/, '.js'),
        contents
      )
    })
  )
}

async function outputTsxLiteFiles(
  target: Target,
  files: { path: string; mitosisJson: MitosisComponent }[],
  options: MitosisConfig
) {
  const kebabTarget = kebabCase(target)
  const output = files.map(async ({ path, mitosisJson }) => {
    let transpiled =
      target === 'reactNative'
        ? componentToReactNative(mitosisJson, {
            stateType: 'useState'
          })
        : target === 'vue'
        ? componentToVue(mitosisJson)
        : target === 'react'
        ? componentToReact(mitosisJson)
        : target === 'solid'
        ? componentToSolid(mitosisJson)
        : (null as never)

    const original = transpiled

    const solidTranspile = target === 'solid'
    if (solidTranspile) {
      transpiled = await transpileSolidFile({
        contents: transpiled,
        path,
        mitosisComponent: mitosisJson
      })
    }

    const esbuildTranspile = target === 'reactNative' || target === 'react'
    if (esbuildTranspile) {
      transpiled = await transpile({ path, content: transpiled, target })
      const registerComponentHook = mitosisJson.meta.registerComponent
      if (registerComponentHook) {
        transpiled = dedent`
          import { registerComponent } from '../functions/register-component';

          ${transpiled}

          registerComponent(${mitosisJson.name}, ${json5.stringify(
          registerComponentHook
        )});
        `
      }
    }
    const vueCompile = target === 'vue'
    if (vueCompile) {
      const files = await compileVueFile({
        distDir: options.dest,
        contents: transpiled,
        path,
        mitosisComponent: mitosisJson
      })
      await Promise.all(files.map(file => outputFile(file.path, file.contents)))
    } else {
      return await Promise.all([
        outputFile(
          `${options.dest}/${kebabTarget}/${path.replace(
            /\.lite\.tsx$/,
            '.js'
          )}`,
          transpiled
        ),
        outputFile(
          `${options.dest}/${kebabTarget}/${path.replace(
            /\.original\.jsx$/,
            '.js'
          )}`,
          original
        )
      ])
    }
  })
  await Promise.all(output)
}

async function outputTsFiles(
  target: Target,
  files: { path: string; output: string }[],
  options: MitosisConfig
) {
  const kebabTarget = kebabCase(target)
  const output = files.map(({ path, output }) => {
    return outputFile(
      `${options.dest}/${kebabTarget}/${path.replace(/\.tsx?$/, '.js')}`,
      output
    )
  })
  await Promise.all(output)
}

async function buildTsFiles(target: Target, options?: MitosisConfig) {
  const tsFiles = await glob(`src/**/*.ts`, {
    cwd: cwd
  })

  return await Promise.all(
    tsFiles.map(async path => {
      let output: string
      if (path.endsWith('.context.lite.ts')) {
        // 'foo/bar/my-thing.context.ts' -> 'MyThing'
        const name = upperFirst(camelCase(last(path.split('/')).split('.')[0]))
        const context = parseContext(await readFile(path, 'utf8'), {
          name: name
        })
        if (!context) {
          console.warn('Could not parse context from file', path)
        } else {
          output = contextToReact(context)
        }
      }
      output = await transpile({ path, target, content: output })

      return {
        path,
        output
      }
    })
  )
}

if (require.main === module) {
  build().catch(console.error)
}
