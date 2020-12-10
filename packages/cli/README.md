# @jsx-lite/cli

> JSX lite command line interface.


## Install

```
$ npm i @jsx-lite/cli -D
```


## Usage

```
$ jsx-lite --help

  Usage
    $ jsx-lite <files> <command> [options]

  Commands
    vue, react, angular, svelte, reactNative, solid, webcomponents, html, liquid, json, builder

  Options
    --output-dir, -d    Output directory (default: ".")         [string]

    <svelte>
    --state-handling    variables, proxies                      [string]

    <react>
    --style-library     emotion, styledComponents, styledJsx    [string]
    --state-library     useState, mobx, solid                   [string]

    <reactNative>
    --state-library     useState, mobx, solid                   [string]

  Examples
    $ jsx-lite example.jsx vue
    $ jsx-lite example.jsx svelte --state-handling=proxies
    $ jsx-lite source/**/*.jsx react --output-dir=packages/react

```
