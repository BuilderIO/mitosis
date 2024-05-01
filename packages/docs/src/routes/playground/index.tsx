import { component$ } from '@builder.io/qwik';

export default component$(() => {
  return (
    <div class="relative">
      <iframe class="fixed inset-0 top-1 w-full h-full" src="https://mitosis-three.vercel.app/" />
    </div>
  );
});
