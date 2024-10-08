import { useStore } from '@builder.io/mitosis';

// TODO PLAN-207
export default function StringLiteralStore() {
  const state = useStore({ 'foo-bar': 123 });

  return <div>{state['foo-bar']}</div>;
}
