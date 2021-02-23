# JSX-Lite CLI

A CLI for jsx-lite.

## Installation

**Manual installation**
```bash
git clone git@github.com:BuilderIO/jsx-lite.git
cd jsx-lite/packages/cli
npm install
npm run build
npm link
```

## Usage

```bash
jsx-lite --to=<format> < my-file.tsx
cat my-file.tsx | jsx-lite
```

Check the output from `jsx-lite --help`.

## Customizing your CLI

Check out the documentation at https://github.com/infinitered/gluegun/tree/master/docs.

## Publishing to NPM

To package your CLI up for NPM, do this:

```shell
$ npm login
$ npm whoami
$ npm lint
$ npm test
(if typescript, run `npm run build` here)
$ npm publish
```

# License

MIT - see LICENSE

