# CLI

We currently have two CLI commands: `mitosis build` and `mitosis compile`.

## `mitosis compile`

`mitosis compile` is a relatively straightforward command. It:

- Reads the config in `mitosis.config.js` (also could specify config file by option: `--config=<file>`)
- Receives 1 Mitosis component file as input
- Outputs it to 1 designated target.

You can get more information by running `mitosis --help`

## `mitosis build`

`mitosis build` is meant for entire project/folders, and is therefore more involved. It:

- Reads the config in `mitosis.config.js` (also could specify config file by option: `--config=<file>`)
- Identifies a source folder
- Reads _all_ Mitosis files in the source folder, and
  - Outputs a component for each target in the config or cli options
  - Performs additional transpilation steps on a per-target basis
- Reads _all_ non-Mitosis JS/TS files in the project, and
  - transpiles them as-is to JS
- Performs necessary transformations to both Mitosis & non-Mitosis files so that the output folder is coherent and valid (like renaming all component imports in a Svelte target such that they match the output name, ending in `.svelte`)

### options

|                             Option                              | Description                                           | Example                                                                                           |
| :-------------------------------------------------------------: | :---------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
|       <p style="white-space:nowrap">--config=\<file\></p>       | To specify config file, defaults to mitosis.config.js | none                                                                                              |
|     <p style="white-space:nowrap">--targets=[format...]</p>     | To specify extra build targets                        | `mitosis build --targets react,vue,svelte` will add 'react', 'vue' and 'svelte' to build targets. |
| <p style="white-space:nowrap">--exclude-targets=[format...]</p> | To exclude targets from the targets of config file    | `mitosis build --exclude-targets react,vue` will remove 'react' and 'vue' from build targets      |
