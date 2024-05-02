import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div class="mt-8">
      <h1 class="text-4xl font-bold">Welcome to Mitosis</h1>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Mitosis: Build Components Once, Compile Everywhere',
  meta: [],
};
