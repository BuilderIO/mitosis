/**
 * This file is modified from Vue 2's rollup plugin
 * https://github.com/vuejs/rollup-plugin-vue/blob/2.2/src/vueTransform.js
 */

import deIndent from 'de-indent'
import htmlMinifier from 'html-minifier'
import parse5, { AST } from 'parse5'
import validateTemplate from 'vue-template-validator'
import transpileVueTemplate from 'vue-template-es2015-compiler'
import { relative } from 'path'
import MagicString from 'magic-string'
import * as esbuild from 'esbuild'
import * as babel from '@babel/core'
const tsPreset = require('@babel/preset-typescript')

function getNodeAttrs(node) {
  if (node.attrs) {
    const attributes = {}

    for (const attr of node.attrs) {
      attributes[attr.name] = attr.value
    }

    return attributes
  }

  return {}
}

/**
 * Pad content with empty lines to get correct line number in errors.
 */
function padContent(content) {
  return content
    .split(/\r?\n/g)
    .map(() => '')
    .join('\n')
}

/**
 * Wrap code inside a with statement inside a function
 * This is necessary for Vue 2 template compilation
 */
function wrapRenderFunction(code) {
  return `function(){${code}}`
}

function injectRender(script, render, lang, options) {
  if (['js', 'babel'].indexOf(lang.toLowerCase()) > -1) {
    const matches = /(export default[^{]*\{)/g.exec(script)
    if (matches) {
      let renderScript =
        'module.exports={' +
        `render: ${wrapRenderFunction(render.render)},` +
        'staticRenderFns: [' +
        `${render.staticRenderFns.map(wrapRenderFunction).join(',')}],}`

      if (options.stripWith !== false) {
        try {
          renderScript = transpileVueTemplate(renderScript, options.vue)
        } catch (e) {
          console.error(e, 'in:', renderScript)
        }
      }

      const result = script
        .split(matches[1])
        .join(
          renderScript
            .replace('module.exports={', 'export default {')
            .replace(/\}$/, '')
        )

      return result
    }
  } else if (options.inject) {
    return options.inject(script, render, lang, options)
  }
  throw new Error(
    '[rollup-plugin-vue] could not find place to inject template in script.'
  )
}

/**
 * @param script
 * @param template
 * @param lang
 * @returns {string}
 */
function injectTemplate(script, template, lang, options) {
  if (template === undefined) return script

  if (['js', 'babel'].indexOf(lang.toLowerCase()) > -1) {
    const matches = /(export default[^{]*\{)/g.exec(script)
    if (matches) {
      return script
        .split(matches[1])
        .join(`${matches[1]} template: ${JSON.stringify(template)},`)
    }
  } else if (options.inject) {
    return options.inject(script, template, lang, options)
  }

  throw new Error(
    '[rollup-plugin-vue] could not find place to inject template in script.'
  )
}

/**
 * Compile template: DeIndent and minify html.
 */
function processTemplate(source, id, content, options) {
  if (source === undefined) return undefined

  const { code } = source
  const template = deIndent(code)
  const ignore = [
    'Found camelCase attribute:',
    'Tag <slot> cannot appear inside <table> due to HTML content restrictions.',
  ]

  const warnings = validateTemplate(code, content)
  if (warnings) {
    const relativePath = relative(process.cwd(), id)
    warnings
      .filter((warning) => {
        return (
          options.compileTemplate &&
          ignore.findIndex((i) => warning.indexOf(i) > -1) < 0
        )
      })
      .forEach((msg) => {
        console.warn(`\n Warning in ${relativePath}:\n ${msg}`)
      })
  }

  return htmlMinifier.minify(template, options.htmlMinifier)
}

async function replaceAsync(
  str: string,
  regex: RegExp,
  asyncFn: (substring: string, ...args: any[]) => Promise<string>
) {
  const promises = []
  str.replace(regex, (match, ...args): any => {
    const promise = asyncFn(match, ...args)
    promises.push(promise)
  })
  const data = await Promise.all(promises)
  return str.replace(regex, () => data.shift())
}

const CUSTOM_BABEL_OPTIONAL = true

export const babelTransformExpression = <VisitorContextType = any>(
  code: string,
  visitor: any
) => {
  return babel
    .transform(`let _ = ${code}`, {
      sourceFileName: 'file.tsx',
      configFile: false,
      babelrc: false,
      presets: [[tsPreset, { allExtensions: true }]],
      plugins: [() => ({ visitor })],
    })
    .code!.trim()
    .replace(/^(let|var)\s+_\s*=\s*/, '')
    .replace(/;$/, '')
}

export async function transpileBindingExpression(code: string) {
  if (!code.match(/\?\./)) {
    return code
  }

  if (CUSTOM_BABEL_OPTIONAL) {
    const { types } = babel
    return babelTransformExpression(code, {
      // Replace foo?.bar -> foo && foo.barF
      OptionalMemberExpression(
        path: babel.NodePath<babel.types.OptionalMemberExpression>
      ) {
        path.replaceWith(
          types.parenthesizedExpression(
            types.logicalExpression(
              '&&',
              path.node.object,
              types.memberExpression(path.node.object, path.node.property)
            )
          )
        )
      },
    })
  }

  return (
    await esbuild
      .transform(`(() => ${code})()`, {
        target: 'es5',
      })
      .catch((err) => {
        console.warn(
          'Could not esbuild transform property binding expression:',
          code
        )
        return { code }
      })
  ).code
    .trim()
    .replace(/;$/, '')
    .replace(/"/g, "'")
}

async function processScript(source, id, content, options, nodes) {
  const startTemplate = nodes.template[0]
  if (startTemplate) {
    startTemplate.code = startTemplate.code
  }

  const template = processTemplate(startTemplate, id, content, options)

  const lang = source.attrs.lang || 'js'

  const script = deIndent(
    padContent(content.slice(0, content.indexOf(source.code))) + source.code
  )
  const map = new MagicString(script).generateMap({ hires: true })

  if (template && options.compileTemplate) {
    // Transpile out the ?. operator which Vue 2 templates don't support
    // Special match for v-for as it doesn't use normal JS syntax at the
    // start of it
    let final = await replaceAsync(
      template,
      /v-for="(.+?) in ([^"]+?)"/g,
      async (_match, group1, group2) =>
        `v-for="${group1} in ${await transpileBindingExpression(group2)}"`
    )

    // Transpile out the ?. operator which Vue 2 templates don't support
    final = await replaceAsync(
      final,
      /"([^"]*?\?\.[^"]*?)"/g,
      async (_match, group) => `"${await transpileBindingExpression(group)}"`
    )

    const render = require('vue-template-compiler').compile(final)

    return { map, code: injectRender(script, render, lang, options) }
  } else if (template) {
    return { map, code: injectTemplate(script, template, lang, options) }
  } else {
    return { map, code: script }
  }
}

function processStyle(styles, id) {
  return styles.map((style) => ({
    id,
    code: deIndent(style.code).trim(),
    lang: style.attrs.lang || 'css',
  }))
}

function parseTemplate(code) {
  const fragment = parse5.parseFragment(code, {
    locationInfo: true,
  }) as any

  const nodes = {
    template: [],
    script: [],
    style: [],
  }

  for (let i = fragment.childNodes.length - 1; i >= 0; i -= 1) {
    const name = fragment.childNodes[i].nodeName
    if (!(name in nodes)) {
      continue
    }

    const start = fragment.childNodes[i].__location.startTag.endOffset
    const end = fragment.childNodes[i].__location.endTag.startOffset

    nodes[name].push({
      node: fragment.childNodes[i],
      code: code.substr(start, end - start),
      attrs: getNodeAttrs(fragment.childNodes[i]),
    })
  }

  if (nodes.script.length === 0) {
    nodes.script.push({
      node: null,
      code: 'export default {\n}',
      attrs: {},
    })
  }

  return nodes
}

export async function vue2Transform(code, id, options) {
  const nodes = parseTemplate(code)
  const js = await processScript(nodes.script[0], id, code, options, nodes)
  const css = processStyle(nodes.style, id)

  const isProduction = process.env.NODE_ENV === 'production'
  const isWithStripped = options.stripWith !== false

  if (!isProduction && !isWithStripped) {
    js.code = js.code + '\nmodule.exports.render._withStripped = true'
  }

  if (options.styleToImports === true) {
    const style = css
      .map(
        (s, i) =>
          'import ' + JSON.stringify(`${id}.${i}.vue.component.${s.lang}`) + ';'
      )
      .join(' ')

    return { css, code: style + js.code, map: js.map }
  }

  return { css, code: js.code, map: js.map }
}
