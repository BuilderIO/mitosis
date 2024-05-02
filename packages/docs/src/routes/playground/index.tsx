import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { server$ } from '@builder.io/qwik-city';
import { CodeEditor } from '~/components/code-editor';
import Select from '~/components/select';

export type OutputFramework = 'react' | 'svelte' | 'vue' | 'qwik' | 'angular';
const outputs: OutputFramework[] = ['react', 'svelte', 'vue', 'qwik', 'angular'];

export type InputSyntax = 'jsx' | 'svelte';
const inputs: InputSyntax[] = ['jsx', 'svelte'];

export const compile = server$(async (code: string, output: OutputFramework) => {
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
  const inputSyntax = useSignal<InputSyntax>('jsx');
  const output = useSignal('');
  const outputOneFramework = useSignal<OutputFramework>('svelte');
  const output2 = useSignal('');
  const outputTwoFramework = useSignal<OutputFramework>('vue');

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
      <div class="w-full flex flex-col">
        <Select
          class="ml-auto mr-2"
          value={inputSyntax.value}
          onChange$={(framework: any) => (inputSyntax.value = framework)}
          options={inputs}
        />
        <CodeEditor
          language="typescript"
          class="grow"
          defaultValue={code.value}
          onChange$={(newCode) => {
            code.value = newCode;
          }}
        />
      </div>
      <div class="flex gap-4 flex-col w-full h-[90vh]">
        <Select
          class="ml-auto mr-2"
          value={outputOneFramework.value}
          onChange$={(framework: any) => (outputOneFramework.value = framework)}
          options={outputs}
        />
        <CodeEditor language="html" value={output.value} class="h-[50%]" />
        <Select
          class="ml-auto mr-2"
          value={outputTwoFramework.value}
          onChange$={(framework: any) => (outputTwoFramework.value = framework)}
          options={outputs}
        />
        <CodeEditor language="html" value={output2.value} class="h-[50%]" />
      </div>
    </div>
  );
});
