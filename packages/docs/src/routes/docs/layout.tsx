import { component$, Slot } from '@builder.io/qwik';
import Sidebar from './sidebar';

export default component$(() => {
  return (
    <div class="flex items-start max-md:flex-col-reverse gap-8 max-md:mt-2">
      <div class="border-primary border-r min-h-screen border-opacity-50 max-md:border-0">
        <Sidebar class="sticky top-20 mt-24 max-md:mt-4" />
      </div>
      <div class="prose prose-invert p-8 max-md:px-4 lg:prose-xl min-w-0 max-w-full mt-8">
        <Slot />
      </div>
    </div>
  );
});
