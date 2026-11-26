import { componentToAngular } from '@/generators/angular';
import { componentToReact } from '@/generators/react';
import { componentToReactNative } from '@/generators/react-native';
import { componentToSolid } from '@/generators/solid';
import { componentToSvelte } from '@/generators/svelte';
import { componentToVue } from '@/generators/vue';
import { describe, expect, test } from 'vitest';
import { parseSvelte } from '..';

/**
 * Regression test for https://github.com/BuilderIO/mitosis/issues/1064
 *
 * A `\n` escape sequence used inside a string in state code (here: splitting
 * textarea content into rows) must survive code generation for every target.
 * Previously:
 * - react / react-native turned `split("\n")` into `split(" ")`
 * - angular / vue / svelte emitted a literal line break inside the string
 * - solid threw `SyntaxError: Unterminated string literal`
 */
const svelteInput = `
<script lang="ts">
    let textareaContent = "";
    let rows;
    $: rows = textareaContent.split("\\n").filter(row => row != "");
</script>

<textarea
    bind:value={textareaContent}
    rows="10"
    cols="20"
/>

<ul>
    {#each rows as row}
        <li>{row}</li>
    {/each}
</ul>
`;

const generators = {
  angular: componentToAngular,
  react: componentToReact,
  reactNative: componentToReactNative,
  solid: componentToSolid,
  svelte: componentToSvelte,
  vue: componentToVue,
} as const;

describe('newline escape sequences in state code (#1064)', () => {
  for (const [target, generator] of Object.entries(generators)) {
    test(`${target} preserves the \\n escape when splitting on it`, async () => {
      const component = await parseSvelte(svelteInput);
      const output = generator({})({ component });

      // the escape sequence is preserved (either quote style is fine)
      expect(output).toMatch(/split\((['"])\\n\1\)/);
      // it was not collapsed into a space
      expect(output).not.toMatch(/split\((['"]) \1\)/);
      // it was not turned into a literal line break inside the string
      expect(output).not.toMatch(/split\((['"])\n/);
    });
  }
});
