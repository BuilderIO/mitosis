# Change Log

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
