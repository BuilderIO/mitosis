import { ClassList, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import type monaco from 'monaco-editor';
import { defaultCode } from '~/services/compile';
import { CodeEditor } from './code-editor';

const vueOutput = `
<template>
  <div>
    <input class="input" :value="name" @change="name = $event.target.value" />
    Hello! I can run natively in React, Vue, Svelte, Qwik, and many more
    frameworks!
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
  selector: "my-component, MyComponent",
  template: \`
    <div>
      <input
        class="input"
        [attr.value]="name"
        (input)="name = $event.target.value"
      />

      Hello! I can run natively in React, Vue, Svelte, Qwik, and many more
      frameworks!
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
import {
  $,
  component$,
  useStore,
  useStylesScoped$,
} from "@builder.io/qwik";

export const MyComponent = component$((props) => {
  useStylesScoped$(STYLES);

  const state = useStore({ name: "Steve" });

  return (
    <div>
      <input
        class="input-MyComponent"
        value={state.name}
        onChange$={$((event) => (state.name = event.target.value))}
      />
      Hello! I can run natively in React, Vue, Svelte, Qwik, and many more
      frameworks!
    </div>
  );
});

export default MyComponent;

export const STYLES = \`
.input-MyComponent {
  color: red;
}
\`;

`.trim();

const monacoOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  lineNumbers: 'off',
  fontSize: 12,
};

export const CodeRotator = component$((props: { class: ClassList }) => {
  const currentIndex = useSignal(0);
  const mouseIsOver = useSignal(false);
  const maxIndex = 4;

  useVisibleTask$(() => {
    const interval = setInterval(() => {
      const skip = mouseIsOver.value;
      if (skip) return;
      currentIndex.value = (currentIndex.value + 1) % maxIndex;
    }, 3000);
    return () => clearInterval(interval);
  });

  const inClass = 'opacity-100';
  const outClass = 'opacity-0 translate-y-8';

  return (
    <div class={['flex flex-col', props.class]}>
      <img
        width={100}
        height={80}
        class="object-contain my-4 mx-auto"
        src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F298a3d9f6c3743cb8c3e17d209237da8"
      />
      <div class="flex gap-8">
        <div class="w-[400px] h-[400px] bg-primary-dark border-primary border rounded-lg p-4 pl-0 relative">
          <CodeEditor
            options={monacoOptions}
            language="typescript"
            class="relative inset-0 w-full h-full"
            value={defaultCode}
          />
        </div>
        <div
          class="relative w-[400px] h-[400px]"
          onMouseEnter$={() => {
            mouseIsOver.value = true;
          }}
          onMouseLeave$={() => {
            mouseIsOver.value = false;
          }}
        >
          <div
            class={[
              'absolute inset-0 w-full h-full bg-primary-dark border-primary border rounded-lg p-4 pl-0 transition-all duration-500',
              currentIndex.value === 0 ? inClass : outClass,
            ]}
          >
            <CodeEditor
              options={monacoOptions}
              readOnly
              language="html"
              class="relative inset-0 w-full h-full"
              value={vueOutput}
            />
          </div>
          <div
            class={[
              'absolute inset-0 w-full h-full bg-primary-dark border-primary border rounded-lg p-4 pl-0 transition-all duration-500',
              currentIndex.value === 1 ? inClass : outClass,
            ]}
          >
            <CodeEditor
              options={monacoOptions}
              readOnly
              language="typescript"
              class="relative inset-0 w-full h-full"
              value={angularOutput}
            />
          </div>
          <div
            class={[
              'absolute inset-0 w-full h-full bg-primary-dark border-primary border rounded-lg p-4 pl-0 transition-all duration-500',
              currentIndex.value === 2 ? inClass : outClass,
            ]}
          >
            <CodeEditor
              options={monacoOptions}
              readOnly
              language="html"
              class="relative inset-0 w-full h-full"
              value={svelteOutput}
            />
          </div>
          <div
            class={[
              'absolute inset-0 w-full h-full bg-primary-dark border-primary border rounded-lg p-4 pl-0 transition-all duration-500',
              currentIndex.value === 3 ? inClass : outClass,
            ]}
          >
            <CodeEditor
              options={monacoOptions}
              readOnly
              language="typescript"
              class="relative inset-0 w-full h-full"
              value={qwikOutput}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
