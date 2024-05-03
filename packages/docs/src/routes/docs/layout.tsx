import { component$, Slot } from '@builder.io/qwik';
import Sidebar from './sidebar';

export default component$(() => {
  return (
    <div class="flex items-start max-md:flex-col-reverse">
      <Sidebar class="sticky top-20" />
      <div class="prose prose-invert p-8 max-md:px-4 lg:prose-xl min-w-0 max-w-full">
        <Slot />
      </div>
    </div>
  );
});
