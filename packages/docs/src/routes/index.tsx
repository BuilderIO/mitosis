import { component$ } from '@builder.io/qwik';
import { Link, type DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div class="mt-8 flex flex-col px-4">
      <img
        class="aspect-[4] max-w-full w-[500px] mx-auto mt-[20vh] max-md:mt-[10vh]"
        src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0fdb9aabd10f4205b3b3b56d7b950239"
      />
      <p class="text-xl mx-auto mt-6 text-center">Write components once, run everywhere.</p>
      <div class="flex mx-auto mt-12 mb-[20vh]">
        <Link
          href="/docs/quickstart"
          class="btn bg-primary hover:bg-purple-500 text-black py-2 px-4 font-medium rounded"
        >
          Get Started
        </Link>
        <Link
          href="/playground"
          class="btn ml-4 border border-primary hover:bg-purple-700 text-white font-medium py-2 px-4 rounded"
        >
          Playground
        </Link>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Mitosis - Write components once, run everywhere.',
  meta: [],
};
