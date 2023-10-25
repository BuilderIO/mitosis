import { onEvent, onMount, useRef } from '@builder.io/mitosis';

export default function Embed() {
  const elem = useRef<HTMLDivElement>(null);

  onEvent(
    'initEditingBldr',
    () => {
      console.log('test');
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
