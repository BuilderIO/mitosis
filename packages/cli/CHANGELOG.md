# @builder.io/mitosis-cli

## 0.10.0

### Patch Changes

- Updated dependencies [dee8a62]
  - @builder.io/mitosis@0.10.0

## 0.9.5

### Patch Changes

- Updated dependencies [df7c51b]
  - @builder.io/mitosis@0.9.5

## 0.9.4

### Patch Changes

- Updated dependencies [dc3de1e]
  - @builder.io/mitosis@0.9.4

## 0.9.3

### Patch Changes

- Updated dependencies [ada6d73]
- Updated dependencies [de198af]
- Updated dependencies [1eb4d28]
  - @builder.io/mitosis@0.9.3

## 0.9.2

### Patch Changes

- Updated dependencies [d3502a7]
  - @builder.io/mitosis@0.9.2

## 0.9.1

### Patch Changes

- Updated dependencies [329e754]
  - @builder.io/mitosis@0.9.1

## 0.9.0

### Patch Changes

- a65e72b: JSX generator properly escapes single character > and <
- Updated dependencies [8ad66fd]
- Updated dependencies [a65e72b]
  - @builder.io/mitosis@0.9.0

## 0.8.0

### Patch Changes

- Updated dependencies [0fe1fdb]
  - @builder.io/mitosis@0.8.0

## 0.7.6

### Patch Changes

- Updated dependencies [cb7be32]
  - @builder.io/mitosis@0.7.6

## 0.7.5

### Patch Changes

- Updated dependencies [5dd61e2]
- Updated dependencies [0a49334]
  - @builder.io/mitosis@0.7.5

## 0.7.4

### Patch Changes

- Updated dependencies [559cf86]
  - @builder.io/mitosis@0.7.4

## 0.7.3

### Patch Changes

- Updated dependencies [8d94333]
- Updated dependencies [2ad4262]
  - @builder.io/mitosis@0.7.3

## 0.7.2

### Patch Changes

- Updated dependencies [f87bd64]
  - @builder.io/mitosis@0.7.2

## 0.7.1

### Patch Changes

- Updated dependencies [3d44b65]
  - @builder.io/mitosis@0.7.1

## 0.7.0

### Patch Changes

- Updated dependencies [de31a91]
- Updated dependencies [d5f3eea]
  - @builder.io/mitosis@0.7.0

## 0.6.8

### Patch Changes

- Updated dependencies [db70010]
  - @builder.io/mitosis@0.6.8

## 0.6.7

### Patch Changes

- Updated dependencies [781ad7b]
  - @builder.io/mitosis@0.6.7

## 0.6.6

### Patch Changes

- Updated dependencies [997f673]
  - @builder.io/mitosis@0.6.6

## 0.6.5

### Patch Changes

- Updated dependencies [3a6216e]
  - @builder.io/mitosis@0.6.5

## 0.6.4

### Patch Changes

- Updated dependencies [8e9e3c3]
  - @builder.io/mitosis@0.6.4

## 0.6.3

### Patch Changes

- Updated dependencies [05257f2]
  - @builder.io/mitosis@0.6.3

## 0.6.2

### Patch Changes

- Updated dependencies [0b55dc3]
  - @builder.io/mitosis@0.6.2

## 0.6.1

### Patch Changes

- Updated dependencies [74b1a19]
- Updated dependencies [74b1a19]
  - @builder.io/mitosis@0.6.1

## 0.6.0

### Patch Changes

- Updated dependencies [93575b5]
  - @builder.io/mitosis@0.6.0

## 0.5.38

### Patch Changes

- Updated dependencies [469394f]
  - @builder.io/mitosis@0.5.38

## 0.5.37

### Patch Changes

- Updated dependencies [f208f94]
  - @builder.io/mitosis@0.5.37

## 0.5.36

### Patch Changes

- Updated dependencies [a68bd42]
- Updated dependencies [b91dfa7]
  - @builder.io/mitosis@0.5.36

## 0.5.35

### Patch Changes

- Updated dependencies [b6a01ab]
  - @builder.io/mitosis@0.5.35

## 0.5.34

### Patch Changes

- Updated dependencies [cf666ff]
  - @builder.io/mitosis@0.5.34

## 0.5.33

### Patch Changes

- Updated dependencies [50976fa]
  - @builder.io/mitosis@0.5.33

