# Change Log

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
