import { componentToSvelte, parseJsx } from '@builder.io/mitosis';
import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';

export default component$(() => {
  const code = useSignal(
    'export default function MyComponent() {\n  return <div>Hello World</div>;\n}',
  );
  const output = useSignal('');

  useVisibleTask$(({ track }) => {
    track(code);
    const parsed = parseJsx(code.value);
    const svelte = componentToSvelte()({ component: parsed });
    output.value = svelte;
    console.log('output', output.value);
  });

  return (
    <div class="relative">
      <textarea bind:value={code} class="fixed inset-0 top-1.5 w-full h-full" />
    </div>
  );
});
