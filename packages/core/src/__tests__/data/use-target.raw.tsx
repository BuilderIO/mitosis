import { useStore, useTarget } from '@builder.io/mitosis';

export default function MyBasicForShowComponent() {
  const state = useStore({
    get name() {
      const prefix = useTarget({
        default: 'Mr.',
        react: 'rct',
        angular: 'ng',
        vue: 'v',
      });
      return prefix + 'foo';
    },
  });

  return <div>{state.name}</div>;
}
