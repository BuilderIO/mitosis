import * as babel from '@babel/core';
import * as rollup from 'rollup';
import rollupBabel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
const commonjs = require('@rollup/plugin-commonjs');
const babelPresetSolid = require('babel-preset-solid');
const babelPluginCommonjs = require('@babel/plugin-transform-modules-commonjs');
const styledJsx = require('solid-styled-jsx/babel');
const virtual = require('@rollup/plugin-virtual');
const babelPresetEnv = require('@babel/preset-env');

export function jsxToDom(jsx: string) {
  return babel.transform(jsx, {
    // plugins: [styledJsx],
    presets: [[babelPresetSolid, { hydratable: false }]],
  });
}

export function jsxToHydratableDom(jsx: string) {
  return babel.transform(jsx, {
    // plugins: [styledJsx],
    presets: [
      [
        babelPresetSolid,
        {
          hydratable: true,
        },
      ],
    ],
  });
}
export async function jsxToHydratableDomBundle(jsx: string, selector = '#app') {
  const bundle = await rollup.rollup({
    input: 'entry',
    plugins: [
      virtual({
        component: jsxToHydratableDom(jsx),
        entry: `
          import Component from 'component'
          import { hydrate, createComponent } from "solid-js/dom";
          hydrate(() => createComponent(Component, {}), document.querySelector("${selector}"));
        `,
      }),
      nodeResolve(),
      commonjs(),
      rollupBabel({
        presets: [
          babelPresetEnv,
          [
            babelPresetSolid,
            {
              generate: 'dom',
              hydratable: true,
            },
          ],
        ],
      }),
      // TODO: conf to turn on and off
      terser({
        compress: true,
      }),
    ],
  });
  const { output } = await bundle.generate({
    format: 'iife',
    file: 'bubndle.js',
  });

  return output[0].code;
}
export async function jsxToDomBundle(jsx: string, elementRef = '__BUILDER_TARGET_ELEMENT__') {
  const bundle = await rollup.rollup({
    input: 'entry',
    plugins: [
      virtual({
        component: jsxToDom(jsx),
        entry: `
          import Component from 'component'
          import { render, createComponent } from "solid-js/dom";
          console.log(1)
          render(() => createComponent(Component, {}), ${elementRef});
          console.log(2)
        `,
      }),
      nodeResolve(),
      commonjs(),
      rollupBabel({
        presets: [
          babelPresetEnv,
          [
            babelPresetSolid,
            {
              generate: 'dom',
            },
          ],
        ],
      }),
      // TODO: conf to turn on and off
      terser({
        compress: true,
      }),
    ],
  });
  const { output } = await bundle.generate({
    format: 'iife',
    file: 'bubndle.js',
  });

  return output[0].code;
}

export function jsxToSsrTemplate(jsx: string) {
  return babel.transform(jsx, {
    plugins: [styledJsx, babelPluginCommonjs],
    presets: [
      [
        babelPresetSolid,
        {
          generate: 'ssr',
          hydratable: true,
        },
      ],
    ],
  });
}
