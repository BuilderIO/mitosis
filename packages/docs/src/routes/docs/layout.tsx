import { component$, Slot } from '@builder.io/qwik';
import Sidebar from './sidebar';

export default component$(() => {
  return (
    <div class="flex items-start">
      <Sidebar class="sticky top-20" />
      <div class="prose-invert p-8 lg:prose-xl min-w-0">
        <Slot />
      </div>
    </div>
  );
});
