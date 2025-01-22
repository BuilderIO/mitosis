# Change Log

## 0.5.29

### Patch Changes

- 1d74164: adds support to Builder parser and generator for inline localized content

## 0.5.28

### Patch Changes

- b63279f: [angular, stencil]: Add `attributePassing` to enable passing attributes like `data-*`, `aria-*` or `class` to correct child.

  There is a wired behaviour for Angular and Stencil (without shadow DOM), where attributes are rendered on parent elements like this:

  **Input**

  ```angular2html
  <!-- Angular -->
  <my-component class="cool" data-nice="true" aria-label="wow"></my-component>
  ```

  **Output**

  ```html
  <!-- DOM -->
  <my-component class="cool" data-nice="true" aria-label="wow">
    <button class="my-component">My Component</button>
  </my-component>
  ```

  In general, we want to pass those attributes down to the rendered child, like this:

  ```html
  <!-- DOM -->
  <my-component>
    <button class="my-component cool" data-nice="true" aria-label="wow">My Component</button>
  </my-component>
  ```

  We provide 2 ways to enable this attribute passing:

  **Metadata**

  ```tsx
  // my-component.lite.tsx
  useMetadata({
    attributePassing: {
      enabled: true,
      // customRef: "_myRef";
    },
  });
  ```

  **Config**

  ```js
  // mitosis.config.cjs
  module.exports = {
    // ... other settings
    attributePassing: {
      enabled: true,
      // customRef: "_myRef";
    },
  };
  ```

  If you enable the `attributePassing` we add a new `ref` to the root element named `_root` to interact with the DOM element. If you wish to control the name of the ref, because you already have a `useRef` on your root element, you can use the `customRef` property to select it.

## 0.5.27

### Patch Changes

- 92ad2c6: Misc: stop using `fs-extra-promise` dependency

## 0.5.26

### Patch Changes

- 57bdffe: [angular] fix issue with definite assignment (!) for props with defaultProps

## 0.5.25

### Patch Changes

- af43f50: [All] Refactored `useMetadata` hook to enable import resolution instead of simple `JSON5` parsing.

  You could use a normal JS `Object` and import it inside your `*.lite.tsx` file like this:

  ```ts
  // data.ts

  export const myMetadata: Record<string, string | number> = {
    a: 'b',
    c: 1,
  };
  ```

  ```tsx
  // my-button.lite.tsx
  import { useMetadata } from '@builder.io/mitosis';
  import { myMetadata } from './data.ts';

  useMetadata({
    x: 'y',
    my: myMetadata,
  });

  export default function MyButton() {
    return <button></button>;
  }
  ```

