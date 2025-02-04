import { omit } from 'lodash';
import preprocessor from 'svelte-preprocess';
import { parse, preprocess } from 'svelte/compiler';

import { parseCss } from './css';
import { postProcess } from './helpers/post-process';
import { parseHtml } from './html';
import { parseInstance } from './instance';
import { parseModule } from './module';
import { collectTypes, isTypeScriptComponent } from './typescript';

import type { Ast } from 'svelte/types/compiler/interfaces';
import type { MitosisComponent } from '../../types/mitosis-component';
import { builderContentToMitosisComponent } from '../builder/builder';
import type { SveltosisComponent } from './types';

function mapAstToMitosisJson(
  ast: Ast,
  name: string,
  string_ = '',
  usesTypescript = false,
): MitosisComponent {
  const json: SveltosisComponent = {
    '@type': '@builder.io/mitosis/component',
    inputs: [],
    state: {},
    props: {},
    refs: {},
    hooks: {
      onMount: [],
      onEvent: [],
    },
    imports: [],
    children: [],
    context: { get: {}, set: {} },
    subComponents: [],
    meta: {},
    name,
    style: undefined,
  };

  parseModule(ast, json);
  parseInstance(ast, json);
  parseHtml(ast, json);
  parseCss(ast, json);

  postProcess(json);

  if (usesTypescript) {
    collectTypes(string_, json);
  }

  return omit(json, ['props']);
}

export const parseSvelte = async function (
  string_: string,
  path = 'MyComponent.svelte',
): Promise<MitosisComponent> {
  const usesTypescript = isTypeScriptComponent(string_);

  const processedString = await preprocess(
    string_,
    [
      preprocessor({
        typescript: usesTypescript ? { tsconfigFile: false } : false,
      }),
    ],
    {
      filename: path.split('/').pop(),
    },
  );

  const ast = parse(processedString.code);
  const componentName = path.split('/').pop()?.split('.')[0] ?? 'MyComponent';
  return mapAstToMitosisJson(ast, componentName, string_, usesTypescript);
};

export const parseBuilderSyntax = async function (
  string_: string,
  path = 'MyComponent.svelte',
): Promise<MitosisComponent> {
  const component = builderContentToMitosisComponent(JSON.parse(string_));

  return component;
};
