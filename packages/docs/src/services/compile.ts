import type { MitosisComponent } from '@builder.io/mitosis';
import { server$ } from '@builder.io/qwik-city';

export type OutputFramework =
  | 'react'
  | 'svelte'
  | 'vue'
  | 'qwik'
  | 'angular'
  | 'mitosis'
  | 'json'
  | 'marko'
  | 'reactNative'
  | 'lit'
  | 'solid'
  | 'preact'
  | 'stencil'
  | 'alpine';

export const outputs: OutputFramework[] = [
  'react',
  'svelte',
  'vue',
  'qwik',
  'angular',
  'mitosis',
  'json',
  'marko',
  'lit',
  'solid',
  'preact',
  'stencil',
  'reactNative',
  'alpine',
];

export type InputSyntax = 'jsx' | 'svelte';
export const inputs: InputSyntax[] = ['jsx', 'svelte'];

export const languageByFramework: Record<OutputFramework, string> = {
  react: 'typescript',
  svelte: 'html',
  vue: 'html',
  qwik: 'typescript',
  angular: 'typescript',
  mitosis: 'typescript',
  json: 'json',
  marko: 'html',
  lit: 'typescript',
  solid: 'typescript',
  preact: 'typescript',
  stencil: 'typescript',
  reactNative: 'typescript',
  alpine: 'html',
};

const getOutputGenerator = async ({ output, options }: { output: OutputFramework, options: any }) => {
  const { targets } = await import('@builder.io/mitosis');

  switch (output) {
    case 'json':
      return ({ component }: { component: MitosisComponent }) => JSON.stringify(component, null, 2);
    default:
      if (output in targets) {
        return targets[output](options)
      }

      throw new Error(`unexpected output: \`${output}\`.`);
  }
};

export type CompileArgs = {
  code: string, output: OutputFramework, inputSyntax: InputSyntax, outputOptions?: any
}

export const compile = server$(
  async ({code, output, inputSyntax, outputOptions}: CompileArgs) => {
    const { parseJsx, parseSvelte } = await import('@builder.io/mitosis');
    const parsed = inputSyntax === 'svelte' ? await parseSvelte(code) : parseJsx(code);

    const outputGenerator = await getOutputGenerator({ output, options: outputOptions });

    console.log('getting generator with: ', {output, outputOptions});
    
    const outputCode = outputGenerator({ component: parsed });

    return outputCode;
  },
);

export const defaultCode = `
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
      Hello! I can run natively in React, Vue, Svelte, Qwik, and many more frameworks!
    </div>
  );
}
`.trim();
