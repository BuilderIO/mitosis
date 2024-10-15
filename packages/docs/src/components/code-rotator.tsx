import {
  $,
  ClassList,
  PropFunction,
  component$,
  useSignal,
  useStore,
  useVisibleTask$,
} from '@builder.io/qwik';
import type monaco from 'monaco-editor';
import Prism from 'prismjs';
import {
  InputSyntax,
  OutputFramework,
  compile,
  defaultCode,
  languageByFramework,
} from '~/services/compile';
import { CodeEditor } from './code-editor';

// Set to global so that prism language plugins can find it.
const _global =
  (typeof globalThis !== 'undefined' && globalThis) ||
  (typeof global !== 'undefined' && global) ||
  (typeof self !== 'undefined' && self) ||
  (typeof this !== 'undefined' && this) ||
  (typeof window !== 'undefined' && window);
(_global as any).PRISM = Prism;

import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

const INTERACTIVE = false;

const vueOutput = `
<template>
  <div>
    <input class="input" :value="name" @change="name = $event.target.value" />
    Hello! I can run natively in React, Vue, Svelte, Qwik, and many more frameworks!
  </div>
</template>

<script setup>
import { ref } from "vue";

const name = ref("Steve");
</script>

<style scoped>
.input {
  color: red;
}
</style>
`.trim();

const svelteOutput = `
<script>
  let name = "Steve";
</script>

<div>
  <input class="input" bind:value={name} />
  Hello! I can run natively in React, Vue, Svelte, Qwik, and many more frameworks!
</div>

<style>
  .input {
    color: red;
  }
</style>
`.trim();

const angularOutput = `
import { Component } from "@angular/core";

@Component({
  selector: "my-component",
  template: \`
    <div>
      <input
        class="input"
        [attr.value]="name"
        (input)="name = $event.target.value"
      />

      Hello! I can run natively in React, Vue, Svelte, Qwik, and many more frameworks!
    </div>
  \`,
  styles: [
    \`
      .input {
        color: red;
      }
    \`,
  ],
})
export default class MyComponent {
  name = "Steve";
}
`.trim();

const qwikOutput = `
import { component$, useStore, useStylesScoped$ } from "@builder.io/qwik";

export const MyComponent = component$((props) => {
  useStylesScoped$(\`
    .input-MyComponent {
      color: red;
    }\`
  );
  const state = useStore({ name: "Steve" });

  return (
    <div>
      <input
        class="input-MyComponent"
        value={state.name}
        onChange$={(event) => (state.name = event.target.value)}
      />
      Hello! I can run natively in React, Vue, Svelte, Qwik, and many more frameworks!
    </div>
  );
});
`.trim();

const frameworkExamples: OutputFramework[] = ['vue', 'angular', 'svelte', 'qwik'];

const monacoOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  lineNumbers: 'off',
  fontSize: 12,
};

const filenameByFramework: Partial<Record<OutputFramework, string>> = {
  vue: 'component.vue',
  angular: 'angular.ts',
  svelte: 'component.svelte',
  qwik: 'qwik.tsx',
};

const imagesByFramework: Partial<Record<OutputFramework, string>> = {
  vue: 'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F73a54a19443e48fab077e6f21687cd20?format=webp&width=50',
  angular:
    'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F20c9914962994f4a9ca3435c90854e9e?format=webp&width=50',
  svelte:
    'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Ffbe9dfb6bb09448ba4fe5feb4bb0e53e?format=webp&width=50',
  qwik: 'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F8469b183f0dd433aabd0fcd0a373b370',
  mitosis:
    'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fa45d49818e464caaab4f4bb416fed861',
};

const CodePanel = component$(
  (props: {
    code: string;
    isActive: boolean;
    framework: OutputFramework | InputSyntax;
    readOnly?: boolean;
    onChange$?: PropFunction<(code: string) => void>;
    class?: ClassList;
    activeIndex?: number;
    index?: number;
  }) => {
    const language = languageByFramework[props.framework as OutputFramework] || 'typescript';
    const useIndexInsteadOfActive = props.activeIndex !== undefined;

    const isNextUp = props.index === (props.activeIndex! + 1) % frameworkExamples.length;
    const wasLastUp =
      props.index ===
      (props.activeIndex! - 1 + frameworkExamples.length) % frameworkExamples.length;

    return (
      <div
        class={[
          'bg-primary-dark overflow-hidden border-primary border border-opacity-50 rounded-lg pl-0 transition-all duration-500',
          useIndexInsteadOfActive && isNextUp
            ? 'opacity-0 blur-sm translate-y-1 z-10 scale-[0.92] pointer-events-none'
            : useIndexInsteadOfActive && wasLastUp
            ? 'opacity-0 blur-sm -translate-y-1 z-40 scale-[1.08] pointer-events-none'
            : '',
          props.isActive ? 'opacity-100 z-30' : 'z-0 opacity-0 translate-y-2 pointer-events-none',
          props.class,
        ]}
      >
        <div class="border-b border-primary border-opacity-50 flex">
          <div class="flex gap-3 items-center px-3 text-sm py-2 bg-primary bg-opacity-20 self-start border-r border-primary border-opacity-50">
            <img
              alt={`${props.framework} logo`}
              width={25}
              height={25}
              src={imagesByFramework[props.framework as OutputFramework]}
            />
            {filenameByFramework[props.framework as OutputFramework] || 'mitosis.jsx'}
          </div>
        </div>
        <div class="relative grow-1 h-full p-4">
          {INTERACTIVE ? (
            <CodeEditor
              options={monacoOptions}
              onChange$={props.onChange$}
              readOnly={props.readOnly}
              language={language}
              class="relative inset-0 w-full h-full -ml-4"
              value={props.code}
            />
          ) : (
            <div class="hp-prose prose prose-invert">
              <pre
                class="-m-2 !text-xs"
                dangerouslySetInnerHTML={Prism.highlight(
                  props.code,
                  Prism.languages[language === 'typescript' ? 'tsx' : language],
                  language === 'typescript' ? 'tsx' : language,
                )}
              />
            </div>
          )}
        </div>
      </div>
    );
  },
);

