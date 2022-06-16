# Mitosis CLI

A CLI for Mitosis.

## Installation

```bash
npm install -g @builder.io/mitosis-cli
```

## Usage

```bash
mitosis compile --to=<format> < <input-file>
cat my-file.tsx | mitosis compile -t=<format>
mitosis compile -t=<format> <input-file>
```

Check the output from `mitosis compile --help`.

**Examples**

```bash
mitosis compile -t react component.tsx
mitosis compile -t react < component.tsx
cat component.tsx | mitosis compile -t html -
mitosis compile -t react --out-dir build -- src/**/*.tsx
```

## Options

Supported formats for `--to` are:

- `reactNative`
- `solid`
- `vue`
- `react`
- `template`
- `html`
- `customElement`
- `mitosis`
- `builder`
- `swift`
- `svelte`
- `liquid`
- `angular`

Supported formats for `--from` are:

- `mitosis`
- `builder`
- `liquid`

## Cook book

Here are some recipes for standard tasks

### Validate how Builder will transform Mitosis

```bash
cat components/postscript.lite.tsx |
  mitosis compile -t builder - |
  mitosis compile -f builder -t mitosis
```

### Run mitosis on file system change

Use a tool like [entr](https://github.com/eradman/entr) or [guard](https://github.com/guard/guard)

```
find . -name '*lite.tsx' | entr make /_
```

## Known issues

- Running `mitosis` from the root of this repository breaks due to some
  dynamic babel configuration look up
- Files that are created as the result of `--out-dir=<dir>` maintain the original
  file extension of the input file, which doesn't make any sense in the case of
  an html output.
- `--out=<file>` does not support concatenating multiple files together.
