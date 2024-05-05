import { component$, useStylesScoped$ } from '@builder.io/qwik';
import { Link, type DocumentHead } from '@builder.io/qwik-city';
import { CodeRotator } from '~/components/code-rotator';

export default component$(() => {
  useStylesScoped$(`
    .wrapper {
      background-image: url('https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Ff234065eeddc488f8189c4fab8e03bde');
      background-size: 15px;
    }
  `);

  return (
    <div class="wrapper">
      <div class="pt-8 flex flex-col px-4 min-h-[90vh] container mx-auto">
        <img
          class="aspect-[4] max-w-[80%] w-[400px] mx-auto mt-[10vh] max-md:mt-[5vh]"
          src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0fdb9aabd10f4205b3b3b56d7b950239"
        />
        <p class="text-xl mx-auto mt-6 text-center">Write components once, run everywhere.</p>
        <div class="flex mx-auto mt-12">
          <Link
            href="/docs/quickstart"
            prefetch
            class="btn bg-primary hover:bg-primary-light text-black py-2 px-4 font-medium rounded"
          >
            Get Started
          </Link>
          <Link
            prefetch
            href="/playground"
            class="btn ml-4 border border-primary hover:bg-primary hover:bg-opacity-20 text-white font-medium py-2 px-4 rounded"
          >
            Playground
          </Link>
        </div>

        <CodeRotator class="mx-auto mt-[5vh] mb-[9vh]" />
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Mitosis - Write components once, run everywhere.',
  meta: [],
};
