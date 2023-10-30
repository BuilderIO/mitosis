import { onEvent, onMount, useRef, useStore } from '@builder.io/mitosis';

export default function Embed() {
  const elem = useRef<HTMLDivElement>(null);

  const state = useStore({
    foo(event) {
      console.log('test2');
    },
  });

  onEvent(
    'initEditingBldr',
    (event) => {
      console.log('test');
      state.foo(event);
    },
    elem,
    true,
  );

  onMount(() => {
    elem.dispatchEvent(new CustomEvent('initEditingBldr'));
  });

  return (
    <div ref={elem} class="builder-embed">
      <div>Test</div>
    </div>
  );
}
