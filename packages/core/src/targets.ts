import { componentToAlpine as alpine } from './generators/alpine';
import { componentToAngular as angular } from './generators/angular';
import { componentToBuilder } from './generators/builder';
import {
  componentToCustomElement as customElement,
  componentToCustomElement as webcomponent,
  componentToHtml as html,
} from './generators/html';
import { componentToLiquid as liquid } from './generators/liquid';
import { componentToLit as lit } from './generators/lit';
import { componentToMarko as marko } from './generators/marko';
import { componentToMitosis as mitosis } from './generators/mitosis';
import { componentToQwik as qwik } from './generators/qwik';
import { componentToPreact as preact, componentToReact as react } from './generators/react';
import { componentToReactNative as reactNative } from './generators/react-native';
import { componentToRsc as rsc } from './generators/rsc';
import { componentToSolid as solid } from './generators/solid';
import { componentToStencil as stencil } from './generators/stencil';
import { componentToSvelte as svelte } from './generators/svelte';
import { componentToSwift as swift } from './generators/swift-ui';
import { componentToTaro as taro } from './generators/taro';
import { componentToTemplate as template } from './generators/template';
import { componentToVue2, componentToVue3 } from './generators/vue';

export const builder = componentToBuilder;

export const targets = {
  alpine,
  angular,
  customElement,
  html,
  mitosis,
  liquid,
  react,
  reactNative,
  solid,
  svelte,
  swift,
  template,
  webcomponent,
  vue: componentToVue3,
  vue2: componentToVue2,
  vue3: componentToVue3,
  stencil,
  qwik,
  marko,
  preact,
  lit,
  rsc,
  taro,
} as const;

export type Targets = keyof typeof targets;