- 20ad8dc: [angular]: Fix issue with events forced to become `toLowerCase()`.

  Based on [choosing-event-names](https://angular.dev/guide/components/outputs#choosing-event-names) custom events are camelCase.
  [DOM events](https://www.w3schools.com/jsref/dom_obj_event.asp) are always lower-cased for Angular components.

  Checkout [event-handlers.ts](https://github.com/BuilderIO/mitosis/blob/main/packages/core/src/helpers/event-handlers.ts) for a list of all events that are automatically lower-cased. Everything else will be treated as a custom event and therefore camelCased.

  If you need some other event to be lower-cased you can use `useMetadata.angular.nativeEvents`:

  ```tsx
  import { useMetadata } from '@builder.io/mitosis';

  useMetadata({
    angular: {
      nativeEvents: ['onNativeEvent'],
    },
  });

  export default function MyComponent(props) {
    return (
      <div>
        <input onNativeEvent={(event) => console.log(event)} />
        Hello!
      </div>
    );
  }
  ```

## 0.5.24

### Patch Changes

- 995eb95: [All] Add new `explicitBuildFileExtensions` to `MitosisConfig`. This allows users to manage the extension of some components explicitly. This is very useful for plugins:

  ```ts
    /**
     * Can be used for cli builds. Preserves explicit filename extensions when regex matches, e.g.:
     * {
     *   explicitBuildFileExtension: {
     *     ".ts":/*.figma.lite.tsx/g,
     *     ".md":/*.docs.lite.tsx/g
     *   }
     * }
     */
    explicitBuildFileExtensions?: Record<string, RegExp>;

  ```

  [All] Add new `pluginData` object to `MitosisComponent` which will be filled during build via cli. Users get some additional information to use them for plugins:

  ```ts
    /**
     * This data is filled inside cli to provide more data for plugins
     */
  pluginData?: {
      target?: Target;
      path?: string;
      outputDir?: string;
      outputFilePath?: string;
  };
  ```

- 341f281: [All] add additional `build` type for [Plugin](https://github.com/BuilderIO/mitosis/blob/main/packages/core/src/types/plugins.ts) to allow users to run plugins before/after cli build process
- b387d21: [React, Angular] fix: issue with `state` inside `key` attribute in `Fragment`.

  Example:

  `<Fragment key={state.xxx + "abc"}...` was generated in React with `state.xxx` and in Angular without `this.`.

## 0.5.23

### Patch Changes

- 772d6f5: Angular selector support in code generation

## 0.5.22

### Patch Changes

- d52fe59: [Builder]: bound media query styles are not converted to strings

## 0.5.21

### Patch Changes

- 73a55a3: [Builder]: Do not set width binding on Column if value is undefined
- 10a168d: [Builder] preserve bound media query styles when converting to Mitosis

## 0.5.20

### Patch Changes

- 7ae4a01: Fix: Solid fragments rendering by removing all props

## 0.5.19

### Patch Changes

- e9cfef0: [All] Fix: scope renaming of state methods to not include shadow variables
  [Angular]: Update `state.*` -> `this.*` transform to new AST transform approach

## 0.5.18

### Patch Changes

- 697c307: do not crash with comment before method in store
- 6f6db62: [React] Refactor how `react` handles mitosis `Fragment`.

  Using `import { Fragment } from '@builder.io/mitosis';
` and `<Fragment key={option}>` in mitosis, generates an empty fragment in `react` target: `<>`. With this improvement the generated output will be `<React.Fragment key={`key-${option}`}>`. This will help to avoid issues with same keys e.g. inside for loops.

- e90df53: [Solid] Fix: handle Fragment with `key` prop

## 0.5.17

### Patch Changes

- e430a68: [CICD] regenerate test snapshots on fail to download them into local environment
- b5ddfa3: [Vue] fix: ref wasn't imported when using `useRef` hook without using `useState`

  [Vue] fix: Composition api always use `ref()` wihtout any class -> we don't need this., but we always use `.value`

  [Vue] fix: `ref` could be `null` for `useRef` see: https://vuejs.org/guide/essentials/template-refs.html#accessing-the-refs

  [All] fix: replace `this.` expression in `useState` with `state.` to resolve correct `stripStateAndPropsRefs()` function inside all generators

- 068be0d: [Angular, Lit, Stencil, HTML] fix: remove mapping onChange to input event

## 0.5.16

### Patch Changes

- 3ab462a: [Stencil] feat: add e2e test for stencil

## 0.5.15

### Patch Changes

- a0ad5ab: [Builder]: Fix: use scope.rename to rename identifiers in For loop

## 0.5.14

### Patch Changes

- 39af4d6: [Builder] Fix: do not rename vars within For that are shadowing the loop's index

## 0.5.13

### Patch Changes

- c7d2f8c: [All] fix: support async event handlers

## 0.5.12

### Patch Changes

- 5e2cf3c: respect async with anonymous arrow function in state

## 0.5.11

### Patch Changes

- db9dbf9: [All] fix: parsers/generate for loops

## 0.5.10

### Patch Changes

- 499b4b7: [Mitosis] feat: add returnArray option

## 0.5.9

### Patch Changes

- 8c2be87: Fix multi line bindings from Mitosis to Builder

## 0.5.8

### Patch Changes

- 8d823a1: [Builder] Fix: support Show.else property

## 0.5.7

### Patch Changes

- 7a099d2: [Builder,Mitosis] Feature: add Slots support.

## 0.5.6

### Patch Changes

- 0aa642a: [All]: Fix: accessing `useState()` getter/setter within `useTarget()`

## 0.5.5

### Patch Changes

- 56c6347: [Mitosis] Feature: add `nativeConditionals` and `nativeLoops` for `legacy` mode

## 0.5.4

### Patch Changes

- d13e693: [LIT] Bug: Passing wrong object for transforming ref(Element ref) result in breakage

## 0.5.3

### Patch Changes

- 82c79fd: [React] Fix: Inline `onInit` hook when generating RSC components.

## 0.5.2

### Patch Changes

- dad8e2f: Fix: do not consolidate class and className for Mitosis components

## 0.5.1

### Patch Changes

- dbd5a50: [React-Native] Feature: add `sanitizeReactNative` flag responsible for sanitizing styles. Defaults to `false`.

## 0.5.0

### Minor Changes

- 4171a19: [Stencil] feat: refactor stencil generator to work with stencil v4

  [Stencil,Angular] fix: issue with nested components for frameworks (stencil, angular) with custom elements via [`getChildComponents`](../packages/core/src/helpers/get-child-components.ts)

### Patch Changes

- 7e2c95f: [Angular] fix: issue with angular events not transformed to lower-case
- d59d328: [Angular, React, Vue] fix: issue with functions inside `useStore` missing ReturnType<...> when using `typescript: true` in config

## 0.4.7

### Patch Changes

- 068efab: [Angular, React, Vue] feat: add typescript support for `useStore`

## 0.4.6

### Patch Changes

- a7fd87f: [All] Fix: Property handle escaped text in JSXString nodes.
- a7fd87f: [Builder] Feature: Parse and serialize PersonalizedContainer in a JSX/LLM friendly way (like Columns)

## 0.4.5

### Patch Changes

- 428b3ab: chore: update internal structure for generators and add more information for options and metadata

## 0.4.4

### Patch Changes

- ad7e576: [Builder]: fix Text node crash with bindings
- 52dc749: [Builder]: preserve global CSS when converting from/to Builder JSON.

## 0.4.3

### Patch Changes

- 1bf28ea: Builder: fix: ensure component name suffix
- 814d171: Angular: Feature: custom template selectors using metadata hook.
- 531c15c: fix: check string value in `isUpperCase`
- 84038d5: Angular: Feat: support destructuring of props or state objects with attributes as well as event listeners directly inside an HTML element

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
