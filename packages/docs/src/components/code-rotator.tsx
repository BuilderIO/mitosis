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
import {
  InputSyntax,
  OutputFramework,
  compile,
  defaultCode,
  languageByFramework,
} from '~/services/compile';
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
  vue: 'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F73a54a19443e48fab077e6f21687cd20',
  angular:
    'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F20c9914962994f4a9ca3435c90854e9e',
  svelte:
    'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Ffbe9dfb6bb09448ba4fe5feb4bb0e53e',
  qwik: 'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F8469b183f0dd433aabd0fcd0a373b370',
  mitosis:
    'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fa45d49818e464caaab4f4bb416fed861',
};

const CodePanel = component$(
  (props: {
    code: string;
    isActive: boolean;
    framework: OutputFramework | InputSyntax;
    spoofHtml?: boolean;
    readOnly?: boolean;
    onChange$?: PropFunction<(code: string) => void>;
  }) => {
    return (
      <div
        class={[
          'absolute inset-0 w-full h-full bg-primary-dark overflow-hidden border-primary border border-opacity-50 rounded-lg pl-0 transition-all duration-500',
          props.isActive ? 'opacity-100' : 'opacity-0 translate-y-8 pointer-events-none',
        ]}
      >
        <div class="border-b border-primary border-opacity-50 flex">
          <div class="flex gap-3 items-center px-3 text-sm py-2 bg-primary bg-opacity-20 self-start border-r border-primary border-opacity-50">
            <img
              width={25}
              height={25}
              src={imagesByFramework[props.framework as OutputFramework]}
            />
            {filenameByFramework[props.framework as OutputFramework] || 'mitosis.jsx'}
          </div>
        </div>
        <div class="relative grow-1 h-full p-4">
          {props.spoofHtml ? (
            <div dangerouslySetInnerHTML={placeholderHtml} />
          ) : (
            <CodeEditor
              options={monacoOptions}
              onChange$={props.onChange$}
              readOnly={props.readOnly}
              language={languageByFramework[props.framework as OutputFramework] || 'typescript'}
              class="relative inset-0 w-full h-full -ml-4"
              value={props.code}
            />
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
  const isLoaded = useSignal(false);
  const makeVisible = useSignal(false);
  const spoofInputBox = useSignal(true);

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

  useVisibleTask$(() => {
    isLoaded.value = true;
    spoofInputBox.value = false;
    setTimeout(() => {
      makeVisible.value = true;
    }, 100);

    const interval = setInterval(() => {
      const skip = mouseIsOver.value;
      if (skip) return;
      currentIndex.value = (currentIndex.value + 1) % maxIndex;
    }, 3000);
    return () => clearInterval(interval);
  });

  return (
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
        class="object-contain my-4 mx-auto max-md:hidden"
        src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F298a3d9f6c3743cb8c3e17d209237da8"
      />
      <div class="flex gap-8 max-md:flex-col max-md:mt-8">
        <div class="w-[450px] max-md:h-[290px] max-w-full h-[400px] p-4 pl-0 relative">
          <CodePanel
            onChange$={(code) => throttledCompile(code)}
            code={defaultCode}
            isActive
            spoofHtml={spoofInputBox.value}
            framework="mitosis"
          />
        </div>

        <img
          width={30}
          height={80}
          class="object-contain mx-auto md:hidden -my-4"
          src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F66021c443ad24d858f16cb5c1ea46961"
        />
        <div
          class={[
            'relative w-[450px] max-md:h-[290px] max-w-full h-[400px] transition-all duration-500 delay-200',
            makeVisible.value ? 'opacity-100' : 'opacity-0 translate-y-2',
          ]}
          onMouseEnter$={() => {
            mouseIsOver.value = true;
          }}
          onMouseLeave$={() => {
            mouseIsOver.value = false;
          }}
        >
          {isLoaded.value &&
            frameworkExamples.map((framework, index) => (
              <CodePanel
                readOnly
                code={(outputs as any)[framework as OutputFramework]}
                isActive={currentIndex.value === index}
                framework={framework}
              />
            ))}
        </div>
      </div>
    </div>
  );
});

// SSR hack for monaco. Kinda works!
const placeholderHtml = `
<div class="monaco-editor no-user-select mac showUnused showDeprecated vs-dark" role="code" data-uri="inmemory://model/1" style="width: 416px; height: 366px;"><div data-mprt="3" class="overflow-guard" style="width: 416px; height: 366px;"><div class="margin" role="presentation" aria-hidden="true" style="position: absolute; transform: translate3d(0px, 0px, 0px); contain: strict; top: 0px; height: 672px; width: 26px;"><div class="glyph-margin" style="left: 0px; width: 0px; height: 672px;"></div><div class="margin-view-zones" role="presentation" aria-hidden="true" style="position: absolute;"></div><div class="margin-view-overlays" role="presentation" aria-hidden="true" style="position: absolute; font-family: Menlo, Monaco, &quot;Courier New&quot;, monospace; font-weight: normal; font-size: 12px; font-feature-settings: &quot;liga&quot; 0, &quot;calt&quot; 0; font-variation-settings: normal; line-height: 18px; letter-spacing: 0px; width: 26px; height: 672px;"><div style="top:0px;height:18px;"><div class="current-line" style="width:26px"></div></div><div style="top:18px;height:18px;"></div><div style="top:36px;height:18px;"><div class="cldr codicon codicon-folding-expanded" title="Click to collapse the range." style="left:0px;width:26px;"></div></div><div style="top:54px;height:18px;"></div><div style="top:72px;height:18px;"></div><div style="top:90px;height:18px;"><div class="cldr codicon codicon-folding-expanded" title="Click to collapse the range." style="left:0px;width:26px;"></div></div><div style="top:108px;height:18px;"><div class="cldr codicon codicon-folding-expanded" title="Click to collapse the range." style="left:0px;width:26px;"></div></div><div style="top:126px;height:18px;"><div class="cldr codicon codicon-folding-expanded" title="Click to collapse the range." style="left:0px;width:26px;"></div></div><div style="top:144px;height:18px;"><div class="cldr codicon codicon-folding-expanded" title="Click to collapse the range." style="left:0px;width:26px;"></div></div><div style="top:162px;height:18px;"></div><div style="top:180px;height:18px;"></div><div style="top:198px;height:18px;"></div><div style="top:216px;height:18px;"></div><div style="top:234px;height:18px;"></div><div style="top:252px;height:18px;"></div><div style="top:270px;height:18px;"></div><div style="top:288px;height:18px;"></div><div style="top:306px;height:18px;"></div></div><div class="glyph-margin-widgets" style="position: absolute; top: 0px;"></div></div><div class="monaco-scrollable-element editor-scrollable vs-dark mac" role="presentation" data-mprt="6" style="position: absolute; overflow: hidden; left: 26px; width: 390px; height: 366px;"><div class="lines-content monaco-editor-background" style="position: absolute; overflow: hidden; width: 1.67772e+07px; height: 1.67772e+07px; transform: translate3d(0px, 0px, 0px); contain: strict; top: 0px; left: 0px;"><div class="view-overlays" role="presentation" aria-hidden="true" style="position: absolute; font-family: Menlo, Monaco, &quot;Courier New&quot;, monospace; font-weight: normal; font-size: 12px; font-feature-settings: &quot;liga&quot; 0, &quot;calt&quot; 0; font-variation-settings: normal; line-height: 18px; letter-spacing: 0px; height: 0px; width: 663px;"><div style="top:0px;height:18px;"></div><div style="top:18px;height:18px;"></div><div style="top:36px;height:18px;"><div class="cdr squiggly-unnecessary" style="left:260px;width:36px;"></div></div><div style="top:54px;height:18px;"><div class="core-guide core-guide-indent lvl-0 vertical" style="left:0px;width:7.2265625px"></div></div><div style="top:72px;height:18px;"><div class="core-guide core-guide-indent lvl-0 vertical" style="left:0px;width:7.2265625px"></div></div><div style="top:90px;height:18px;"><div class="core-guide core-guide-indent lvl-0 vertical" style="left:0px;width:7.2265625px"></div></div><div style="top:108px;height:18px;"><div class="core-guide core-guide-indent lvl-0 vertical" style="left:0px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-1 vertical" style="left:14.453125px;width:7.2265625px"></div></div><div style="top:126px;height:18px;"><div class="core-guide core-guide-indent lvl-0 vertical" style="left:0px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-1 vertical" style="left:14.453125px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-2 vertical" style="left:28.90625px;width:7.2265625px"></div></div><div style="top:144px;height:18px;"><div class="core-guide core-guide-indent lvl-0 vertical" style="left:0px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-1 vertical" style="left:14.453125px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-2 vertical" style="left:28.90625px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-3 vertical" style="left:43.359375px;width:7.2265625px"></div></div><div style="top:162px;height:18px;"><div class="core-guide core-guide-indent lvl-0 vertical" style="left:0px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-1 vertical" style="left:14.453125px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-2 vertical" style="left:28.90625px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-3 vertical" style="left:43.359375px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-4 vertical" style="left:57.8125px;width:7.2265625px"></div></div><div style="top:180px;height:18px;"><div class="core-guide core-guide-indent lvl-0 vertical" style="left:0px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-1 vertical" style="left:14.453125px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-2 vertical" style="left:28.90625px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-3 vertical" style="left:43.359375px;width:7.2265625px"></div></div><div style="top:198px;height:18px;"><div class="core-guide core-guide-indent lvl-0 vertical" style="left:0px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-1 vertical" style="left:14.453125px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-2 vertical" style="left:28.90625px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-3 vertical" style="left:43.359375px;width:7.2265625px"></div></div><div style="top:216px;height:18px;"><div class="core-guide core-guide-indent lvl-0 vertical" style="left:0px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-1 vertical" style="left:14.453125px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-2 vertical" style="left:28.90625px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-3 vertical" style="left:43.359375px;width:7.2265625px"></div></div><div style="top:234px;height:18px;"><div class="core-guide core-guide-indent lvl-0 vertical" style="left:0px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-1 vertical" style="left:14.453125px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-2 vertical" style="left:28.90625px;width:7.2265625px"></div></div><div style="top:252px;height:18px;"><div class="core-guide core-guide-indent lvl-0 vertical" style="left:0px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-1 vertical" style="left:14.453125px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-2 vertical" style="left:28.90625px;width:7.2265625px"></div></div><div style="top:270px;height:18px;"><div class="core-guide core-guide-indent lvl-0 vertical" style="left:0px;width:7.2265625px"></div><div class="core-guide core-guide-indent lvl-1 vertical" style="left:14.453125px;width:7.2265625px"></div></div><div style="top:288px;height:18px;"><div class="core-guide core-guide-indent lvl-0 vertical" style="left:0px;width:7.2265625px"></div></div><div style="top:306px;height:18px;"></div></div><div role="presentation" aria-hidden="true" class="view-rulers"></div><div class="view-zones" role="presentation" aria-hidden="true" style="position: absolute;"></div><div class="view-lines monaco-mouse-cursor-text" role="presentation" aria-hidden="true" data-mprt="8" style="position: absolute; font-family: Menlo, Monaco, &quot;Courier New&quot;, monospace; font-weight: normal; font-size: 12px; font-feature-settings: &quot;liga&quot; 0, &quot;calt&quot; 0; font-variation-settings: normal; line-height: 18px; letter-spacing: 0px; width: 663px; height: 672px;"><div style="top:0px;height:18px;" class="view-line"><span><span class="mtk8">import</span><span class="mtk1">&nbsp;</span><span class="mtk9 bracket-highlighting-0">{</span><span class="mtk1">&nbsp;useState&nbsp;</span><span class="mtk9 bracket-highlighting-0">}</span><span class="mtk1">&nbsp;</span><span class="mtk8">from</span><span class="mtk1">&nbsp;</span><span class="mtk5">"@builder.io/mitosis"</span><span class="mtk9">;</span></span></div><div style="top:18px;height:18px;" class="view-line"><span><span></span></span></div><div style="top:36px;height:18px;" class="view-line"><span><span class="mtk8">export</span><span class="mtk1">&nbsp;</span><span class="mtk8">default</span><span class="mtk1">&nbsp;</span><span class="mtk8">function</span><span class="mtk1">&nbsp;</span><span class="mtk22">MyComponent</span><span class="mtk9 bracket-highlighting-0">(</span><span class="mtk1 squiggly-inline-unnecessary">props</span><span class="mtk9 bracket-highlighting-0">)</span><span class="mtk1">&nbsp;</span><span class="mtk9 bracket-highlighting-0">{</span></span></div><div style="top:54px;height:18px;" class="view-line"><span><span class="mtk1">&nbsp;&nbsp;</span><span class="mtk8">const</span><span class="mtk1">&nbsp;</span><span class="mtk9 bracket-highlighting-1">[</span><span class="mtk1">name</span><span class="mtk9">,</span><span class="mtk1">&nbsp;setName</span><span class="mtk9 bracket-highlighting-1">]</span><span class="mtk1">&nbsp;</span><span class="mtk9">=</span><span class="mtk1">&nbsp;useState</span><span class="mtk9 bracket-highlighting-1">(</span><span class="mtk5">"Steve"</span><span class="mtk9 bracket-highlighting-1">)</span><span class="mtk9">;</span></span></div><div style="top:72px;height:18px;" class="view-line"><span><span></span></span></div><div style="top:90px;height:18px;" class="view-line"><span><span class="mtk1">&nbsp;&nbsp;</span><span class="mtk8">return</span><span class="mtk1">&nbsp;</span><span class="mtk9 bracket-highlighting-1">(</span></span></div><div style="top:108px;height:18px;" class="view-line"><span><span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">&lt;</span><span class="mtk1">div</span><span class="mtk9">&gt;</span></span></div><div style="top:126px;height:18px;" class="view-line"><span><span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">&lt;</span><span class="mtk1">input</span></span></div><div style="top:144px;height:18px;" class="view-line"><span><span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;css</span><span class="mtk9">=</span><span class="mtk9 bracket-highlighting-2">{</span><span class="mtk9 bracket-highlighting-3">{</span></span></div><div style="top:162px;height:18px;" class="view-line"><span><span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;color</span><span class="mtk9">:</span><span class="mtk1">&nbsp;</span><span class="mtk5">"red"</span><span class="mtk9">,</span></span></div><div style="top:180px;height:18px;" class="view-line"><span><span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9 bracket-highlighting-3">}</span><span class="mtk9 bracket-highlighting-2">}</span></span></div><div style="top:198px;height:18px;" class="view-line"><span><span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;value</span><span class="mtk9">=</span><span class="mtk9 bracket-highlighting-2">{</span><span class="mtk1">name</span><span class="mtk9 bracket-highlighting-2">}</span></span></div><div style="top:216px;height:18px;" class="view-line"><span><span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;onChange</span><span class="mtk9">=</span><span class="mtk9 bracket-highlighting-2">{</span><span class="mtk9 bracket-highlighting-3">(</span><span class="mtk1">event</span><span class="mtk9 bracket-highlighting-3">)</span><span class="mtk1">&nbsp;</span><span class="mtk9">=&gt;</span><span class="mtk1">&nbsp;setName</span><span class="mtk9 bracket-highlighting-3">(</span><span class="mtk1">event</span><span class="mtk9">.</span><span class="mtk1">target</span><span class="mtk9">.</span><span class="mtk1">value</span><span class="mtk9 bracket-highlighting-3">)</span><span class="mtk9 bracket-highlighting-2">}</span></span></div><div style="top:234px;height:18px;" class="view-line"><span><span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/&gt;</span></span></div><div style="top:252px;height:18px;" class="view-line"><span><span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk22">Hello</span><span class="mtk9">!</span><span class="mtk1">&nbsp;</span><span class="mtk22">I</span><span class="mtk1">&nbsp;can&nbsp;run&nbsp;natively&nbsp;</span><span class="mtk8">in</span><span class="mtk1">&nbsp;</span><span class="mtk22">React</span><span class="mtk9">,</span><span class="mtk1">&nbsp;</span><span class="mtk22">Vue</span><span class="mtk9">,</span><span class="mtk1">&nbsp;</span><span class="mtk22">Svelte</span><span class="mtk9">,</span><span class="mtk1">&nbsp;</span><span class="mtk22">Qwik</span><span class="mtk9">,</span><span class="mtk1">&nbsp;and&nbsp;many&nbsp;more&nbsp;frameworks</span><span class="mtk9">!</span></span></div><div style="top:270px;height:18px;" class="view-line"><span><span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="mtk9">&lt;/</span><span class="mtk1">div</span><span class="mtk9">&gt;</span></span></div><div style="top:288px;height:18px;" class="view-line"><span><span class="mtk1">&nbsp;&nbsp;</span><span class="mtk9 bracket-highlighting-1">)</span><span class="mtk9">;</span></span></div><div style="top:306px;height:18px;" class="view-line"><span><span class="mtk9 bracket-highlighting-0">}</span></span></div></div><div data-mprt="1" class="contentWidgets" style="position: absolute; top: 0px;"><div class="lightBulbWidget" widgetid="LightBulbWidget" style="position: absolute; display: none; visibility: hidden; max-width: 390px;"></div></div><div role="presentation" aria-hidden="true" class="cursors-layer cursor-line-style cursor-solid"><div class="cursor  monaco-mouse-cursor-text " style="height: 18px; top: 0px; left: 0px; font-family: Menlo, Monaco, &quot;Courier New&quot;, monospace; font-weight: normal; font-size: 12px; font-feature-settings: &quot;liga&quot; 0, &quot;calt&quot; 0; font-variation-settings: normal; line-height: 18px; letter-spacing: 0px; display: block; visibility: hidden; padding-left: 0px; width: 2px;"></div></div></div><div role="presentation" aria-hidden="true" class="invisible scrollbar horizontal fade" style="position: absolute; width: 390px; height: 12px; left: 0px; bottom: 0px;"><div class="slider" style="position: absolute; top: 0px; left: 0px; height: 12px; transform: translate3d(0px, 0px, 0px); contain: strict; width: 229px;"></div></div><canvas class="decorationsOverviewRuler" aria-hidden="true" width="28" height="732" style="position: absolute; transform: translate3d(0px, 0px, 0px); contain: strict; top: 0px; right: 0px; width: 14px; height: 366px; display: block;"></canvas><div role="presentation" aria-hidden="true" class="invisible scrollbar vertical" style="position: absolute; width: 0px; height: 366px; right: 0px; top: 0px;"><div class="slider" style="position: absolute; top: 0px; left: 0px; width: 14px; transform: translate3d(0px, 0px, 0px); contain: strict; height: 199px;"></div></div></div><div role="presentation" aria-hidden="true" style="width: 416px;"></div><textarea data-mprt="7" class="inputarea monaco-mouse-cursor-text" wrap="off" autocorrect="off" autocapitalize="off" autocomplete="off" spellcheck="false" aria-label="Editor content;Press Alt+F1 for Accessibility Options." aria-required="false" tabindex="0" role="textbox" aria-roledescription="editor" aria-multiline="true" aria-autocomplete="both" style="tab-size: 14.4531px; font-family: Menlo, Monaco, &quot;Courier New&quot;, monospace; font-weight: normal; font-size: 12px; font-feature-settings: &quot;liga&quot; 0, &quot;calt&quot; 0; font-variation-settings: normal; line-height: 18px; letter-spacing: 0px; top: 0px; left: 26px; width: 1px; height: 18px;"></textarea><div style="position: absolute; top: 0px; left: 0px; width: 0px; height: 0px;" class="monaco-editor-background textAreaCover"></div><div data-mprt="4" class="overlayWidgets" style="width: 416px;"><div class="sticky-widget" widgetid="editor.contrib.stickyScrollWidget" style="width: 402px; position: absolute; display: none;"><div class="sticky-widget-line-numbers" role="none" style="width: 26px;"></div><div class="sticky-widget-lines-scrollable" style="--vscode-editorStickyScroll-scrollableWidth: 649px;"><div class="sticky-widget-lines" role="list" style="left: 0px;"></div></div></div></div><div data-mprt="9" class="minimap slider-mouseover" role="presentation" aria-hidden="true" style="position: absolute; left: 0px; width: 0px; height: 366px;"><div class="minimap-shadow-hidden" style="height: 366px;"></div><canvas width="0" height="732" style="position: absolute; left: 0px; width: 0px; height: 366px;"></canvas><canvas class="minimap-decorations-layer" width="0" height="732" style="position: absolute; left: 0px; width: 0px; height: 366px;"></canvas><div class="minimap-slider" style="position: absolute; transform: translate3d(0px, 0px, 0px); contain: strict; width: 0px;"><div class="minimap-slider-horizontal" style="position: absolute; width: 0px; height: 0px;"></div></div></div><div role="presentation" aria-hidden="true" class="blockDecorations-container"></div></div><div data-mprt="2" class="overflowingContentWidgets"><div widgetid="editor.contrib.resizableContentHoverWidget" style="position: absolute; height: 26px; width: 150px; z-index: 50; display: none; visibility: hidden; max-width: 1401px;"><div class="monaco-sash mac vertical" style="left: 148px;"></div><div class="monaco-sash mac vertical" style="left: -2px;"></div><div class="monaco-sash orthogonal-edge-north mac horizontal" style="top: -2px;"><div class="orthogonal-drag-handle start"></div><div class="orthogonal-drag-handle end"></div></div><div class="monaco-sash orthogonal-edge-south mac horizontal" style="top: 24px;"><div class="orthogonal-drag-handle start"></div><div class="orthogonal-drag-handle end"></div></div><div class="monaco-hover hidden" tabindex="0" role="tooltip"><div class="monaco-scrollable-element  mac" role="presentation" style="position: relative; overflow: hidden;"><div class="monaco-hover-content" style="overflow: hidden;"></div><div role="presentation" aria-hidden="true" class="invisible scrollbar horizontal" style="position: absolute;"><div class="slider" style="position: absolute; top: 0px; left: 0px; height: 10px; transform: translate3d(0px, 0px, 0px); contain: strict;"></div></div><div role="presentation" aria-hidden="true" class="invisible scrollbar vertical" style="position: absolute;"><div class="slider" style="position: absolute; top: 0px; left: 0px; width: 10px; transform: translate3d(0px, 0px, 0px); contain: strict;"></div></div><div class="shadow"></div><div class="shadow"></div><div class="shadow"></div></div></div></div></div><div data-mprt="5" class="overflowingOverlayWidgets"></div></div>
`;
