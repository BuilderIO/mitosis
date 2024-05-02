import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { server$ } from '@builder.io/qwik-city';
import { CodeEditor } from '~/components/code-editor';

export const compile = server$(async (code: string) => {
  const { parseJsx, componentToSvelte } = await import('@builder.io/mitosis');
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
    try {
      output.value = await compile(code.value);
    } catch (err) {
      console.warn(err);
    }
  });

  return (
    <div class="relative flex gap-4 mt-4 grow">
      <CodeEditor
        language="typescript"
        defaultValue={code.value}
        onChange$={(newCode) => {
          code.value = newCode;
        }}
        class="w-full"
      />
      <CodeEditor language="typescript" value={output.value} class="w-full" />
    </div>
  );
});
