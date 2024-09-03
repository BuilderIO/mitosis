# Change Log

## 0.4.2

### Patch Changes

- c29e3ca: fix index in for loops between mitosis<->builder

## 0.4.1

### Patch Changes

- 1943604: state parser supports string literal keys
- d446881: Angular: Fix: `useObjectWrapper` logic to correctly handle spread and objects as arguments

## 0.4.0

### Minor Changes

- 7d8f4ff: Correct support bindings netween Builder and Mitosis, including useStore() hook

## 0.3.22

### Patch Changes

- f19a00f: Angular: Fix: `ViewContainerRef` import when importing for dynamic components

## 0.3.21

### Patch Changes

- 45de754: Angular: fix: add typed argument `changes: SimpleChanges` to `ngOnChanges` lifecycle hook
- 03f1f58: Angular: Fix: reactivity of `mergedInputs` (used in Dynamic components)
- 45de754: Angular: Fix: set initial value of `inputs` for `*ngComponentOutlet`to`{}`instead of`null`.

## 0.3.20

### Patch Changes

- 34bbd34: Fix: remove duplicated `Pressable` import in React Native

## 0.3.19

### Patch Changes

- 3f5fff1: Solid: stop mapping `for` to `htmlFor`
- 4c662df: Angular: Fix: state initialization sequence. Initialize states in `ngOnInit` first, followed by bindings that depend upon them.

## 0.3.18

### Patch Changes

- 952b3f5: - React Native generator: add support for generating React Native components (`Image`, `TouchableOpacity`, `Button`)

## 0.3.17

### Patch Changes

- 48f5481: fix: angular state initialization referencing other states or props

## 0.3.16

### Patch Changes

- 9abf0ac: Feat: `trackBy` for angular (can be used when the child used inside <For> has a `key` attribute in mitosis)

## 0.3.15

### Patch Changes

- 383f69f: feat: support more complex RN styling with twrnc

## 0.3.14

### Patch Changes

- 9a1d59b: Feat: Implement `onInit` hook for React and Solid, React now uses `useRef` calling `onInit` inline so we run the code before mount

## 0.3.13

### Patch Changes

- f86e2ec: Fix: Angular generator to run `onMount` and `onUpdate` hooks on the client side only and use `onInit` hook to run both on CSR and SSR

## 0.3.12

### Patch Changes

- 3a04558: bump `neotraverse` to fix webpack compat issues

## 0.3.11

### Patch Changes

- 59a92da: Replaces `traverse` dependency with the smaller `neotraverse`

## 0.3.10

### Patch Changes

- 8548feb: - Fix: [Solid] change style default to `style-tag` instead of `solid-styled-components`.
  - Fix: [Solid] remove `jsx` attribute from `<style>` tags in `style-tag`.
- f83b8f4: Adds two new styling options for the react-native generator: twrnc and native-wind

## 0.3.9

### Patch Changes

- 9705329: Fix: remove deprecated dependencies: `vue` and `@babel/plugin-proposal-class-properties`

## 0.3.8

### Patch Changes

- 495a937: add `fetchpriority` to `img` attributes in `jsx-runtime.d.ts`

## 0.3.7

### Patch Changes

- 413cdc2: fix: fix ref issue when transforming mitosis code into solid.js code

## 0.3.6

### Patch Changes

- 2c1b162: Support complex conditional cases

## 0.3.5

### Patch Changes

- 14a9a90: Feat: Angular generator: add `state` config with options `'class-properties'` (new, puts all template code in class properties) and `'inline-with-wrappers'` (existing default, wraps problematic JS expressions within template)

## 0.3.4

### Patch Changes

- 42287fe: chore: Fix typo in CSS property name of Builder compiled-away `Image` component.

## 0.3.3

### Patch Changes

- 027e9cc: Feature: Add metadata to component mappers in Builder generator

## 0.3.2

### Patch Changes

- 78f6a64: Misc: remove unused dependencies.

## 0.3.1

### Patch Changes

- c8b7883: Fix: parse slots into `MitosisNode` `slots` property.

## 0.3.0

### Minor Changes

- c249052: Feat: `visuallyIgnoreHostElement` option for angular to ignore angular components as elements in the DOM

## 0.2.10

### Patch Changes

- 90b3b02: Support for custom generators / targets

## 0.2.9

### Patch Changes

- a5d47bd: Fix: `events` to pass as inputs in dynamic components and pass properties too

## 0.2.8

### Patch Changes

- 18b9210: Feature: Vue: add `casing` option (defaults to `pascal`)

## 0.2.7

### Patch Changes

- 1dbdf32: add `includeMeta` option to Builder generator

## 0.2.6

### Patch Changes

- 389018d: support else statements in Angular generator with negation
- c7f2759: Fix: named slots generation for Vue, Qwik and Svelte.

## 0.2.5

### Patch Changes

- 2e56b76: Fix: Qwik methods using computed variables

## 0.2.4

### Patch Changes

- cee502f: feat: React Native: add support for `onClick` event handlers using `Pressable`

## 0.2.3

### Patch Changes

- 2867f44: fix: React generator: include `Fragment`s that only contain text content.

## 0.2.2

### Patch Changes

- 18e890c: fix: `processCodeBlockInTemplate` for compatibility with ngComponentOutlet and bindings

## 0.2.1

### Patch Changes

- 5ef7920: fix: apply svelte styling during ssr

## 0.2.0

### Minor Changes

- 0a39722: 💣 Breaking Change: Angular generator: all components are now exported as a `default` export instead of a named export.

### Patch Changes

- 0a39722: Fix: reduce false positive props found in `getProps`
- 0a39722: Feat: remove all explicit `.js` import extensions when `explicitImportFileExtension` config is `false`
- 0a39722: Feat: update angular generator to support dynamic components, context and more

## 0.1.7

### Patch Changes

- ba5e3b4: fix: solidjs `onUpdate` memoization

## 0.1.6

### Patch Changes

- 5738855: fix: solidjs `createMemo` for onUpdate deps, and for getters in state

## 0.1.5

### Patch Changes

- 6688702: Fix: React shorthand for boolean properties set to `true`

## 0.1.4

### Patch Changes

- 20efa15: feat: add slots property for nodes. add support for it in react generator.

## 0.1.3

### Patch Changes

- 9944a68: Fix: improve imports so mitosis can be built in browser easily

## 0.1.2

### Patch Changes

- 83b9bb8: fix: include styles for img elements in `compileAwayBuilderComponents` plugin

## 0.1.1

### Patch Changes

- 9d6e019: Fix: simplify React true bindings.
- 9d6e019: Fix: Builder->Mitosis single node slot

## 0.1.0

### Minor Changes

- 5dfd7cd: Breaking Change: remove vue2 and vue3 generators, keeping only the default vue generator (which generates vue3).

## 0.0.147

### Patch Changes

- 4e49454: Fix: Builder JSON to Mitosis JSON slot generation

## 0.0.146

### Patch Changes

- 35becd6: Fix: remove all empty text nodes in JSX parser
- f64d9b0: fix: Vue composition API watch deps
- 35becd6: fix: remove redundant {' '} in React generator

## 0.0.145

### Patch Changes

- 9720fb6: Fix: Svelte reactivity in onUpdate dependencies

## 0.0.144

### Patch Changes

- e4f0019: [fix] `preventDefault` in Qwik

## 0.0.142

### Patch Changes

- a4f8311: moved Vue \_classStringToObject logic behind an option

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.
