import { onMount, useStore, useTarget } from '@builder.io/mitosis';

export default function UseTargetComponent() {
  const state = useStore({
    get name() {
      const prefix = useTarget<string | number | boolean>({
        default: 'Default str',
        react: 123,
        angular: true,
        vue: 'v',
        alpine: 'a',
        customElement: 'c',
        html: 'h',
        liquid: 'l',
        lit: 'li',
        marko: 'm',
        mitosis: 'mi',
        preact: 'p',
        qwik: 'q',
        reactNative: 'rn',
        svelte: 's',
        rsc: 'rsc',
        solid: 'so',
        stencil: 'st',
        swift: 'sw',
        taro: 't',
        template: 'te',
        webcomponent: 'wc',
      });
      return prefix + 'foo';
    },

    lastName: 'bar',
  });

  onMount(() => {
    useTarget({
      react: () => {
        console.log('react');
        state.lastName = 'baz';
      },
      qwik: () => {
        console.log('qwik');
        state.lastName = 'baz';
      },
    });
  });

  return <div>{state.name}</div>;
}
