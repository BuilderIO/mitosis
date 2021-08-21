import { MitosisComponent } from '@builder.io/mitosis'
import * as vueCompilerSfc from '@vue/compiler-sfc'
import dedent from 'dedent'
import { getSimpleId } from './get-simple-id'
import * as json5 from 'json5'
import * as esbuild from 'esbuild'
import { vue2Transform } from './compile-vue-v2-file'

export type CompileVueFileOptions = {
  distDir: string
  path: string
  contents: string
  mitosisComponent: MitosisComponent
  vueVersion?: 2 | 3
}

export type FileSpec = {
  path: string
  contents: string
}

async function toCjs(path: string, contents: string) {
  try {
    const output = await esbuild.transform(contents, {
      format: 'cjs',
      target: 'es6'
    })

    if (output.warnings.length) {
      console.warn(`Warnings found in file: ${path}`, output.warnings)
    }

    return output.code
  } catch (err) {
    console.error(`Failed to transform file ${path}`, contents)
    throw err
  }
}

export async function compileVueV2(options: CompileVueFileOptions) {
  const rootPath = `${options.distDir}/vue/${options.path.replace(
    /\.lite\.tsx$/,
    ''
  )}`

  const id = getSimpleId()
  const registerComponentHook = options.mitosisComponent.meta.registerComponent

  const fileName = rootPath.split('/').pop()

  // Via https://www.npmjs.com/package/@vue/compiler-sfc README
  const entry = dedent`      
    import script from './${fileName}_script'
    import './${fileName}_styles'

    ${
      !registerComponentHook
        ? ''
        : dedent`
          import { registerComponent } from '../functions/register-component'
          registerComponent(script, ${json5.stringify(registerComponentHook)})
        `
    }
    export default script
  `

  const { css, code } = vue2Transform(options.contents, id, {
    compileTemplate: true
  })

  let scriptContents = code
  // Remove .lite extensions from imports without having to load a slow parser like babel
  // E.g. convert `import { foo } from './block.lite';` -> `import { foo } from './block';`
  scriptContents = scriptContents.replace(/\.lite(['"];)/g, '$1')

  const cssContents: string = css[0]?.code || ''

  const cssCode = cssContents
    ? `
    const id = '${id}';
    if (typeof document !== 'undefined') {
      if (!document.getElementById(id)) {
        const style = document.createElement('style');
        style.id = id;
        style.innerHTML = \`${cssContents.replace(/`/g, '\\`')}\`;
        document.head.appendChild(style);
      }
    }
  `
    : ''

  return await Promise.all(
    [
      { path: `${rootPath}.original.vue`, contents: options.contents },
      { path: `${rootPath}.js`, contents: entry },
      { path: `${rootPath}_script.js`, contents: scriptContents },
      { path: `${rootPath}_styles.js`, contents: cssCode }
    ].map(async item =>
      item.path.endsWith('.js')
        ? {
            path: item.path,
            contents: await toCjs(item.path, item.contents)
          }
        : item
    )
  )

  return []
}

export async function compileVueFile(
  options: CompileVueFileOptions
): Promise<FileSpec[]> {
  if (options.vueVersion === 2) {
    return compileVueV2(options)
  }
  const rootPath = `${options.distDir}/vue/${options.path.replace(
    /\.lite\.tsx$/,
    ''
  )}`
  const parsed = vueCompilerSfc.parse(options.contents)
  const id = getSimpleId()

  if (parsed.errors.length) {
    console.warn(
      `Vue template compiler errors in file ${options.path}`,
      parsed.errors
    )
    console.warn(options.contents)
  }

  const compiledTemplate = vueCompilerSfc.compileTemplate({
    filename: options.path,
    source: parsed.descriptor.template.content,
    id,
    scoped: true
  })
  if (compiledTemplate.errors.length) {
    console.warn(
      `Vue template compiler errors in file ${options.path}`,
      compiledTemplate.errors
    )
    console.warn(options.contents)
  }
  const compiledScript = vueCompilerSfc.compileScript(parsed.descriptor, {
    id: id
  })

  const compiledStyles = await vueCompilerSfc.compileStyleAsync({
    id,
    filename: options.path,
    scoped: true,
    source: parsed.descriptor.styles[0]?.content || ''
  })
  if (compiledStyles.errors.length > 1) {
    console.warn(
      `Vue style compiler errors in file ${options.path}`,
      compiledTemplate.errors
    )
    console.warn(options.contents)
  }

  const registerComponentHook = options.mitosisComponent.meta.registerComponent

  const fileName = rootPath.split('/').pop()

  // Via https://www.npmjs.com/package/@vue/compiler-sfc README
  const entry = dedent`      
    import script from './${fileName}_script'
    import { render } from './${fileName}_render'
    import './${fileName}_styles.css'

    script.render = render

    ${
      !registerComponentHook
        ? ''
        : dedent`
          import { registerComponent } from '../functions/register-component'
          registerComponent(script, ${json5.stringify(registerComponentHook)})
        `
    }
    export default script
  `

  let scriptContents = compiledScript.content
  // Remove .lite extensions from imports without having to load a slow parser like babel
  // E.g. convert `import { foo } from './block.lite';` -> `import { foo } from './block';`
  scriptContents = scriptContents.replace(/\.lite(['"];)/g, '$1')

  return await Promise.all(
    [
      { path: `${rootPath}.original.vue`, contents: options.contents },
      { path: `${rootPath}.js`, contents: entry },
      { path: `${rootPath}_script.js`, contents: scriptContents },
      { path: `${rootPath}_render.js`, contents: compiledTemplate.code },
      { path: `${rootPath}_styles.css`, contents: compiledStyles.code }
    ].map(async item =>
      item.path.endsWith('.js')
        ? {
            path: item.path,
            contents: await toCjs(item.path, item.contents)
          }
        : item
    )
  )
}