## 0.5.32

### Patch Changes

- Updated dependencies [a38e5bb]
  - @builder.io/mitosis@0.5.32

## 0.5.31

### Patch Changes

- Updated dependencies [d24889d]
  - @builder.io/mitosis@0.5.31

## 0.5.30

### Patch Changes

- Updated dependencies [0c493b2]
  - @builder.io/mitosis@0.5.30

## 0.5.29

### Patch Changes

- Updated dependencies [1d74164]
  - @builder.io/mitosis@0.5.29

## 0.5.28

### Patch Changes

- Updated dependencies [b63279f]
  - @builder.io/mitosis@0.5.28

## 0.5.27

### Patch Changes

- 92ad2c6: Misc: stop using `fs-extra-promise` dependency
- Updated dependencies [92ad2c6]
  - @builder.io/mitosis@0.5.27

## 0.5.26

### Patch Changes

- Updated dependencies [57bdffe]
  - @builder.io/mitosis@0.5.26

## 0.5.25

### Patch Changes

- Updated dependencies [af43f50]
- Updated dependencies [20ad8dc]
  - @builder.io/mitosis@0.5.25

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
- Updated dependencies [995eb95]
- Updated dependencies [341f281]
- Updated dependencies [b387d21]
  - @builder.io/mitosis@0.5.24

## 0.5.23

### Patch Changes

- Updated dependencies [772d6f5]
  - @builder.io/mitosis@0.5.23

## 0.5.22

### Patch Changes

- Updated dependencies [d52fe59]
  - @builder.io/mitosis@0.5.22

## 0.5.21

### Patch Changes

- Updated dependencies [73a55a3]
- Updated dependencies [10a168d]
  - @builder.io/mitosis@0.5.21

## 0.5.20

### Patch Changes

- Updated dependencies [7ae4a01]
  - @builder.io/mitosis@0.5.20

## 0.5.19

### Patch Changes

- Updated dependencies [e9cfef0]
  - @builder.io/mitosis@0.5.19

## 0.5.18

### Patch Changes

- Updated dependencies [697c307]
- Updated dependencies [6f6db62]
- Updated dependencies [e90df53]
  - @builder.io/mitosis@0.5.18

## 0.5.17

### Patch Changes

- Updated dependencies [e430a68]
- Updated dependencies [b5ddfa3]
- Updated dependencies [068be0d]
  - @builder.io/mitosis@0.5.17

## 0.5.16

### Patch Changes

- Updated dependencies [3ab462a]
  - @builder.io/mitosis@0.5.16

## 0.5.15

### Patch Changes

- Updated dependencies [a0ad5ab]
  - @builder.io/mitosis@0.5.15

## 0.5.14

### Patch Changes

- Updated dependencies [39af4d6]
  - @builder.io/mitosis@0.5.14

## 0.5.13

### Patch Changes

- Updated dependencies [c7d2f8c]
  - @builder.io/mitosis@0.5.13

## 0.5.12

### Patch Changes

- Updated dependencies [5e2cf3c]
  - @builder.io/mitosis@0.5.12

## 0.5.11

### Patch Changes

- Updated dependencies [db9dbf9]
  - @builder.io/mitosis@0.5.11

## 0.5.10

### Patch Changes

- Updated dependencies [499b4b7]
  - @builder.io/mitosis@0.5.10

## 0.5.9

### Patch Changes

- Updated dependencies [8c2be87]
  - @builder.io/mitosis@0.5.9

## 0.5.8

### Patch Changes

- Updated dependencies [8d823a1]
  - @builder.io/mitosis@0.5.8

## 0.5.7

### Patch Changes

- Updated dependencies [7a099d2]
  - @builder.io/mitosis@0.5.7

## 0.5.6

### Patch Changes

- Updated dependencies [0aa642a]
  - @builder.io/mitosis@0.5.6

## 0.5.5

### Patch Changes

- Updated dependencies [56c6347]
  - @builder.io/mitosis@0.5.5

## 0.5.4

### Patch Changes

- Updated dependencies [d13e693]
  - @builder.io/mitosis@0.5.4

## 0.5.3

### Patch Changes

- Updated dependencies [82c79fd]
  - @builder.io/mitosis@0.5.3

## 0.5.2

### Patch Changes

