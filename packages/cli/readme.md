# JSX-Lite CLI

A CLI for jsx-lite.

## Installation

```bash
npm install -g @jsx-lite/cli
```

## Usage

```bash
jsx-lite compile --to=<format> < <input-file>
cat my-file.tsx | jsx-lite compile -t=<format>
jsx-lite compile -t=<format> <input-file>
```

Check the output from `jsx-lite compile --help`.

**Examples**

```bash
jsx-lite compile -t react component.tsx
jsx-lite compile -t react < component.tsx
cat component.tsx | jsx-lite compile -t html -
jsx-lite compile -t react --out-dir build -- src/**/*.tsx
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
- `jsxLite`
- `builder`
- `swift`
- `svelte`
- `liquid`
- `angular`

Supported formats for `--from` are:

- `jsxLite`
- `builder`
- `liquid`

## Cook book

Here are some recipes for standard tasks

### Validate how Builder will transform JSX Lite

```bash
cat components/postscript.lite.tsx |
  jsx-lite compile -t builder - |
  jsx-lite compile -f builder -t jsxLite
```

### Run jsx-lite on file system change

Use a tool like [entr](https://github.com/eradman/entr) or [guard](https://github.com/guard/guard)

```
find . -name '*lite.tsx' | entr make /_
```

## Known issues

- Running `jsx-lite` from the root of this repository breaks due to some
  dynamic babel configuration look up
- Files that are created as the result of `--out-dir=<dir>` maintain the original
  file extension of the input file, which doesn't make any sense in the case of
  an html output.
- `--out=<file>` does not support concatenating multiple files together.

## Manual installation

```bash
git clone git@github.com:BuilderIO/jsx-lite.git
cd jsx-lite/packages/cli
npm install
npm run build
npm link
```

# License

MIT - see LICENSE
