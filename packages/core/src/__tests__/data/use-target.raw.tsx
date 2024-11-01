import { onMount, useState, useStore, useTarget } from '@builder.io/mitosis';

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

  const [foo, setFoo] = useState('bar');

  onMount(() => {
    console.log(foo);
    setFoo('bar');

    useTarget({
      react: () => {
        console.log('react');
        state.lastName = 'baz';
        console.log(foo);
        setFoo('baz');
      },
      qwik: () => {
        console.log('qwik');
        state.lastName = 'baz';
        console.log(foo);
        setFoo('baz');
      },
    });
  });

  return <div>{state.name}</div>;
}
