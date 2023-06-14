import { useStore, useTarget } from '@builder.io/mitosis';

export default function MyBasicForShowComponent() {
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
        vue2: 'v2',
        vue3: 'v3',
        webcomponent: 'wc',
      });
      return prefix + 'foo';
    },
  });

  return <div>{state.name}</div>;
}
