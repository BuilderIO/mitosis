import { component$, Slot } from '@builder.io/qwik';
import Sidebar from './sidebar';

export default component$(() => {
  return (
    <div class="flex items-start max-md:flex-col-reverse gap-8 mt-8 max-md:mt-2">
      <Sidebar class="sticky top-20 mt-24 max-md:mt-4" />
      <div class="prose prose-invert p-8 max-md:px-4 lg:prose-xl min-w-0 max-w-full">
        <Slot />
      </div>
    </div>
  );
});