export const CodeRotator = component$((props: { class: ClassList }) => {
  const currentIndex = useSignal(0);
  const mouseIsOver = useSignal(false);
  const maxIndex = frameworkExamples.length;
  const isThrottling = useSignal(false);
  const throttleTimeout = useSignal(0);
  const isLoaded = useSignal(!INTERACTIVE);
  const makeVisible = useSignal(!INTERACTIVE);

  const outputs = useStore({
    vue: vueOutput,
    angular: angularOutput,
    svelte: svelteOutput,
    qwik: qwikOutput,
  });

  const compileAll = $(async (code: string) => {
    await Promise.allSettled(
      frameworkExamples.map(async (framework) => {
        const output = await compile(code, framework as OutputFramework, 'jsx');
        (outputs as any)[framework] = output.replace(
          /\n?\n?import { useStore } from "..";\n?/g,
          '',
        );
      }),
    );
  });

  const throttledCompile = $(async (code: string) => {
    if (throttleTimeout.value) {
      clearTimeout(throttleTimeout.value);
    }
    if (isThrottling.value) {
      throttleTimeout.value = setTimeout(async () => {
        isThrottling.value = true;
        await compileAll(code);
        isThrottling.value = false;
      }, 100) as any;
      return;
    }
    isThrottling.value = true;
    await compileAll(code);
    isThrottling.value = false;
  });

  if (INTERACTIVE) {
    useVisibleTask$(() => {
      isLoaded.value = true;
      setTimeout(() => {
        makeVisible.value = true;
      }, 100);
    });
  }

  useVisibleTask$(() => {
    currentIndex.value = (currentIndex.value + 1) % maxIndex;
    const interval = setInterval(() => {
      const skip = mouseIsOver.value;
      if (skip) return;
      currentIndex.value = (currentIndex.value + 1) % maxIndex;
    }, 3000);
    return () => clearInterval(interval);
  });

  return !isLoaded.value ? null : (
    <div
      class={[
        'flex flex-col max-w-full transition-all duration-700',
        makeVisible.value ? 'opacity-100' : 'opacity-0 translate-y-2',
        props.class,
      ]}
    >
      <img
        width={100}
        height={80}
        alt="Arrow pointing right"
        class="object-contain my-4 mx-auto max-md:hidden"
        src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F298a3d9f6c3743cb8c3e17d209237da8"
      />
      <div class="flex gap-8 max-md:flex-col max-md:mt-8">
        <div class="w-[450px] max-lg:w-1/2 max-md:w-full max-md:h-[290px] max-w-full relative">
          <CodePanel
            onChange$={(code) => throttledCompile(code)}
            code={defaultCode}
            isActive
            framework="mitosis"
          />
        </div>

        <img
          width={25}
          height={60}
          alt="Arrow pointing down"
          class="object-contain mx-auto md:hidden mt-14 -mb-6"
          src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F66021c443ad24d858f16cb5c1ea46961"
        />
        <div
          class={[
            'relative w-[450px] max-lg:w-1/2 max-md:w-full min-h-[540px] max-md:h-[290px] max-w-full transition-all duration-500 delay-200',
            makeVisible.value ? 'opacity-100' : 'opacity-0 translate-y-2',
          ]}
          onMouseEnter$={() => {
            if (INTERACTIVE) {
              mouseIsOver.value = true;
            }
          }}
          onMouseLeave$={() => {
            mouseIsOver.value = false;
          }}
        >
          {frameworkExamples.map((framework, index) => (
            <CodePanel
              class="absolute w-full"
              readOnly
              code={(outputs as any)[framework as OutputFramework]}
              isActive={currentIndex.value === index}
              index={index}
              activeIndex={currentIndex.value}
              framework={framework}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
