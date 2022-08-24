# E2E App Output for Vue3

The Vue3 output depend on Vue version 3 - conflicting with Vue 2, therefore a
separate package (with package.json) is needed.

The Vue 3 documentation describes bundling Vue3 code for library use:

https://vitejs.dev/guide/build.html#library-mode

However, the unbundled code works sufficient for our testing purposes, avoiding
time and complexity.
