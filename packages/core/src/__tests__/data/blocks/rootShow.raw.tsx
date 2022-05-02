import { Show } from '@builder.io/mitosis';

export default function RenderStyles(props: { foo: string }) {
  return (
    <Show when={props.foo === 'bar'} else={<div>Foo</div>}>
      <div>Bar</div>
    </Show>
  );
}
