# CLI

We currently have two CLI commands: `mitosis build` and `mitosis compile`.

## `mitosis compile`

`mitosis compile` is a relatively straightforward command. It:

- Reads the config in `mitosis.config.js` (also could specify config file by option: `--config=<file>`)
- Receives 1 Mitosis component file as input
- Outputs it to 1 designated target.

## `mitosis build`

`mitosis build` is meant for entire project/folders, and is therefore more involved. It:

- Reads the config in `mitosis.config.js` (also could specify config file by option: `--config=<file>`)
- Identifies a source folder
- Reads _all_ Mitosis files in the source folder, and
  - Outputs a component for each target in the config
  - Performs additional transpilation steps on a per-target basis
- Reads _all_ non-Mitosis JS/TS files in the project, and
  - transpiles them as-is to JS
- Performs necessary transformations to both Mitosis & non-Mitosis files so that the output folder is coherent and valid (like renaming all component imports in a Svelte target such that they match the output name, ending in `.svelte`)
