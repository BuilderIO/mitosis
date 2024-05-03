import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { server$, useLocation } from '@builder.io/qwik-city';
import { ContentLoaderCode } from 'qwik-content-loader';
import { CodeEditor } from '~/components/code-editor';
import Select from '~/components/select';

export type OutputFramework = 'react' | 'svelte' | 'vue' | 'qwik' | 'angular';
const outputs: OutputFramework[] = ['react', 'svelte', 'vue', 'qwik', 'angular'];

export type InputSyntax = 'jsx' | 'svelte';
const inputs: InputSyntax[] = ['jsx', 'svelte'];

const languageByFramework: Record<OutputFramework, string> = {
  react: 'typescript',
  svelte: 'html',
  vue: 'html',
  qwik: 'typescript',
  angular: 'typescript',
};

export const compile = server$(
  async (code: string, output: OutputFramework, inputSyntax: InputSyntax) => {
    const {
      parseJsx,
      componentToSvelte,
      componentToVue,
      componentToReact,
      componentToQwik,
      componentToAngular,
      parseSvelte,
    } = await import('@builder.io/mitosis');
    const parsed = inputSyntax === 'svelte' ? await parseSvelte(code) : parseJsx(code);
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
  },
);

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
  const location = useLocation();
  const codeFromQueryParam = location.url.searchParams.get('code') as string;
  const outputTab = location.url.searchParams.get('outputTab') as OutputFramework;
  const inputTab = location.url.searchParams.get('inputTab') as InputSyntax;

  const code = useSignal(codeFromQueryParam || defaultCode);
  const inputSyntax = useSignal<InputSyntax>(inputTab || 'jsx');
  const output = useSignal('');
  const outputOneFramework = useSignal<OutputFramework>(outputTab || 'svelte');
  const output2 = useSignal('');
  const outputTwoFramework = useSignal<OutputFramework>('vue');
  const visible = useSignal(false);
  const isThrottling = useSignal(false);
  const isThrottling2 = useSignal(false);
  const throttleTimeout1 = useSignal(0);
  const throttleTimeout2 = useSignal(0);

  useVisibleTask$(() => {
    visible.value = true;
  });

  const throttledCompileOne = $(
    async (code: string, outputFramework: OutputFramework, inputSyntax: InputSyntax) => {
      if (throttleTimeout1.value) {
        clearTimeout(throttleTimeout1.value);
      }
      if (isThrottling.value) {
        throttleTimeout1.value = setTimeout(() => {
          compile(code, outputFramework, inputSyntax);
        }, 80) as any;
        return;
      }
      isThrottling.value = true;
      output.value = await compile(code, outputFramework, inputSyntax);
      isThrottling.value = false;
    },
  );

  const throttledCompileTwo = $(
    async (code: string, outputFramework: OutputFramework, inputSyntax: InputSyntax) => {
      if (throttleTimeout2.value) {
        clearTimeout(throttleTimeout2.value);
      }
      if (isThrottling2.value) {
        throttleTimeout2.value = setTimeout(() => {
          compile(code, outputFramework, inputSyntax);
        }, 80) as any;
        return;
      }
      isThrottling2.value = true;
      output2.value = await compile(code, outputFramework, inputSyntax);
      isThrottling2.value = false;
    },
  );

  useVisibleTask$(async ({ track }) => {
    track(code);
    track(outputOneFramework);
    try {
      await throttledCompileOne(code.value, outputOneFramework.value, inputSyntax.value);
    } catch (err) {
      console.warn(err);
    }
  });

  useVisibleTask$(async ({ track }) => {
    track(code);
    track(outputTwoFramework);
    try {
      await throttledCompileTwo(code.value, outputTwoFramework.value, inputSyntax.value);
    } catch (err) {
      console.warn(err);
    }
  });

  return (
    <div class="relative flex gap-4 mt-4 grow items-stretch max-md:flex-col">
      <div class="w-full flex flex-col max-md:h-[50vh]">
        <div class="flex items-center gap-2 mx-4 my-4 min-h-[50px]">
          <h3 class="text-lg">Input</h3>
          {visible.value && (
            // Workaround weird bug where this doesn't render correctly
            // server side
            <Select
              class="ml-auto"
              value={inputSyntax.value}
              onChange$={(framework: any) => (inputSyntax.value = framework)}
              options={inputs}
            />
          )}
        </div>

        <div class="w-full grow relative">
          <ContentLoaderCode width={300} class="ml-4 mt-4 opacity-10 origin-top-left" />

          {visible.value && (
            <CodeEditor
              language="typescript"
              class="absolute inset-0 h-full w-full"
              defaultValue={code.value}
              onChange$={(newCode) => {
                code.value = newCode;
              }}
            />
          )}
        </div>
      </div>
      <div class="flex gap-4 flex-col w-full h-[90vh] max-md:h-[50vh]">
        <div class="flex items-center gap-2 mx-4 my-4 min-h-[50px]">
          <h3 class="text-lg">Output</h3>
          {visible.value && (
            // Workaround weird bug where this doesn't render correctly
            // server side
            <Select
              class="ml-auto mr-2"
              value={outputOneFramework.value}
              onChange$={(framework: any) => (outputOneFramework.value = framework)}
              options={outputs}
            />
          )}
        </div>
        <div class="h-[50%] relative">
          <ContentLoaderCode width={300} class="ml-4 mt-4 opacity-10 origin-top-left" />
          {visible.value && (
            <CodeEditor
              language={languageByFramework[outputOneFramework.value]}
              value={output.value}
              class="absolute inset-0 h-full w-full"
            />
          )}
        </div>
        <div class="min-h-[50px] max-md:hidden">
          {visible.value && (
            // Workaround weird bug where this doesn't render correctly
            // server side
            <Select
              class="ml-auto mr-2"
              value={outputTwoFramework.value}
              onChange$={(framework: any) => (outputTwoFramework.value = framework)}
              options={outputs}
            />
          )}
        </div>

        <div class="h-[50%] relative max-md:hidden">
          <ContentLoaderCode width={300} class="ml-4 mt-4 opacity-10 origin-top-left" />
          {visible.value && (
            <CodeEditor
              language={languageByFramework[outputTwoFramework.value]}
              value={output2.value}
              class="absolute inset-0 h-full w-full"
            />
          )}
        </div>
      </div>
    </div>
  );
});
