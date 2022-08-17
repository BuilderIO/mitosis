# Generators

Want to contribute a new generator? Take a look at this Loom where we add the Stencil generator in about 40mins! https://www.loom.com/share/3e8bf7e667314a829a0b5d4b61c58cc0

Generators are made up of 2 main functions: `componentTo<framework>` and `blockTo<framework>`, where `<framework>` is the target framework.

## `componentTo<framework>`

is responsible for converting an entire JSON mitosis component to a component in the target framework (as a string)

These are the main operations in order:

- `preJsonPlugins`: stuff that runs before we do anything
- Everything we need: like `getProps` will always be here. (What else?)
- `postJsonPlugins`: stuff that runs after we’ve done the manipulations that we need, or grabbed the data from the component
- Create the initial string for the component
- `PreCodePlugins`: options.plugins pre
- Formatting with prettier
- `PostCodePlugins`: options.plugins post

**ORDER matters**: Functions that grab `json` or `component` often mutate it, causing side effects.

General structure of a generator:

Visually, it looks exactly like a component of the target framework. Each part (imports, name, styles, render body, lifecycle methods) is injected using the Mitosis JSON data, such that it is valid code for that framework.

## `blockTo<framework>`

This is code that handles each individual DOM node within the overall component.

Compile-away-components: Show, For, etc.

- These are special Mitosis components that are replaced with the appropriate target-specific logic at compile-time

### Helpers

#### Styling

**collectClassString**

Grabs all the styles and figures out what class-names to provide to the component

**collectCss**

Grabs all the `css=` data into a style object and removes it (SIDE EFFECT) from the mitosis JSON

#### State

**getStateObjectFromString**

Grabs all state data and formats it appropriately for the target framework
