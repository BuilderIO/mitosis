# Example Mitosis project

### Setup

```bash
# install
npm install

# build
npm run build

# run dev server that watches for changes
npm run start

# test
npm run test
```

### Project structure

Here are some key things to look at:

- `src` contains your Mitosis source code
- `output` contains per-target output of the project
  - You will notice `.lite.tsx` files _in_ your output. Those are a human-readable Mitosis components. Think of them as a reference point for you to debug more easily, since the actual JS output is minified and thus difficult to read.
- `mitosis.config.js` contains general and per-target configuration. It is used by `mitosis build`.
- `overrides` contains a per-target folder that mimicks the structure of `src`, and will completely swap out any files with identical names. Example: since we have defined `overrides/react-native/src/functions/is-react-native.ts`, it will override `src/functions/is-react-native.ts` in `output/react-native/src/functions/is-react-native.js`