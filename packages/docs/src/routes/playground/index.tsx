import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { server$ } from '@builder.io/qwik-city';
import { CodeEditor } from '~/components/code-editor';
import Select from '~/components/select';

export type Output = 'react' | 'svelte' | 'vue' | 'qwik' | 'angular';
const outputs: Output[] = ['react', 'svelte', 'vue', 'qwik', 'angular'];

export const compile = server$(async (code: string, output: Output) => {
  const {
    parseJsx,
    componentToSvelte,
    componentToVue,
    componentToReact,
    componentToQwik,
    componentToAngular,
  } = await import('@builder.io/mitosis');
  const parsed = parseJsx(code);
  const outputCode =
    output === 'svelte'
      ? componentToSvelte()({ component: parsed })
      : output === 'react'
      ? componentToReact()({ component: parsed })
      : output === 'qwik'
      ? componentToQwik()({ component: parsed })
      : output === 'angular'
      ? componentToAngular()({ component: parsed })
      : componentToVue({
          api: 'composition',
        })({ component: parsed });
  return outputCode;
});

const defaultCode = `
import { useState } from "@builder.io/mitosis";

export default function MyComponent(props) {
  const [name, setName] = useState("Steve");

  return (
    <div>
      <input
        css={{
          color: "red",
        }}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      Hello! I can run in React, Vue, Solid, or Liquid!
    </div>
  );
}
`.trim();

export default component$(() => {
  const code = useSignal(defaultCode);
  const output = useSignal('');
  const outputOneFramework = useSignal<Output>('svelte');
  const output2 = useSignal('');
  const outputTwoFramework = useSignal<Output>('vue');

  useVisibleTask$(async ({ track }) => {
    track(() => code.value);
    try {
      output.value = await compile(code.value, outputOneFramework.value);
    } catch (err) {
      console.warn(err);
    }
  });

  useVisibleTask$(async ({ track }) => {
    track(() => code.value);
    try {
      output2.value = await compile(code.value, outputTwoFramework.value);
    } catch (err) {
      console.warn(err);
    }
  });

  return (
    <div class="relative flex gap-4 mt-4 grow items-stretch">
      <CodeEditor
        language="typescript"
        defaultValue={code.value}
        onChange$={(newCode) => {
          code.value = newCode;
        }}
        class="w-full"
      />
      <div class="flex gap-4 flex-col w-full h-[90vh]">
        <Select
          value={outputOneFramework.value}
          onChange$={(framework: any) => (outputOneFramework.value = framework)}
          options={outputs}
        />
        <CodeEditor language="html" value={output.value} class="h-[50%]" />
        <Select
          value={outputTwoFramework.value}
          onChange$={(framework: any) => (outputTwoFramework.value = framework)}
          options={outputs}
        />
        <CodeEditor language="html" value={output2.value} class="h-[50%]" />
      </div>
    </div>
  );
});
