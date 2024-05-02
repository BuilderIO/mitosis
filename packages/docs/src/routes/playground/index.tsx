import { componentToSvelte, parseJsx } from '@builder.io/mitosis';
import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { server$ } from '@builder.io/qwik-city';

export const compile = server$(async (code: string) => {
  const parsed = parseJsx(code);
  const svelte = componentToSvelte()({ component: parsed });
  return svelte;
});

export default component$(() => {
  const code = useSignal(
    'export default function MyComponent() {\n  return <div>Hello World</div>;\n}',
  );
  const output = useSignal('');

  useVisibleTask$(async ({ track }) => {
    track(() => code.value);
    output.value = await compile(code.value);
  });

  return (
    <div class="relative">
      <textarea bind:value={code} class="w-full h-32 p-3 border rounded shadow text-sm" />
      <textarea
        readOnly
        value={output.value}
        class="w-full h-32 p-3 border rounded shadow text-sm"
      />
    </div>
  );
});
