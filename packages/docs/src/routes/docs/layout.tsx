import { component$, Slot } from '@builder.io/qwik';
import { RightSidebar } from './right-sidebar';
import Sidebar from './sidebar';

export default component$(() => {
  return (
    <div class="flex items-start max-md:flex-col-reverse gap-8 max-md:mt-2">
      <div class="border-primary border-r min-h-screen border-opacity-50 max-md:border-r-0 sticky top-0 max-md:static max-md:top-none max-md:border-t max-md:self-stretch max-md:-m-4 max-md:px-4">
        <Sidebar class="sticky top-20 mt-24 max-md:mt-4" />
      </div>
      <div class="prose prose-invert p-8 max-md:px-4 lg:prose-xl min-w-0 max-md:max-w-full mt-8 mb-12 max-w-[900px]">
        <Slot />
      </div>
      <div class="border-primary border-r min-h-screen border-opacity-50 max-md:border-r-0 sticky top-0 max-md:hidden max-md:top-none max-md:border-t max-md:self-stretch max-md:-m-4 max-md:px-4">
        <RightSidebar class="sticky top-20 mt-24 max-md:mt-4" />
      </div>
    </div>
  );
});
