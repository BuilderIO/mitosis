import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$, useLocation } from '@builder.io/qwik-city';
import { ContentLoaderCode } from 'qwik-content-loader';
import { CodeEditor } from '~/components/code-editor';
import Select from '~/components/select';
import {
  InputSyntax,
  OutputFramework,
  compile,
  defaultCode,
  inputs,
  languageByFramework,
  outputs,
} from '~/services/compile';

const defaultTopTab: OutputFramework = 'vue';
const defaultBottomTab: OutputFramework = 'angular';
const defaultInputTab = 'jsx';

const useOutput1 = routeLoader$(async (requestEvent) => {
  const code = (requestEvent.url.searchParams.get('code') as string) || defaultCode;
  const outputTab = requestEvent.url.searchParams.get('outputTab') as OutputFramework;
  const inputTab = requestEvent.url.searchParams.get('inputTab') as InputSyntax;

  const output = await compile(
    code || defaultCode,
    outputTab || defaultTopTab,
    inputTab || defaultInputTab,
  ).catch((err) => {
    console.error(err);
    return '';
  });
  return output;
});

const useOutput2 = routeLoader$(async (requestEvent) => {
  const code = (requestEvent.url.searchParams.get('code') as string) || defaultCode;
  const outputTab = requestEvent.url.searchParams.get('outputTab') as OutputFramework;
  const inputTab = requestEvent.url.searchParams.get('inputTab') as InputSyntax;

  const output = await compile(
    code || defaultCode,
    outputTab || defaultBottomTab,
    inputTab || defaultInputTab,
  ).catch((err) => {
    console.error(err);
    return '';
  });
  return output;
});

export default component$(() => {
  const location = useLocation();
  const codeFromQueryParam = location.url.searchParams.get('code') as string;
  const outputTab = location.url.searchParams.get('outputTab') as OutputFramework;
  const inputTab = location.url.searchParams.get('inputTab') as InputSyntax;
  const loaderOutput1 = useOutput1().value;
  const loaderOutput2 = useOutput2().value;

  const code = useSignal(codeFromQueryParam || defaultCode);
  const inputSyntax = useSignal<InputSyntax>(inputTab || defaultInputTab);
  const output = useSignal(loaderOutput1 || '');
  const outputOneFramework = useSignal<OutputFramework>(outputTab || defaultTopTab);
  const output2 = useSignal(loaderOutput2 || '');
  const outputTwoFramework = useSignal<OutputFramework>(defaultBottomTab);
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
        throttleTimeout1.value = setTimeout(async () => {
          isThrottling.value = true;
          output.value = await compile(code, outputFramework, inputSyntax);
          isThrottling.value = false;
        }, 100) as any;
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
        throttleTimeout2.value = setTimeout(async () => {
          isThrottling.value = true;
          output2.value = await compile(code, outputFramework, inputSyntax);
          isThrottling.value = false;
        }, 100) as any;
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

  // Always reload on window refocus to ensure cloudflare workers are warm
  useVisibleTask$(({ cleanup }) => {
    const fn = () => {
      throttledCompileOne(code.value, outputOneFramework.value, inputSyntax.value);
      throttledCompileTwo(code.value, outputTwoFramework.value, inputSyntax.value);
    };
    addEventListener('focus', fn);
    cleanup(() => {
      removeEventListener('focus', fn);
    });
  });

  return (
    <div class="relative flex gap-4 grow items-stretch max-md:flex-col bg-primary-dark">
      <div class="w-full flex flex-col max-md:h-[50vh]">
        <div class="flex items-center gap-2 mx-4 my-2 mb-4 min-h-[50px]">
          <h3 class="ml-4 text-lg">Input</h3>
          {visible.value && (
            // Workaround weird bug where this doesn't render correctly
            // server side
            <Select
              class="ml-auto"
              value={inputSyntax.value}
              onChange$={(syntax: any) => {
                compile(
                  code.value,
                  syntax === 'jsx' ? 'mitosis' : 'svelte',
                  inputSyntax.value,
                ).then((output) => {
                  code.value = output.replace(/\n?\n?import { useStore } from "..";\n?/g, '');
                  inputSyntax.value = syntax;
                });
              }}
              options={inputs}
            />
          )}
        </div>

        <div class="w-full grow relative">
          <ContentLoaderCode width={400} class="ml-16 mt-3 opacity-10 origin-top-left" />

          {visible.value && (
            <CodeEditor
              key={inputSyntax.value}
              language={inputSyntax.value === 'jsx' ? 'typescript' : 'html'}
              class="absolute inset-0 h-full w-full"
              defaultValue={code.value}
              onChange$={(newCode) => {
                code.value = newCode;
              }}
            />
          )}
        </div>
      </div>
      <div class="flex gap-4 flex-col w-full h-[90vh] max-md:h-[50vh] border-l border-primary border-opacity-50 max-md:border-l-0 max-md:border-t">
        <div class="flex items-center gap-2 mx-4 my-2 mb-0 min-h-[50px]">
          <h3 class="ml-4 text-lg">Output</h3>
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
          <ContentLoaderCode width={400} class="ml-16 mt-3 opacity-10 origin-top-left" />
          {visible.value && (
            <CodeEditor
              language={languageByFramework[outputOneFramework.value]}
              value={output.value}
              class="absolute inset-0 h-full w-full"
              readOnly
            />
          )}
        </div>
        <div class="min-h-[50px] max-md:hidden flex items-center border-primary border-opacity-50 border-t -mt-4 pt-4">
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
          <ContentLoaderCode width={400} class="ml-16 mt-3 opacity-10 origin-top-left" />
          {visible.value && (
            <CodeEditor
              language={languageByFramework[outputTwoFramework.value]}
              value={output2.value}
              class="absolute inset-0 h-full w-full"
              readOnly
            />
          )}
        </div>
      </div>
    </div>
  );
});
