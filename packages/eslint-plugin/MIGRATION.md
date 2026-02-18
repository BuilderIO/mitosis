# Migration to ESLint 9.0.0

This package has been updated to support ESLint 9.0.0 with flat config format.

## Breaking Changes

### Minimum ESLint Version

- **Old**: ESLint >= 0.8.0
- **New**: ESLint >= 9.0.0

### Configuration Format

ESLint 9.0.0 uses the new flat config format by default (`eslint.config.js`).

#### Flat Config (ESLint 9+) - Recommended

```js
// eslint.config.js
import mitosis from '@builder.io/eslint-plugin-mitosis';

export default [
  mitosis.configs.recommended,
  // your other configs...
];
```

#### Legacy Config (Backwards Compatibility)

If you need to use the legacy eslintrc format, use the `recommended-legacy` config:

```js
// .eslintrc.js
module.exports = {
  extends: ['plugin:@builder.io/mitosis/recommended-legacy'],
  // your other configs...
};
```

## What Changed

1. **Flat Config Support**: The plugin now exports configs in flat config format
2. **Rule Schemas**: All rules now have explicit `schema: []` to comply with ESLint 9 requirements
3. **Test Updates**: RuleTester now uses `languageOptions` instead of `parserOptions`
4. **Dependencies**: Updated to ESLint 9.x and related packages

## Migration Steps

1. Update your ESLint dependency to >= 9.0.0
2. Migrate your ESLint configuration to flat config format (see [ESLint Migration Guide](https://eslint.org/docs/latest/use/configure/migration-guide))
3. Update your plugin configuration to use the new format shown above
4. Run your linter to ensure everything works

## Need Help?

If you encounter issues during migration, please:

- Check the [ESLint v9 Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
- Open an issue on the Mitosis repository