- Updated dependencies [dad8e2f]
  - @builder.io/mitosis@0.5.2

## 0.5.1

### Patch Changes

- Updated dependencies [dbd5a50]
  - @builder.io/mitosis@0.5.1

## 0.5.0

### Patch Changes

- Updated dependencies [7e2c95f]
- Updated dependencies [4171a19]
- Updated dependencies [d59d328]
  - @builder.io/mitosis@0.5.0

## 0.4.7

### Patch Changes

- Updated dependencies [068efab]
  - @builder.io/mitosis@0.4.7

## 0.4.6

### Patch Changes

- Updated dependencies [a7fd87f]
- Updated dependencies [a7fd87f]
  - @builder.io/mitosis@0.4.6

## 0.4.5

### Patch Changes

- Updated dependencies [428b3ab]
  - @builder.io/mitosis@0.4.5

## 0.4.4

### Patch Changes

- Updated dependencies [ad7e576]
- Updated dependencies [52dc749]
  - @builder.io/mitosis@0.4.4

## 0.4.3

### Patch Changes

- Updated dependencies [1bf28ea]
- Updated dependencies [814d171]
- Updated dependencies [531c15c]
- Updated dependencies [84038d5]
  - @builder.io/mitosis@0.4.3

## 0.4.2

### Patch Changes

- Updated dependencies [c29e3ca]
  - @builder.io/mitosis@0.4.2

## 0.4.1

### Patch Changes

- Updated dependencies [1943604]
- Updated dependencies [d446881]
  - @builder.io/mitosis@0.4.1

## 0.4.0

### Patch Changes

- Updated dependencies [7d8f4ff]
  - @builder.io/mitosis@0.4.0

## 0.3.22

### Patch Changes

- Updated dependencies [f19a00f]
  - @builder.io/mitosis@0.3.22

## 0.3.21

### Patch Changes

- Updated dependencies [45de754]
- Updated dependencies [03f1f58]
- Updated dependencies [45de754]
  - @builder.io/mitosis@0.3.21

## 0.3.20

### Patch Changes

- Updated dependencies [34bbd34]
  - @builder.io/mitosis@0.3.20

## 0.3.19

### Patch Changes

- Updated dependencies [3f5fff1]
- Updated dependencies [4c662df]
  - @builder.io/mitosis@0.3.19

## 0.3.18

### Patch Changes

- Updated dependencies [952b3f5]
  - @builder.io/mitosis@0.3.18

## 0.3.17

### Patch Changes

- Updated dependencies [48f5481]
  - @builder.io/mitosis@0.3.17

## 0.3.16

### Patch Changes

- Updated dependencies [9abf0ac]
  - @builder.io/mitosis@0.3.16

## 0.3.15

### Patch Changes

- Updated dependencies [383f69f]
  - @builder.io/mitosis@0.3.15

## 0.3.14

### Patch Changes

- Updated dependencies [9a1d59b]
  - @builder.io/mitosis@0.3.14

## 0.3.13

### Patch Changes

- Updated dependencies [f86e2ec]
  - @builder.io/mitosis@0.3.13

## 0.3.12

### Patch Changes

- Updated dependencies [3a04558]
  - @builder.io/mitosis@0.3.12

## 0.3.11

### Patch Changes

- Updated dependencies [59a92da]
  - @builder.io/mitosis@0.3.11

## 0.3.10

### Patch Changes

- Updated dependencies [8548feb]
- Updated dependencies [f83b8f4]
  - @builder.io/mitosis@0.3.10

## 0.3.9

### Patch Changes

- Updated dependencies [9705329]
  - @builder.io/mitosis@0.3.9

## 0.3.8

### Patch Changes

- Updated dependencies [495a937]
  - @builder.io/mitosis@0.3.8

## 0.3.7

### Patch Changes

- Updated dependencies [413cdc2]
  - @builder.io/mitosis@0.3.7

## 0.3.6

### Patch Changes

- Updated dependencies [2c1b162]
  - @builder.io/mitosis@0.3.6

## 0.3.5

### Patch Changes

- Updated dependencies [14a9a90]
  - @builder.io/mitosis@0.3.5

## 0.3.4

### Patch Changes

- Updated dependencies [42287fe]
  - @builder.io/mitosis@0.3.4

## 0.3.3

### Patch Changes

- Updated dependencies [027e9cc]
  - @builder.io/mitosis@0.3.3

