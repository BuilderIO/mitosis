import { component$ } from '@builder.io/qwik';
import { Link, type DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div class="mt-8 flex flex-col">
      <img
        class="aspect-[4] max-w-full w-[500px] mx-auto mt-24"
        src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0fdb9aabd10f4205b3b3b56d7b950239"
      />
      <p class="text-xl mx-auto mt-6">Write components once, run everywhere.</p>
      <div class="flex mx-auto mt-12">
        <Link
          href="/docs/quickstart"
          class="btn bg-neutral-600 hover:bg-neutral-500 text-white font-bold py-2 px-4 rounded"
        >
          Get Started
        </Link>
        <Link
          href="/playground"
          class="btn ml-4 border border-neutral-600 hover:bg-neutral-700 text-white font-bold py-2 px-4 rounded"
        >
          Try the Playground
        </Link>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Mitosis - Write components once, run everywhere.',
  meta: [],
};
