import * as babel from '@babel/core';
import * as rollup from 'rollup';
import rollupBabel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
const commonjs = require('@rollup/plugin-commonjs');
const babelPluginCommonjs = require('@babel/plugin-transform-modules-commonjs');
const virtual = require('@rollup/plugin-virtual');
const babelPresetEnv = require('@babel/preset-env');
const babelPresetReact = require('@babel/preset-react');
const replace = require('@rollup/plugin-replace');
const emotionCssProp = require('@emotion/babel-preset-css-prop');

type JsxToCompiledReactOptions = {
  commonjs?: boolean;
};
export function jsxToCompiledReact(jsx: string, options: JsxToCompiledReactOptions = {}) {
  return babel.transform(jsx, {
    presets: [
      options.commonjs && { plugins: [babelPluginCommonjs.default] },
      [
        babelPresetReact,
        {
          /* options */
        },
      ],
      emotionCssProp,
    ].filter(Boolean),
    plugins: [options.commonjs && babelPluginCommonjs.default].filter(Boolean),
  });
}

type JsxToHydratableReactBundleOptions = {
  selector?: string;
};

export async function jsxToHydratableReactBundle(
  jsx: string,
  options: JsxToHydratableReactBundleOptions = {}
) {
  const selector = options.selector || '#app';
  const usePreact = false;
  const reactImport = usePreact ? 'preact/compat' : 'react';
  const reactDomImport = usePreact ? 'preact/compat' : 'react-dom';

  const bundle = await rollup.rollup({
    input: 'entry',

    plugins: [
      virtual({
        component: `
          import { Image, onChange, BuilderPage } from '@builder.io/react';
          import React from '${reactImport}';

          ${jsxToCompiledReact(jsx)!.code}
        `,
        entry: `
          import Component from 'component'
          import { hydrate } from "${reactDomImport}";
          import { createElement } from "${reactImport}";
          hydrate(createElement(Component), document.querySelector("${selector}"));
        `,
      }),
      nodeResolve(),
      commonjs(),
      replace({
        // alternatively, one could pass process.env.NODE_ENV or 'development` to stringify
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      // rollupBabel({
      //   plugins: [babelPluginCommonjs],
      //   presets: [
      //     [babelPresetEnv, { modules: false }],
      //     [babelPresetReact, {}],
      //   ],
      // }),
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