## 0.3.2

### Patch Changes

- 78f6a64: Misc: remove unused dependencies.
- Updated dependencies [78f6a64]
  - @builder.io/mitosis@0.3.2

## 0.3.1

### Patch Changes

- Updated dependencies [c8b7883]
  - @builder.io/mitosis@0.3.1

## 0.3.0

### Patch Changes

- Updated dependencies [c249052]
  - @builder.io/mitosis@0.3.0

## 0.2.10

### Patch Changes

- 90b3b02: Support for custom generators / targets
- Updated dependencies [90b3b02]
  - @builder.io/mitosis@0.2.10

## 0.2.9

### Patch Changes

- Updated dependencies [a5d47bd]
  - @builder.io/mitosis@0.2.9

## 0.2.8

### Patch Changes

- Updated dependencies [18b9210]
  - @builder.io/mitosis@0.2.8

## 0.2.7

### Patch Changes

- Updated dependencies [1dbdf32]
  - @builder.io/mitosis@0.2.7

## 0.2.6

### Patch Changes

- Updated dependencies [389018d]
- Updated dependencies [c7f2759]
  - @builder.io/mitosis@0.2.6

## 0.2.5

### Patch Changes

- 2e56b76: Fix: Qwik methods using computed variables
- Updated dependencies [2e56b76]
  - @builder.io/mitosis@0.2.5

## 0.2.4

### Patch Changes

- Updated dependencies [cee502f]
  - @builder.io/mitosis@0.2.4

## 0.2.3

### Patch Changes

- Updated dependencies [2867f44]
  - @builder.io/mitosis@0.2.3

## 0.2.2

### Patch Changes

- Updated dependencies [18e890c]
  - @builder.io/mitosis@0.2.2

## 0.2.1

### Patch Changes

- Updated dependencies [5ef7920]
  - @builder.io/mitosis@0.2.1

## 0.2.0

### Minor Changes

- 0a39722: 💣 Breaking Change: Angular generator: all components are now exported as a `default` export instead of a named export.

### Patch Changes

- 0a39722: Feat: remove all explicit `.js` import extensions when `explicitImportFileExtension` config is `false`
- 0a39722: Feat: update angular generator to support dynamic components, context and more
- Updated dependencies [0a39722]
- Updated dependencies [0a39722]
- Updated dependencies [0a39722]
- Updated dependencies [0a39722]
  - @builder.io/mitosis@0.2.0

## 0.1.7

### Patch Changes

- Updated dependencies [ba5e3b4]
  - @builder.io/mitosis@0.1.7

## 0.1.6

### Patch Changes

- Updated dependencies [5738855]
  - @builder.io/mitosis@0.1.6

## 0.1.5

### Patch Changes

- Updated dependencies [6688702]
  - @builder.io/mitosis@0.1.5

## 0.1.4

### Patch Changes

- Updated dependencies [20efa15]
  - @builder.io/mitosis@0.1.4

## 0.1.3

### Patch Changes

- Updated dependencies [9944a68]
  - @builder.io/mitosis@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies [83b9bb8]
  - @builder.io/mitosis@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies [9d6e019]
- Updated dependencies [9d6e019]
  - @builder.io/mitosis@0.1.1

## 0.1.0

### Minor Changes

- 5dfd7cd: Breaking Change: remove vue2 and vue3 generators, keeping only the default vue generator (which generates vue3).

### Patch Changes

- Updated dependencies [5dfd7cd]
  - @builder.io/mitosis@0.1.0

## 0.0.147

### Patch Changes

- Updated dependencies [4e49454]
  - @builder.io/mitosis@0.0.147

## 0.0.146

### Patch Changes

- Updated dependencies [35becd6]
- Updated dependencies [f64d9b0]
- Updated dependencies [35becd6]
  - @builder.io/mitosis@0.0.146

## 0.0.145

### Patch Changes

- Updated dependencies [9720fb6]
  - @builder.io/mitosis@0.0.145

## 0.0.144

### Patch Changes

- Updated dependencies [e4f0019]
  - @builder.io/mitosis@0.0.144

## 0.0.143

### Patch Changes

- e913d91: fix release

## 0.0.142

### Patch Changes

- Updated dependencies [a4f8311]
  - @builder.io/mitosis@0.0.142
