<p align="center"><img width="400" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F928fd46bd9d84a3fbc5b31fd5b93a7df"></p>

<p align="center">
  Write components once, run everywhere. Compiles to:
</p>

<p align="center"><img width="500" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Feceb6573940b4af0a2b6d96719be45fc" /></p>

<p align="center">
  <a href="https://mitosis.builder.io/">
    <img width="800" alt="Fiddle" src="https://imgur.com/H1WTtGe.gif" />
  </a>
  <p align="center">
    Try our  <a href="https://mitosis.builder.io/"><b>interactive fiddle</b></a>
  </p>
</p>

<p align="center">
  <a href="https://github.com/prettier/prettier"><img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg" /></a>
  <a href="https://github.com/BuilderIO/mitosis/pulls"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" /></a>
  <a href="https://github.com/BuilderIO/mitosis"><img alt="License" src="https://img.shields.io/github/license/BuilderIO/mitosis" /></a>
  <a href="https://www.npmjs.com/package/@builder.io/mitosis"><img alt="Types" src="https://img.shields.io/npm/types/@builder.io/mitosis" /></a>
  <a href="https://www.npmjs.com/package/@builder.io/mitosis" rel="nofollow"><img src="https://img.shields.io/npm/v/@builder.io/mitosis.svg?sanitize=true"></a>
</p>

## Table of contents

- [Getting Started](#getting-started)
- [Docs](#docs)
- [Why use Mitosis?](#why-use-mitosis)
  - [Design Systems Maintainers](#design-systems-maintainers)
  - [Teams using multiple web frameworks](#teams-using-multiple-web-frameworks)
  - [Teams building web SDKs](#teams-building-web-sdks)
- [Contribute](#contribute)
- [Coming soon](#coming-soon)
- [Community](#community)
- [ESLint Rules](#eslint-rules)
- [Related Projects](#related-projects)

## Getting Started

The best way to learn Mitosis is to clone our [example project](./examples/basic/) and start tinkering. Otherwise, here are some helpful external resources on trying out Mitosis:

- https://blog.logrocket.com/creating-reusable-components-mitosis-builder-io/

## Overview

[![Mitosis Video](https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Ffa5c422309ce4fbea9eaa133fa471877)](https://www.youtube.com/watch?v=XQIuv34-K_8 'Mitosis Video')

## Docs

Curious about how Mitosis code works under the hood, and how to use it? Learn more [in our in-depth docs](docs/).

## Why use Mitosis?

Mitosis is an incredibly powerful and flexible tool. So far, we have identified 3 broad categories of engineering teams that stand to benefit greatly from it:

### Design Systems Maintainers

If you are the maintainer of a design system library that started off in one web framework, then you have felt the tremendous amount of maintenance pain and duplication when creating new versions for subsequent frameworks. Look no further than the popular React library [Chakra UI](https://chakra-ui.com/), and how the maintainers have decided to create [Zag.js](https://zagjs.com/overview/introduction#motivation) after feeling the pain of maintaining state-logic code across both their React and Vue libraries. While Zag.js focuses on writing framework-agnostic interactions, Mitosis focuses on writing framework-specific components. (PS: We are working on building examples that combine these two together. TBD!)

### Teams using multiple web frameworks

If you are part of a team/organization that has multiple frontends built in different frameworks, then you know that coordinating your design system across all of them for a cohesive experience and feel is an absolute nightmare. Mitosis is an excellent tool to eliminate this class of problems, as it allows you to define your designs in your components once and deploy them to all of your separate frontends.

### Teams building web SDKs

If your team is building SDKs for a product that integrates directly into a web framework and involves providing components to the end user, then Mitosis is a _perfect_ fit for your team. Our team at Builder.io has this exact use-case: our [new generation of SDKs](https://github.com/BuilderIO/builder/tree/main/packages/sdks/) is built with Mitosis! Our engineers have received glowing praise from our sales team for speed of delivery, and all it took was a switch flip 😉

<div style="display: flex; flex-direction: column; align-items: center;">
  <img width="50%" src="imgs/kudos-1.png"/>
  <br/>
  <img width="50%" src="imgs/kudos-2.png"/>
</div>

## What about XKCD

<img alt="XKCD comic about solving too many standards by creating new standards just making yet another standard" src="https://user-images.githubusercontent.com/844291/168342803-5599952e-a400-4918-851d-5af93dc19585.png" width="500">

Yup, we've all seen it. But if this is a concern for you, you may be looking at Mitosis wrong. Rather than just yet-another-component-syntax, Mitosis is a compiler for the frontend, analogous to [LLVM](https://en.wikipedia.org/wiki/LLVM). A toolchain that embraces that there are, and forever will be, many ways of writing components. Mitosis defines a common [intermediate representation](https://en.wikipedia.org/wiki/Intermediate_representation) that allows us to author components once then compile to many frameworks, just like LLVM lets us write code that can compile to any [instruction set architecture](https://en.wikipedia.org/wiki/Instruction_set_architecture). If you look at Mitosis this way, you may more clearly see the value.

Also similarly to LLVM, multiple syntaxes can compile to Mitotis. Our out-of-the-box syntax uses JSX, but we have explored others, such as a Vue/Svelte-like syntax. [Builder.io](https://github.com/builderio/builder) emits Mitosis IR, allowing you to turn designs to code for any supported framework. JSX and Builder.io are the currently supported frontends of the compiler, and the frameworks listed below are the backends.

## Status

| Framework     | Status       |
| ------------- | ------------ |
| React         | Beta         |
| Qwik          | Beta         |
| Vue           | Beta         |
| Liquid        | Alpha        |
| Builder.io    | Beta         |
| Solid         | Beta         |
| Figma         | Alpha        |
| Angular       | Beta         |
| Svelte        | Beta         |
| HTML/CSS/JS   | Beta         |
| Webcomponents | Beta         |
| React Native  | Beta         |
| SwiftUI       | Experimental |

## Contribute

Interested in contribute? Head over to the [developer](developer/) docs and see how you can get setup & started!

Once you're ready, checkout our [issues](https://github.com/BuilderIO/mitosis/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) page and grab your first issue!

## Coming soon

[V1 release](https://github.com/orgs/BuilderIO/projects/4) (help wanted!)

## Community

- [Mitosis Discord](https://discord.gg/CQZt8hzZJR)
- [@Builderio](https://twitter.com/builderio)

## ESLint rules

Checkout our [ESLint plugin](./packages/eslint-plugin/) project for useful rules when developing in Mitosis.

## Related Projects

- [Figma plugin](https://github.com/BuilderIO/figma-html): Convert Figma designs into high quality HTML, React, Vue, Svelte, Angular, Solid, etc code via Mitosis.
- [Builder](https://github.com/BuilderIO): Drag and drop page builder and CMS for React, Vue, Angular, and more.
- [Qwik](https://github.com/BuilderIO/qwik): An open-source framework designed for best possible time to interactive, by focusing on resumability of server-side-rendering of HTML, and fine-grained lazy-loading of code.
- [Partytown](https://github.com/BuilderIO/partytown): Relocate resource intensive third-party scripts off of the main thread and into a web worker. 🎉

<p align="center">
  Made with ❤️ by <a target="_blank" href="https://www.builder.io/">Builder.io</a>
</p>
